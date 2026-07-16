<?php

namespace App\Services;

use Carbon\CarbonInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class DriveArchiveService
{
    public function syncPdf(
        string $documentType,
        string $fileName,
        string $contents,
        CarbonInterface $documentDate
    ): ?string {
        if (!config('services.google_drive_sync.enabled')) {
            return null;
        }

        $folder = match ($documentType) {
            'invoice' => 'Invoice',
            'receipt' => 'Kwitansi',
            default => 'Dokumen',
        };

        $safeFileName = preg_replace(
            '/[\\\\\/:*?"<>|]+/',
            '-',
            $fileName
        );

        $relativePath = sprintf(
            '%s/%s/%s/%s',
            $folder,
            $documentDate->format('Y'),
            $documentDate->format('m'),
            $safeFileName
        );

        try {
            Storage::disk('google_drive_sync')->put(
                $relativePath,
                $contents
            );

            return $relativePath;
        } catch (Throwable $exception) {
            Log::error('Sinkronisasi arsip Google Drive gagal.', [
                'document_type' => $documentType,
                'file_name' => $safeFileName,
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
    }
}