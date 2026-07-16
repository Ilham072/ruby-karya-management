<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Receipt;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PaymentController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search'));

        $payments = Payment::query()
            ->with([
                'invoice:id,project_id,invoice_number,total_amount,remaining_amount',
                'invoice.project:id,customer_id,name',
                'invoice.project.customer:id,name',
                'receipt:id,payment_id,receipt_number,status',
            ])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('reference_number', 'like', "%{$search}%")
                        ->orWhereHas('invoice', function ($query) use ($search) {
                            $query->where(
                                'invoice_number',
                                'like',
                                "%{$search}%"
                            );
                        })
                        ->orWhereHas(
                            'invoice.project',
                            function ($query) use ($search) {
                                $query->where(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                );
                            }
                        )
                        ->orWhereHas(
                            'invoice.project.customer',
                            function ($query) use ($search) {
                                $query->where(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                );
                            }
                        );
                });
            })
            ->latest('payment_date')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $invoices = Invoice::query()
            ->with([
                'project:id,customer_id,name',
                'project.customer:id,name',
            ])
            ->whereIn('status', [
                'published',
                'partial',
                'overdue',
            ])
            ->where('remaining_amount', '>', 0)
            ->orderByDesc('invoice_date')
            ->get([
                'id',
                'project_id',
                'invoice_number',
                'invoice_date',
                'due_date',
                'total_amount',
                'paid_amount',
                'remaining_amount',
                'status',
            ]);

        return Inertia::render('Payments/Create', [
            'invoices' => $invoices,
            'selectedInvoiceId' => $request->integer('invoice_id')
                ?: null,
            'defaultDate' => now()->toDateString(),
        ]);
    }

    /**
     * @throws Throwable
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'invoice_id' => ['required', 'exists:invoices,id'],
            'payment_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'payment_method' => [
                'required',
                Rule::in(['transfer', 'cash', 'other']),
            ],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'reference_number' => [
                'nullable',
                'string',
                'max:150',
            ],
            'proof_file' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:5120',
            ],
            'notes' => ['nullable', 'string'],
            'use_stamp' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $invoice = Invoice::query()
                ->lockForUpdate()
                ->findOrFail($validated['invoice_id']);

            if (
                ! in_array($invoice->status, [
                    'published',
                    'partial',
                    'overdue',
                ])
            ) {
                abort(
                    422,
                    'Invoice ini belum dapat menerima pembayaran.'
                );
            }

            $paymentAmount = (float) $validated['amount'];
            $remainingBeforePayment =
                (float) $invoice->remaining_amount;

            if ($paymentAmount > $remainingBeforePayment) {
                abort(
                    422,
                    'Jumlah pembayaran melebihi sisa invoice.'
                );
            }

            $proofPath = null;
            $proofFile = $request->file('proof_file');

            if ($proofFile && $proofFile->isValid()) {
                $extension = strtolower(
                $proofFile->getClientOriginalExtension() ?: 'jpg'
            );

                $fileName = now()->format('YmdHis')
                . '-'
                . Str::uuid()
                . '.'
                . $extension;

                $proofPath = 'payment-proofs/' . $fileName;

                $temporaryPath = $proofFile->getPathname();
                $fileContents = file_get_contents($temporaryPath);

            if ($fileContents === false) {
                return back()
                    ->withErrors([
                        'proof_file' => 'File bukti pembayaran gagal dibaca.',
                    ])
                    ->withInput();
            }

                $saved = Storage::disk('public')->put(
                    $proofPath,
                    $fileContents
                );

                if (!$saved) {
                    return back()
                        ->withErrors([
                            'proof_file' => 'File bukti pembayaran gagal disimpan.',
                        ])
                        ->withInput();
                }
            }


            $payment = Payment::create([
                'invoice_id' => $invoice->id,
                'payment_date' => $validated['payment_date'],
                'amount' => $paymentAmount,
                'payment_method' => $validated['payment_method'],
                'bank_name' => $validated['bank_name'] ?? null,
                'reference_number' =>
                    $validated['reference_number'] ?? null,
                'proof_file_path' => $proofPath,
                'notes' => $validated['notes'] ?? null,
                'status' => 'recorded',
                'created_by' => $request->user()->id,
            ]);

            $newPaidAmount =
                (float) $invoice->paid_amount + $paymentAmount;

            $newRemainingAmount = max(
                0,
                (float) $invoice->total_amount - $newPaidAmount
            );

            $invoice->update([
                'paid_amount' => $newPaidAmount,
                'remaining_amount' => $newRemainingAmount,
                'status' => $newRemainingAmount <= 0
                    ? 'paid'
                    : 'partial',
            ]);

            $receiptDate = $validated['payment_date'];
            $receiptYear = (int) date(
                'Y',
                strtotime($receiptDate)
            );

            $receiptSequence =
                $this->nextReceiptSequence($receiptYear);

            Receipt::create([
                'payment_id' => $payment->id,
                'receipt_number' => $this->generateReceiptNumber(
                    $receiptSequence,
                    $receiptDate
                ),
                'sequence_number' => $receiptSequence,
                'receipt_date' => $receiptDate,
                'amount' => $paymentAmount,
                'use_stamp' => $validated['use_stamp'],
                'pdf_file_path' => null,
                'status' => 'published',
                'published_by' => $request->user()->id,
            ]);
        });

        return redirect()
            ->route('payments.index')
            ->with(
                'success',
                'Pembayaran berhasil dicatat dan kwitansi telah diterbitkan.'
            );
    }

    private function nextReceiptSequence(int $year): int
    {
        $lastSequence = Receipt::query()
            ->whereYear('receipt_date', $year)
            ->lockForUpdate()
            ->max('sequence_number');

        return ((int) $lastSequence) + 1;
    }

    private function generateReceiptNumber(
        int $sequence,
        string $receiptDate
    ): string {
        $timestamp = strtotime($receiptDate);
        $month = (int) date('n', $timestamp);
        $year = date('Y', $timestamp);

        return sprintf(
            '%03d/KWT/TR/%s/%s',
            $sequence,
            $this->romanMonth($month),
            $year
        );
    }

    private function romanMonth(int $month): string
    {
        return [
            1 => 'I',
            2 => 'II',
            3 => 'III',
            4 => 'IV',
            5 => 'V',
            6 => 'VI',
            7 => 'VII',
            8 => 'VIII',
            9 => 'IX',
            10 => 'X',
            11 => 'XI',
            12 => 'XII',
        ][$month];
    }
}