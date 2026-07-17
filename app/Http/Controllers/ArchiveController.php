<?php

namespace App\Http\Controllers;

use App\Models\DocumentArchive;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Receipt;
use App\Services\DriveArchiveService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ArchiveController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim(
            (string) $request->input('search')
        );

        $type = trim(
            (string) $request->input('type')
        );

        $year = $request->integer('year');

        $allowedTypes = [
            'invoice',
            'receipt',
            'payment_proof',
        ];

        $archives = DocumentArchive::query()
            ->when(
                $search,
                fn ($query) => $this->applySearch(
                    $query,
                    $search
                )
            )
            ->when(
                in_array($type, $allowedTypes, true),
                fn ($query) =>
                    $query->where(
                        'document_type',
                        $type
                    )
            )
            ->when(
                $year > 0,
                fn ($query) =>
                    $query->whereYear(
                        'archived_at',
                        $year
                    )
            )
            ->latest('archived_at')
            ->latest('id')
            ->paginate(12)
            ->withQueryString();

        $archives->getCollection()->transform(
            function (DocumentArchive $archive) {
                $context = $this->documentContext(
                    $archive
                );

                $localExists =
                    $archive->local_file_path
                    && Storage::disk('public')->exists(
                        $archive->local_file_path
                    );

                return [
                    'id' => $archive->id,
                    'document_type' =>
                        $archive->document_type,
                    'document_id' =>
                        $archive->document_id,
                    'file_name' =>
                        $archive->file_name,
                    'local_file_path' =>
                        $archive->local_file_path,
                    'local_url' => $localExists
                        ? route(
                            'archives.open',
                            $archive
                        )
                        : null,
                    'local_exists' =>
                        (bool) $localExists,
                    'drive_file_id' =>
                        $archive->drive_file_id,
                    'drive_folder_id' =>
                        $archive->drive_folder_id,
                    'drive_url' =>
                        $archive->drive_url,
                    'is_synced' =>
                        ! empty(
                            $archive->drive_folder_id
                        ),
                    'mime_type' =>
                        $archive->mime_type,
                    'archived_at' =>
                        $archive->archived_at
                            ?->toISOString(),
                    'document_number' =>
                        $context['document_number'],
                    'project_name' =>
                        $context['project_name'],
                    'customer_name' =>
                        $context['customer_name'],
                ];
            }
        );

        $years = DocumentArchive::query()
            ->whereNotNull('archived_at')
            ->selectRaw(
                'YEAR(archived_at) as archive_year'
            )
            ->distinct()
            ->orderByDesc('archive_year')
            ->pluck('archive_year')
            ->map(fn ($item) => (int) $item)
            ->values();

        return Inertia::render('Archives/Index', [
            'archives' => $archives,
            'years' => $years,
            'filters' => [
                'search' => $search,
                'type' => $type,
                'year' => $year ?: null,
            ],
        ]);
    }

    public function open(
        DocumentArchive $archive
    ): StreamedResponse {
        $path = $archive->local_file_path;

        abort_unless(
            $path
            && Storage::disk('public')->exists($path),
            404,
            'File arsip tidak ditemukan.'
        );

        return Storage::disk('public')->response(
            $path,
            $archive->file_name,
            [
                'Content-Type' =>
                    $archive->mime_type
                        ?: 'application/octet-stream',
                'Content-Disposition' =>
                    'inline; filename="'
                    . $archive->file_name
                    . '"',
            ]
        );
    }

    public function sync(
        DocumentArchive $archive,
        DriveArchiveService $driveService
    ): RedirectResponse {
        $path = $archive->local_file_path;

        if (
            ! $path
            || ! Storage::disk('public')->exists($path)
        ) {
            return back()->with(
                'error',
                'File lokal tidak ditemukan.'
            );
        }

        $contents = Storage::disk('public')->get(
            $path
        );

        $documentDate = $this->documentDate(
            $archive
        );

        $drivePath = match (
            $archive->document_type
        ) {
            'invoice', 'receipt' =>
                $driveService->syncPdf(
                    documentType:
                        $archive->document_type,
                    fileName:
                        $archive->file_name,
                    contents: $contents,
                    documentDate:
                        $documentDate,
                ),

            'payment_proof' =>
                $driveService->syncPaymentProof(
                    fileName:
                        $archive->file_name,
                    contents: $contents,
                    paymentDate:
                        $documentDate,
                ),

            default => null,
        };

        if (! $drivePath) {
            return back()->with(
                'error',
                'Sinkronisasi gagal. Pastikan Google Drive aktif dan konfigurasinya benar.'
            );
        }

        $archive->update([
            'drive_folder_id' =>
                dirname($drivePath),
            'archived_at' => now(),
        ]);

        return back()->with(
            'success',
            'Dokumen berhasil disinkronkan ke Google Drive.'
        );
    }

    private function applySearch(
        $query,
        string $search
    ): void {
        $query->where(
            function ($query) use ($search) {
                $query
                    ->where(
                        'file_name',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'drive_file_id',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(function ($query) use (
                        $search
                    ) {
                        $query
                            ->where(
                                'document_type',
                                'invoice'
                            )
                            ->whereIn(
                                'document_id',
                                Invoice::query()
                                    ->select('id')
                                    ->where(
                                        'invoice_number',
                                        'like',
                                        "%{$search}%"
                                    )
                            );
                    })
                    ->orWhere(function ($query) use (
                        $search
                    ) {
                        $query
                            ->where(
                                'document_type',
                                'receipt'
                            )
                            ->whereIn(
                                'document_id',
                                Receipt::query()
                                    ->select('id')
                                    ->where(
                                        'receipt_number',
                                        'like',
                                        "%{$search}%"
                                    )
                            );
                    })
                    ->orWhere(function ($query) use (
                        $search
                    ) {
                        $query
                            ->where(
                                'document_type',
                                'payment_proof'
                            )
                            ->whereIn(
                                'document_id',
                                Payment::query()
                                    ->select('id')
                                    ->where(
                                        'reference_number',
                                        'like',
                                        "%{$search}%"
                                    )
                            );
                    });
            }
        );
    }

    private function documentContext(
        DocumentArchive $archive
    ): array {
        if (
            $archive->document_type === 'invoice'
        ) {
            $invoice = Invoice::query()
                ->with('project.customer')
                ->find($archive->document_id);

            return [
                'document_number' =>
                    $invoice?->invoice_number,
                'project_name' =>
                    $invoice?->project?->name,
                'customer_name' =>
                    $invoice?->project
                        ?->customer?->name,
            ];
        }

        if (
            $archive->document_type === 'receipt'
        ) {
            $receipt = Receipt::query()
                ->with(
                    'payment.invoice.project.customer'
                )
                ->find($archive->document_id);

            return [
                'document_number' =>
                    $receipt?->receipt_number,
                'project_name' =>
                    $receipt?->payment?->invoice
                        ?->project?->name,
                'customer_name' =>
                    $receipt?->payment?->invoice
                        ?->project?->customer?->name,
            ];
        }

        if (
            $archive->document_type
            === 'payment_proof'
        ) {
            $payment = Payment::query()
                ->with(
                    'invoice.project.customer'
                )
                ->find($archive->document_id);

            return [
                'document_number' =>
                    $payment?->reference_number
                    ?: $payment?->invoice
                        ?->invoice_number,
                'project_name' =>
                    $payment?->invoice
                        ?->project?->name,
                'customer_name' =>
                    $payment?->invoice
                        ?->project?->customer?->name,
            ];
        }

        return [
            'document_number' => null,
            'project_name' => null,
            'customer_name' => null,
        ];
    }

    private function documentDate(
        DocumentArchive $archive
    ): Carbon {
        if (
            $archive->document_type === 'invoice'
        ) {
            $date = Invoice::query()
                ->whereKey($archive->document_id)
                ->value('invoice_date');
        } elseif (
            $archive->document_type === 'receipt'
        ) {
            $date = Receipt::query()
                ->whereKey($archive->document_id)
                ->value('receipt_date');
        } elseif (
            $archive->document_type
            === 'payment_proof'
        ) {
            $date = Payment::query()
                ->whereKey($archive->document_id)
                ->value('payment_date');
        } else {
            $date = null;
        }

        return Carbon::parse(
            $date
                ?: $archive->archived_at
                ?: now()
        );
    }
}
