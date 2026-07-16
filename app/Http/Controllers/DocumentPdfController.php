<?php

namespace App\Http\Controllers;

use App\Models\DocumentArchive;
use App\Models\Invoice;
use App\Models\Receipt;
use App\Support\NumberToWords;
use App\Services\DriveArchiveService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DocumentPdfController extends Controller
{
    public function invoice(Invoice $invoice)
    {
        $invoice->load([
            'items',
            'project.customer',
            'creator',
            'publisher',
        ]);

        $company = DB::table('company_settings')
            ->first();

        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'company' => $company,
            'logoData' => $this->logoData(),
            'terbilang' => NumberToWords::rupiah(
                $invoice->total_amount
            ),
        ])->setPaper('a4');

        $content = $pdf->output();

        $fileName = $this->safeFilename(
            'Invoice-'.$invoice->invoice_number
        ).'.pdf';

        $drivePath = $this->driveArchiveService->syncPdf(
            documentType: 'invoice',
            fileName: $fileName,
            contents: $content,
            documentDate: $invoice->invoice_date,
        );

        $year = $invoice->invoice_date->format('Y');

        $path = "documents/invoices/{$year}/{$fileName}";

        Storage::disk('public')->put($path, $content);

        $archive = DocumentArchive::updateOrCreate(
            [
                'document_type' => 'invoice',
                'document_id' => $invoice->id,
            ],
            [
                'file_name' => $fileName,
                'local_file_path' => $path,
                'mime_type' => 'application/pdf',
                'archived_at' => now(),
                'created_by' => auth()->id(),
            ]
        );

        if ($drivePath) {
            $archive->update([
                'drive_folder_id' => dirname($drivePath),
                'archived_at' => now(),
            ]);
        }

        return Storage::disk('public')->response(
            $path,
            $fileName,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' =>
                    'inline; filename="'.$fileName.'"',
            ]
        );
    }

    public function receipt(Receipt $receipt)
    {
        $receipt->load([
            'payment.invoice.project.customer',
            'payment.creator',
            'publisher',
        ]);

        $company = DB::table('company_settings')
            ->first();

        $pdf = Pdf::loadView('pdf.receipt', [
            'receipt' => $receipt,
            'company' => $company,
            'logoData' => $this->logoData(),
            'terbilang' => NumberToWords::rupiah(
                $receipt->amount
            ),
        ])->setPaper('a4');

        $content = $pdf->output();

        $fileName = $this->safeFilename(
            'Kwitansi-'.$receipt->receipt_number
        ).'.pdf';

        $drivePath = $this->driveArchiveService->syncPdf(
            documentType: 'receipt',
            fileName: $fileName,
            contents: $content,
            documentDate: $receipt->receipt_date,
        );

        $year = $receipt->receipt_date->format('Y');

        $path = "documents/receipts/{$year}/{$fileName}";

        Storage::disk('public')->put($path, $content);

        $receipt->update([
            'pdf_file_path' => $path,
        ]);

        $archive = DocumentArchive::updateOrCreate(
            [
                'document_type' => 'receipt',
                'document_id' => $receipt->id,
            ],
            [
                'file_name' => $fileName,
                'local_file_path' => $path,
                'mime_type' => 'application/pdf',
                'archived_at' => now(),
                'created_by' => auth()->id(),
            ]
        );

        if ($drivePath) {
            $archive->update([
                'drive_folder_id' => dirname($drivePath),
                'archived_at' => now(),
            ]);
        }

        return Storage::disk('public')->response(
            $path,
            $fileName,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' =>
                    'inline; filename="'.$fileName.'"',
            ]
        );
    }

    private function logoData(): ?string
    {
        $path = public_path(
            'images/ruby-karya-logo.png'
        );

        if (! is_file($path)) {
            return null;
        }

        return sprintf(
            'data:image/png;base64,%s',
            base64_encode(file_get_contents($path))
        );
    }

    private function safeFilename(string $value): string
    {
        return preg_replace(
            '/[^A-Za-z0-9\-_]+/',
            '-',
            $value
        ) ?: 'dokumen';
    }

    public function __construct(
        private readonly DriveArchiveService $driveArchiveService
    ) {
    }
}