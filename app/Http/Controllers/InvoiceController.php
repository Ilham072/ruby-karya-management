<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search'));
        $status = trim((string) $request->input('status'));

        $invoices = Invoice::query()
            ->with([
                'project:id,customer_id,name,project_code',
                'project.customer:id,name',
            ])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('invoice_number', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('project', function ($query) use ($search) {
                            $query->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas(
                            'project.customer',
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
            ->when(
                in_array($status, [
                    'draft',
                    'published',
                    'partial',
                    'paid',
                    'overdue',
                    'cancelled',
                ]),
                fn ($query) => $query->where('status', $status)
            )
            ->latest('invoice_date')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create(): Response
    {
        $projects = Project::query()
            ->with('customer:id,name')
            ->whereIn('status', ['draft', 'active'])
            ->orderBy('name')
            ->get([
                'id',
                'customer_id',
                'project_code',
                'name',
                'job_type',
                'contract_value',
            ]);

        return Inertia::render('Invoices/Create', [
            'projects' => $projects,
            'defaultDate' => now()->toDateString(),
            'defaultDueDate' => now()->addDays(14)->toDateString(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'project_id' => ['required', 'exists:projects,id'],
            'invoice_date' => ['required', 'date'],
            'due_date' => [
                'nullable',
                'date',
                'after_or_equal:invoice_date',
            ],
            'term_number' => ['nullable', 'integer', 'min:1'],
            'description' => ['required', 'string'],
            'use_stamp' => ['required', 'boolean'],
            'action' => [
                'required',
                Rule::in(['draft', 'publish']),
            ],
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => [
                'required',
                'string',
                'max:255',
            ],
            'items.*.details' => ['nullable', 'string'],
            'items.*.quantity' => [
                'required',
                'numeric',
                'gt:0',
            ],
            'items.*.unit' => [
                'nullable',
                'string',
                'max:30',
            ],
            'items.*.unit_price' => [
                'required',
                'numeric',
                'min:0',
            ],
        ]);

        $shouldPublish =
            $validated['action'] === 'publish'
            && $request->user()->role === 'super_admin';

        DB::transaction(function () use (
            $validated,
            $request,
            $shouldPublish
        ) {
            $invoiceDate = $validated['invoice_date'];

            $sequenceNumber = $this->nextSequenceNumber(
                (int) date('Y', strtotime($invoiceDate))
            );

            $invoiceNumber = $this->generateInvoiceNumber(
                $sequenceNumber,
                $invoiceDate
            );

            $items = collect($validated['items'])
                ->values()
                ->map(function (array $item, int $index) {
                    $quantity = (float) $item['quantity'];
                    $unitPrice = (float) $item['unit_price'];

                    return [
                        'description' => $item['description'],
                        'details' => $item['details'] ?? null,
                        'quantity' => $quantity,
                        'unit' => $item['unit'] ?? null,
                        'unit_price' => $unitPrice,
                        'amount' => $quantity * $unitPrice,
                        'sort_order' => $index,
                    ];
                });

            $subtotal = (float) $items->sum('amount');

            $invoice = Invoice::create([
                'project_id' => $validated['project_id'],
                'invoice_number' => $invoiceNumber,
                'sequence_number' => $sequenceNumber,
                'invoice_date' => $validated['invoice_date'],
                'due_date' => $validated['due_date'] ?? null,
                'term_number' => $validated['term_number'] ?? null,
                'description' => $validated['description'],
                'subtotal' => $subtotal,
                'total_amount' => $subtotal,
                'paid_amount' => 0,
                'remaining_amount' => $subtotal,
                'status' => $shouldPublish
                    ? 'published'
                    : 'draft',
                'use_stamp' => $validated['use_stamp'],
                'published_at' => $shouldPublish ? now() : null,
                'published_by' => $shouldPublish
                    ? $request->user()->id
                    : null,
                'created_by' => $request->user()->id,
            ]);

            $invoice->items()->createMany($items->all());
        });

        return redirect()
            ->route('invoices.index')
            ->with('success', 'Invoice berhasil dibuat.');
    }

    public function publish(
        Request $request,
        Invoice $invoice
    ): RedirectResponse {
        abort_unless(
            $request->user()->role === 'super_admin',
            403
        );

        if ($invoice->status !== 'draft') {
            return back()->withErrors([
                'invoice' => 'Hanya invoice draft yang dapat diterbitkan.',
            ]);
        }

        $invoice->update([
            'status' => 'published',
            'published_at' => now(),
            'published_by' => $request->user()->id,
        ]);

        return back()->with(
            'success',
            'Invoice berhasil diterbitkan.'
        );
    }

    public function destroy(
        Request $request,
        Invoice $invoice
    ): RedirectResponse {
        if ($invoice->status !== 'draft') {
            return back()->withErrors([
                'invoice' => 'Hanya invoice draft yang dapat dihapus.',
            ]);
        }

        if (
            $request->user()->role !== 'super_admin'
            && $invoice->created_by !== $request->user()->id
        ) {
            abort(403);
        }

        $invoice->delete();

        return back()->with(
            'success',
            'Draft invoice berhasil dihapus.'
        );
    }

    private function nextSequenceNumber(int $year): int
    {
        $lastSequence = Invoice::query()
            ->whereYear('invoice_date', $year)
            ->lockForUpdate()
            ->max('sequence_number');

        return ((int) $lastSequence) + 1;
    }

    private function generateInvoiceNumber(
        int $sequence,
        string $invoiceDate
    ): string {
        $timestamp = strtotime($invoiceDate);
        $month = (int) date('n', $timestamp);
        $year = date('Y', $timestamp);

        return sprintf(
            '%03d/INV/TR/%s/%s',
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