import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    AtSign,
    Building2,
    CreditCard,
    FileSignature,
    Globe,
    Image,
    Landmark,
    Camera,
    Mail,
    MapPin,
    Phone,
    Save,
    Trash2,
    Upload,
    UserRound,
} from 'lucide-react';
import {
    ChangeEvent,
    FormEvent,
    useState,
} from 'react';

interface Company {
    id: number;
    company_name: string;
    director_name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    instagram: string | null;
    website: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_name: string | null;
    invoice_prefix: string;
    receipt_prefix: string;
    signature_file_path: string | null;
    stamp_file_path: string | null;
    signature_url: string | null;
    stamp_url: string | null;
}

interface Props {
    company: Company;
}

export default function CompanySettings({
    company,
}: Props) {
    const [signaturePreview, setSignaturePreview] =
        useState<string | null>(
            company.signature_url,
        );

    const [stampPreview, setStampPreview] =
        useState<string | null>(
            company.stamp_url,
        );

    const form = useForm({
        company_name: company.company_name ?? '',
        director_name: company.director_name ?? '',
        address: company.address ?? '',
        phone: company.phone ?? '',
        email: company.email ?? '',
        instagram: company.instagram ?? '',
        website: company.website ?? '',
        bank_name: company.bank_name ?? '',
        bank_account_number:
            company.bank_account_number ?? '',
        bank_account_name:
            company.bank_account_name ?? '',
        invoice_prefix:
            company.invoice_prefix ?? 'INV',
        receipt_prefix:
            company.receipt_prefix ?? 'KWT',
        signature_file: null as File | null,
        stamp_file: null as File | null,
        remove_signature: false,
        remove_stamp: false,
    });

    const selectSignature = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        form.setData('signature_file', file);
        form.setData('remove_signature', false);

        setSignaturePreview(
            URL.createObjectURL(file),
        );
    };

    const selectStamp = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        form.setData('stamp_file', file);
        form.setData('remove_stamp', false);

        setStampPreview(
            URL.createObjectURL(file),
        );
    };

    const removeSignature = () => {
        form.setData('signature_file', null);
        form.setData('remove_signature', true);
        setSignaturePreview(null);
    };

    const removeStamp = () => {
        form.setData('stamp_file', null);
        form.setData('remove_stamp', true);
        setStampPreview(null);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.post('/company-settings', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.setData('signature_file', null);
                form.setData('stamp_file', null);
                form.setData(
                    'remove_signature',
                    false,
                );
                form.setData('remove_stamp', false);
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pengaturan Perusahaan" />

            <section className="mb-7">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#b07e00]">
                    Khusus Super Admin
                </p>

                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Pengaturan Perusahaan
                </h1>

                <p className="mt-2 text-sm text-[#777]">
                    Kelola informasi CV Ruby Karya yang
                    ditampilkan pada invoice dan kwitansi.
                </p>
            </section>

            <form
                onSubmit={submit}
                className="space-y-6"
            >
                <SettingSection
                    title="Identitas Perusahaan"
                    description="Informasi utama perusahaan dan direktur."
                    icon={Building2}
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <TextField
                            label="Nama perusahaan"
                            icon={Building2}
                            value={
                                form.data.company_name
                            }
                            error={
                                form.errors.company_name
                            }
                            onChange={(value) =>
                                form.setData(
                                    'company_name',
                                    value,
                                )
                            }
                        />

                        <TextField
                            label="Nama direktur"
                            icon={UserRound}
                            value={
                                form.data.director_name
                            }
                            error={
                                form.errors.director_name
                            }
                            onChange={(value) =>
                                form.setData(
                                    'director_name',
                                    value,
                                )
                            }
                        />

                        <div className="md:col-span-2">
                            <TextAreaField
                                label="Alamat perusahaan"
                                icon={MapPin}
                                value={form.data.address}
                                error={form.errors.address}
                                onChange={(value) =>
                                    form.setData(
                                        'address',
                                        value,
                                    )
                                }
                            />
                        </div>
                    </div>
                </SettingSection>

                <SettingSection
                    title="Kontak dan Media"
                    description="Informasi kontak yang tampil pada dokumen."
                    icon={Phone}
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <TextField
                            label="WhatsApp"
                            icon={Phone}
                            value={form.data.phone}
                            error={form.errors.phone}
                            onChange={(value) =>
                                form.setData(
                                    'phone',
                                    value,
                                )
                            }
                        />

                        <TextField
                            label="Email"
                            type="email"
                            icon={Mail}
                            value={form.data.email}
                            error={form.errors.email}
                            onChange={(value) =>
                                form.setData(
                                    'email',
                                    value,
                                )
                            }
                        />

                        <TextField
                            label="Instagram"
                            icon={Camera}
                            value={form.data.instagram}
                            error={
                                form.errors.instagram
                            }
                            onChange={(value) =>
                                form.setData(
                                    'instagram',
                                    value,
                                )
                            }
                        />

                        <TextField
                            label="Website"
                            icon={Globe}
                            value={form.data.website}
                            error={form.errors.website}
                            onChange={(value) =>
                                form.setData(
                                    'website',
                                    value,
                                )
                            }
                        />
                    </div>
                </SettingSection>

                <SettingSection
                    title="Informasi Rekening"
                    description="Rekening tujuan pembayaran invoice."
                    icon={Landmark}
                >
                    <div className="grid gap-5 md:grid-cols-3">
                        <TextField
                            label="Nama bank"
                            icon={Landmark}
                            value={form.data.bank_name}
                            error={form.errors.bank_name}
                            onChange={(value) =>
                                form.setData(
                                    'bank_name',
                                    value,
                                )
                            }
                        />

                        <TextField
                            label="Nomor rekening"
                            icon={CreditCard}
                            value={
                                form.data
                                    .bank_account_number
                            }
                            error={
                                form.errors
                                    .bank_account_number
                            }
                            onChange={(value) =>
                                form.setData(
                                    'bank_account_number',
                                    value,
                                )
                            }
                        />

                        <TextField
                            label="Nama rekening"
                            icon={UserRound}
                            value={
                                form.data
                                    .bank_account_name
                            }
                            error={
                                form.errors
                                    .bank_account_name
                            }
                            onChange={(value) =>
                                form.setData(
                                    'bank_account_name',
                                    value,
                                )
                            }
                        />
                    </div>
                </SettingSection>

                <SettingSection
                    title="Format Dokumen"
                    description="Kode yang digunakan dalam nomor dokumen."
                    icon={AtSign}
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <TextField
                            label="Prefix invoice"
                            icon={AtSign}
                            value={
                                form.data.invoice_prefix
                            }
                            error={
                                form.errors.invoice_prefix
                            }
                            onChange={(value) =>
                                form.setData(
                                    'invoice_prefix',
                                    value.toUpperCase(),
                                )
                            }
                        />

                        <TextField
                            label="Prefix kwitansi"
                            icon={AtSign}
                            value={
                                form.data.receipt_prefix
                            }
                            error={
                                form.errors.receipt_prefix
                            }
                            onChange={(value) =>
                                form.setData(
                                    'receipt_prefix',
                                    value.toUpperCase(),
                                )
                            }
                        />
                    </div>
                </SettingSection>

                <SettingSection
                    title="Tanda Tangan dan Stempel"
                    description="Gunakan PNG transparan agar hasil PDF terlihat rapi."
                    icon={FileSignature}
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <ImageUploader
                            label="Tanda tangan direktur"
                            preview={signaturePreview}
                            error={
                                form.errors.signature_file
                            }
                            inputName="signature_file"
                            onChange={selectSignature}
                            onRemove={removeSignature}
                        />

                        <ImageUploader
                            label="Stempel perusahaan"
                            preview={stampPreview}
                            error={
                                form.errors.stamp_file
                            }
                            inputName="stamp_file"
                            onChange={selectStamp}
                            onRemove={removeStamp}
                        />
                    </div>
                </SettingSection>

                <div className="sticky bottom-4 z-20 flex justify-end rounded-2xl border border-black/10 bg-white/95 p-4 shadow-lg backdrop-blur">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffb800] px-6 py-3 text-sm font-black text-[#202020] transition hover:bg-[#e9a800] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />

                        {form.processing
                            ? 'Menyimpan...'
                            : 'Simpan Pengaturan'}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}

function SettingSection({
    title,
    description,
    icon: Icon,
    children,
}: {
    title: string;
    description: string;
    icon: typeof Building2;
    children: React.ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-black/[0.06] p-5">
                <div className="rounded-xl bg-[#fff4d2] p-3 text-[#b07e00]">
                    <Icon className="h-5 w-5" />
                </div>

                <div>
                    <h2 className="font-black">{title}</h2>
                    <p className="mt-1 text-xs text-[#888]">
                        {description}
                    </p>
                </div>
            </div>

            <div className="p-5">{children}</div>
        </section>
    );
}

function TextField({
    label,
    value,
    onChange,
    icon: Icon,
    type = 'text',
    error,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon: typeof Building2;
    type?: string;
    error?: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold">
                {label}
            </span>

            <div className="relative">
                <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />

                <input
                    type={type}
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    className="w-full rounded-xl border-black/10 py-2.5 pl-10 pr-3 text-sm focus:border-[#ffb800] focus:ring-[#ffb800]"
                />
            </div>

            {error && (
                <span className="mt-1 block text-xs text-red-600">
                    {error}
                </span>
            )}
        </label>
    );
}

function TextAreaField({
    label,
    value,
    onChange,
    icon: Icon,
    error,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon: typeof MapPin;
    error?: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold">
                {label}
            </span>

            <div className="relative">
                <Icon className="absolute left-3 top-3 h-4 w-4 text-[#999]" />

                <textarea
                    rows={4}
                    value={value}
                    onChange={(event) =>
                        onChange(event.target.value)
                    }
                    className="w-full rounded-xl border-black/10 py-2.5 pl-10 pr-3 text-sm focus:border-[#ffb800] focus:ring-[#ffb800]"
                />
            </div>

            {error && (
                <span className="mt-1 block text-xs text-red-600">
                    {error}
                </span>
            )}
        </label>
    );
}

function ImageUploader({
    label,
    preview,
    error,
    inputName,
    onChange,
    onRemove,
}: {
    label: string;
    preview: string | null;
    error?: string;
    inputName: string;
    onChange: (
        event: ChangeEvent<HTMLInputElement>,
    ) => void;
    onRemove: () => void;
}) {
    return (
        <div className="rounded-2xl border border-black/10 p-4">
            <p className="mb-3 text-sm font-black">
                {label}
            </p>

            <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-black/15 bg-[#fafafa] p-4">
                {preview ? (
                    <img
                        src={preview}
                        alt={label}
                        className="max-h-36 max-w-full object-contain"
                    />
                ) : (
                    <div className="text-center text-[#999]">
                        <Image className="mx-auto h-8 w-8" />
                        <p className="mt-2 text-xs">
                            Belum ada gambar
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#202020] px-4 py-2.5 text-xs font-bold text-white">
                    <Upload className="h-4 w-4" />
                    Pilih Gambar

                    <input
                        type="file"
                        name={inputName}
                        accept=".png,.jpg,.jpeg,.webp"
                        onChange={onChange}
                        className="hidden"
                    />
                </label>

                {preview && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                    </button>
                )}
            </div>

            <p className="mt-3 text-[11px] text-[#888]">
                PNG, JPG atau WEBP. Maksimal 2 MB.
            </p>

            {error && (
                <p className="mt-2 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}