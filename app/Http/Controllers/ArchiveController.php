<?php

namespace App\Http\Controllers;

use App\Models\DocumentArchive;
use App\Models\Invoice;
use App\Models\Receipt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ArchiveController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search'));
        $type = trim((string) $request->input('type'));

        $archives = DocumentArchive::query()
            ->when($search, function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
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
                        );
                });
            })
            ->when(
                in_array($type, ['invoice', 'receipt']),
                fn ($query) =>
                    $query->where('document_type', $type)
            )
            ->latest('archived_at')
            ->paginate(12)
            ->withQueryString();

        $archives->getCollection()->transform(
            function (DocumentArchive $archive) {
                $context = $this->documentContext($archive);

                return [
                    'id' => $archive->id,
                    'document_type' =>
                        $archive->document_type,
                    'document_id' =>
                        $archive->document_id,
                    'file_name' => $archive->file_name,
                    'local_file_path' =>
                        $archive->local_file_path,
                    'local_url' =>
                        $archive->local_file_path
                            ? Storage::disk('public')->url(
                                $archive->local_file_path
                            )
                            : null,
                    'drive_file_id' =>
                        $archive->drive_file_id,
                    'drive_url' => $archive->drive_url,
                    'mime_type' => $archive->mime_type,
                    'archived_at' =>
                        $archive->archived_at?->toISOString(),
                    'document_number' =>
                        $context['document_number'],
                    'project_name' =>
                        $context['project_name'],
                    'customer_name' =>
                        $context['customer_name'],
                ];
            }
        );

        return Inertia::render('Archives/Index', [
            'archives' => $archives,
            'filters' => [
                'search' => $search,
                'type' => $type,
            ],
        ]);
    }

    private function documentContext(
        DocumentArchive $archive
    ): array {
        if ($archive->document_type === 'invoice') {
            $invoice = Invoice::query()
                ->with('project.customer')
                ->find($archive->document_id);

            return [
                'document_number' =>
                    $invoice?->invoice_number,
                'project_name' =>
                    $invoice?->project?->name,
                'customer_name' =>
                    $invoice?->project?->customer?->name,
            ];
        }

        if ($archive->document_type === 'receipt') {
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

        return [
            'document_number' => null,
            'project_name' => null,
            'customer_name' => null,
        ];
    }
}