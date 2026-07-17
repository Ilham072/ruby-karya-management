<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CompanySettingController extends Controller
{
    public function edit(Request $request): Response
    {
        $this->ensureSuperAdmin($request);

        $company = CompanySetting::query()
            ->firstOrCreate(
                ['id' => 1],
                [
                    'company_name' => 'CV RUBY KARYA',
                    'director_name' => 'S. ADYANTO, SE',
                    'invoice_prefix' => 'INV',
                    'receipt_prefix' => 'KWT',
                ]
            );

        return Inertia::render(
            'Settings/Company',
            [
                'company' => [
                    ...$company->toArray(),
                    'signature_url' =>
                        $this->fileUrl(
                            $company->signature_file_path
                        ),
                    'stamp_url' =>
                        $this->fileUrl(
                            $company->stamp_file_path
                        ),
                ],
            ]
        );
    }

    public function update(
        Request $request
    ): RedirectResponse {
        $this->ensureSuperAdmin($request);

        $validated = $request->validate([
            'company_name' => [
                'required',
                'string',
                'max:150',
            ],
            'director_name' => [
                'required',
                'string',
                'max:150',
            ],
            'address' => [
                'nullable',
                'string',
            ],
            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],
            'email' => [
                'nullable',
                'email',
                'max:150',
            ],
            'instagram' => [
                'nullable',
                'string',
                'max:100',
            ],
            'website' => [
                'nullable',
                'string',
                'max:150',
            ],
            'bank_name' => [
                'nullable',
                'string',
                'max:100',
            ],
            'bank_account_number' => [
                'nullable',
                'string',
                'max:100',
            ],
            'bank_account_name' => [
                'nullable',
                'string',
                'max:150',
            ],
            'invoice_prefix' => [
                'required',
                'string',
                'max:20',
            ],
            'receipt_prefix' => [
                'required',
                'string',
                'max:20',
            ],
            'signature_file' => [
                'nullable',
                'file',
                'mimes:png,jpg,jpeg,webp',
                'max:2048',
            ],
            'stamp_file' => [
                'nullable',
                'file',
                'mimes:png,jpg,jpeg,webp',
                'max:2048',
            ],
            'remove_signature' => [
                'nullable',
                'boolean',
            ],
            'remove_stamp' => [
                'nullable',
                'boolean',
            ],
        ]);

        $company = CompanySetting::query()
            ->firstOrCreate(['id' => 1]);

        $signaturePath =
            $company->signature_file_path;

        $stampPath =
            $company->stamp_file_path;

        if ($request->boolean('remove_signature')) {
            $this->deleteFile($signaturePath);
            $signaturePath = null;
        }

        if ($request->boolean('remove_stamp')) {
            $this->deleteFile($stampPath);
            $stampPath = null;
        }

        if ($request->hasFile('signature_file')) {
            $newPath = $this->storeImage(
                $request,
                'signature_file',
                'company/signatures'
            );

            $this->deleteFile($signaturePath);
            $signaturePath = $newPath;
        }

        if ($request->hasFile('stamp_file')) {
            $newPath = $this->storeImage(
                $request,
                'stamp_file',
                'company/stamps'
            );

            $this->deleteFile($stampPath);
            $stampPath = $newPath;
        }

        $company->update([
            'company_name' =>
                $validated['company_name'],
            'director_name' =>
                $validated['director_name'],
            'address' =>
                $validated['address'] ?? null,
            'phone' =>
                $validated['phone'] ?? null,
            'email' =>
                $validated['email'] ?? null,
            'instagram' =>
                $validated['instagram'] ?? null,
            'website' =>
                $validated['website'] ?? null,
            'bank_name' =>
                $validated['bank_name'] ?? null,
            'bank_account_number' =>
                $validated['bank_account_number']
                    ?? null,
            'bank_account_name' =>
                $validated['bank_account_name']
                    ?? null,
            'invoice_prefix' => strtoupper(
                $validated['invoice_prefix']
            ),
            'receipt_prefix' => strtoupper(
                $validated['receipt_prefix']
            ),
            'signature_file_path' =>
                $signaturePath,
            'stamp_file_path' =>
                $stampPath,
        ]);

        return back()->with(
            'success',
            'Pengaturan perusahaan berhasil disimpan.'
        );
    }

    private function storeImage(
        Request $request,
        string $field,
        string $directory
    ): string {
        $file = $request->file($field);

        if (! $file || ! $file->isValid()) {
            throw ValidationException::withMessages([
                $field => 'File gambar tidak valid.',
            ]);
        }

        $extension = strtolower(
            $file->getClientOriginalExtension()
                ?: 'png'
        );

        $fileName = now()->format('YmdHis')
            . '-'
            . Str::uuid()
            . '.'
            . $extension;

        $path = $directory . '/' . $fileName;

        $contents = file_get_contents(
            $file->getPathname()
        );

        if ($contents === false) {
            throw ValidationException::withMessages([
                $field => 'File gambar gagal dibaca.',
            ]);
        }

        $saved = Storage::disk('public')->put(
            $path,
            $contents
        );

        if (! $saved) {
            throw ValidationException::withMessages([
                $field =>
                    'File gambar gagal disimpan.',
            ]);
        }

        return $path;
    }

    private function deleteFile(
        ?string $path
    ): void {
        if (
            $path
            && Storage::disk('public')->exists($path)
        ) {
            Storage::disk('public')->delete($path);
        }
    }

    private function fileUrl(
        ?string $path
    ): ?string {
        if (
            ! $path
            || ! Storage::disk('public')->exists($path)
        ) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }

    private function ensureSuperAdmin(
        Request $request
    ): void {
        abort_unless(
            $request->user()?->role
                === 'super_admin',
            403,
            'Pengaturan perusahaan hanya dapat diakses oleh Super Admin.'
        );
    }
}