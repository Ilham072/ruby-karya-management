import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    BriefcaseBusiness,
    FileText,
    ReceiptText,
    Stamp,
    Upload,
    UserRound,
} from 'lucide-react';
import { FormEvent, ReactNode } from 'react';

interface InvoiceOption {
    id: number;
    invoice_number: string;
    invoice_date: string;
    due_date: string | null;
    total_amount: number | string;
    paid_amount: number | string;
    remaining_amount: number | string;
    status: string;
    project: {
        id: number;
        name: string;
        customer: {
            id: number;
            name: string;
        };
    };
}

interface Props {
    invoices: InvoiceOption[];
    selectedInvoiceId: number | null;
    defaultDate: string;
}

const currency = (value: number | string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

export default function Create({
    invoices,
    selectedInvoiceId,
    defaultDate,
}: Props) {
    const form = useForm({
        invoice_id: selectedInvoiceId
            ? String(selectedInvoiceId)
            : '',
        payment_date: defaultDate,
        amount: '',
        payment_method: 'transfer',
        bank_name: 'BRI',
        reference_number: '',
        proof_file: null as File | null,
        notes: '',
        use_stamp: false,
    });

    const selectedInvoice = invoices.find(
        (invoice) => String(invoice.id) === form.data.invoice_id,
    );

    const submittedAmount = Number(form.data.amount || 0);
    const remainingAfterPayment = selectedInvoice
        ? Number(selectedInvoice.remaining_amount) - submittedAmount
        : 0;

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (
            selectedInvoice &&
            submittedAmount >
                Number(selectedInvoice.remaining_amount)
        ) {
            form.setError(
                'amount',
                'Jumlah pembayaran melebihi sisa invoice.',
            );
            return;
        }

        form.post('/payments', {
            forceFormData: true,
            preserveScroll: true,    
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Catat Pembayaran" />

            <section className="mb-7">
                <Link
                    href="/payments"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#666]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Pembayaran
                </Link>

                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#b07e00]">
                    Transaksi Baru
                </p>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Catat Pembayaran
                </h1>
                <p className="mt-2 text-sm text-[#777]">
                    Kwitansi otomatis terbit setelah pembayaran
                    disimpan.
                </p>
            </section>

            {invoices.length === 0 ? (
                <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                    <h2 className="font-black text-amber-900">
                        Tidak ada invoice yang dapat dibayar
                    </h2>
                    <p className="mt-2 text-sm text-amber-800">
                        Invoice harus diterbitkan dan masih memiliki
                        sisa tagihan.
                    </p>
                    <Link
                        href="/invoices"
                        className="mt-4 inline-flex rounded-xl bg-[#202020] px-4 py-3 text-sm font-bold text-white"
                    >
                        Buka Halaman Invoice
                    </Link>
                </section>
            ) : (
                <form
                    onSubmit={submit}
                    className="grid gap-6 xl:grid-cols-[1fr_340px]"
                >
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
                            <SectionTitle
                                number="01"
                                title="Pilih Invoice"
                            />

                            <div className="mt-6">
                                <Field
                                    label="Invoice"
                                    required
                                    error={form.errors.invoice_id}
                                >
                                    <select
                                        value={form.data.invoice_id}
                                        onChange={(event) => {
                                            form.setData(
                                                'invoice_id',
                                                event.target.value,
                                            );
                                            form.clearErrors('amount');
                                        }}
                                        className="form-input"
                                    >
                                        <option value="">
                                            Pilih invoice
                                        </option>
                                        {invoices.map((invoice) => (
                                            <option
                                                key={invoice.id}
                                                value={invoice.id}
                                            >
                                                {
                                                    invoice.invoice_number
                                                }{' '}
                                                - {invoice.project.name} -
                                                Sisa{' '}
                                                {currency(
                                                    invoice.remaining_amount,
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            {selectedInvoice && (
                                <div className="mt-5 grid gap-4 rounded-2xl bg-[#f7f7f5] p-4 sm:grid-cols-2">
                                    <Info
                                        icon={
                                            <FileText className="h-4 w-4" />
                                        }
                                        label="Nomor invoice"
                                        value={
                                            selectedInvoice.invoice_number
                                        }
                                    />
                                    <Info
                                        icon={
                                            <BriefcaseBusiness className="h-4 w-4" />
                                        }
                                        label="Proyek"
                                        value={
                                            selectedInvoice.project.name
                                        }
                                    />
                                    <Info
                                        icon={
                                            <UserRound className="h-4 w-4" />
                                        }
                                        label="Pelanggan"
                                        value={
                                            selectedInvoice.project
                                                .customer.name
                                        }
                                    />
                                    <Info
                                        icon={
                                            <Banknote className="h-4 w-4" />
                                        }
                                        label="Sisa invoice"
                                        value={currency(
                                            selectedInvoice.remaining_amount,
                                        )}
                                    />
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
                            <SectionTitle
                                number="02"
                                title="Informasi Pembayaran"
                            />

                            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                <Field
                                    label="Tanggal pembayaran"
                                    required
                                    error={form.errors.payment_date}
                                >
                                    <input
                                        type="date"
                                        value={form.data.payment_date}
                                        onChange={(event) =>
                                            form.setData(
                                                'payment_date',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                    />
                                </Field>

                                <Field
                                    label="Jumlah pembayaran"
                                    required
                                    error={form.errors.amount}
                                >
                                    <input
                                        type="number"
                                        min="1"
                                        max={
                                            selectedInvoice
                                                ? Number(
                                                      selectedInvoice.remaining_amount,
                                                  )
                                                : undefined
                                        }
                                        value={form.data.amount}
                                        onChange={(event) => {
                                            form.setData(
                                                'amount',
                                                event.target.value,
                                            );
                                            form.clearErrors('amount');
                                        }}
                                        className="form-input"
                                        placeholder="0"
                                    />
                                </Field>

                                <Field
                                    label="Metode pembayaran"
                                    required
                                    error={form.errors.payment_method}
                                >
                                    <select
                                        value={
                                            form.data.payment_method
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'payment_method',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                    >
                                        <option value="transfer">
                                            Transfer
                                        </option>
                                        <option value="cash">
                                            Tunai
                                        </option>
                                        <option value="other">
                                            Lainnya
                                        </option>
                                    </select>
                                </Field>

                                <Field
                                    label="Nama bank"
                                    error={form.errors.bank_name}
                                >
                                    <input
                                        value={form.data.bank_name}
                                        onChange={(event) =>
                                            form.setData(
                                                'bank_name',
                                                event.target.value,
                                            )
                                        }
                                        disabled={
                                            form.data.payment_method ===
                                            'cash'
                                        }
                                        className="form-input disabled:bg-black/5"
                                        placeholder="Contoh: BRI"
                                    />
                                </Field>

                                <div className="sm:col-span-2">
                                    <Field
                                        label="Nomor referensi"
                                        error={
                                            form.errors.reference_number
                                        }
                                    >
                                        <input
                                            value={
                                                form.data
                                                    .reference_number
                                            }
                                            onChange={(event) =>
                                                form.setData(
                                                    'reference_number',
                                                    event.target.value,
                                                )
                                            }
                                            className="form-input"
                                            placeholder="Nomor transaksi atau referensi transfer"
                                        />
                                    </Field>
                                </div>
                            </div>

                            <div className="mt-5">
                                <Field
                                    label="Catatan"
                                    error={form.errors.notes}
                                >
                                    <textarea
                                        rows={3}
                                        value={form.data.notes}
                                        onChange={(event) =>
                                            form.setData(
                                                'notes',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input resize-none"
                                        placeholder="Catatan pembayaran jika diperlukan"
                                    />
                                </Field>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
                            <SectionTitle
                                number="03"
                                title="Dokumen Pendukung"
                            />

                            <div className="mt-6">
                                <Field
                                    label="Bukti pembayaran"
                                    error={form.errors.proof_file}
                                >
                                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 px-5 py-8 text-center hover:border-[#ffb800] hover:bg-[#fffaf0]">
                                        <Upload className="mb-3 h-6 w-6 text-[#b07e00]" />
                                        <span className="text-sm font-black">
                                            {form.data.proof_file
                                                ? form.data.proof_file
                                                      .name
                                                : 'Pilih bukti pembayaran'}
                                        </span>
                                        <span className="mt-1 text-xs text-[#888]">
                                            JPG, PNG, atau PDF maksimal 5
                                            MB
                                        </span>
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            className="hidden"
                                            onChange={(event) =>
                                                form.setData(
                                                    'proof_file',
                                                    event.target
                                                        .files?.[0] ??
                                                        null,
                                                )
                                            }
                                        />
                                    </label>
                                </Field>
                            </div>

                            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-black/[0.08] p-4">
                                <input
                                    type="checkbox"
                                    checked={form.data.use_stamp}
                                    onChange={(event) =>
                                        form.setData(
                                            'use_stamp',
                                            event.target.checked,
                                        )
                                    }
                                    className="mt-1 rounded border-black/20 text-[#ffb800] focus:ring-[#ffb800]"
                                />
                                <Stamp className="h-5 w-5 text-[#b07e00]" />
                                <div>
                                    <p className="text-sm font-black">
                                        Gunakan stempel pada kwitansi
                                    </p>
                                    <p className="mt-1 text-xs text-[#888]">
                                        Pilihan ini disimpan untuk
                                        pembuatan PDF kwitansi.
                                    </p>
                                </div>
                            </label>
                        </section>
                    </div>

                    <aside className="xl:sticky xl:top-28 xl:self-start">
                        <section className="rounded-2xl bg-[#202020] p-5 text-white shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-[#ffb800] p-2.5 text-[#202020]">
                                    <ReceiptText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-black">
                                        Ringkasan Pembayaran
                                    </p>
                                    <p className="mt-1 text-xs text-white/50">
                                        Kwitansi terbit otomatis
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                <Summary
                                    label="Sisa sebelum bayar"
                                    value={
                                        selectedInvoice
                                            ? currency(
                                                  selectedInvoice.remaining_amount,
                                              )
                                            : '-'
                                    }
                                />
                                <Summary
                                    label="Pembayaran"
                                    value={currency(submittedAmount)}
                                />
                            </div>

                            <div className="mt-6 border-t border-white/10 pt-5">
                                <p className="text-xs text-white/55">
                                    Sisa setelah pembayaran
                                </p>
                                <p
                                    className={`mt-2 text-2xl font-black ${
                                        remainingAfterPayment < 0
                                            ? 'text-red-400'
                                            : 'text-[#ffb800]'
                                    }`}
                                >
                                    {selectedInvoice
                                        ? currency(
                                              remainingAfterPayment,
                                          )
                                        : currency(0)}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    form.processing ||
                                    !selectedInvoice ||
                                    submittedAmount <= 0 ||
                                    remainingAfterPayment < 0
                                }
                                className="mt-6 w-full rounded-xl bg-[#ffb800] px-4 py-3 text-sm font-black text-[#202020] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Menyimpan...'
                                    : 'Simpan Pembayaran'}
                            </button>

                            <p className="mt-4 text-center text-[11px] leading-5 text-white/45">
                                Setelah disimpan, saldo invoice dan
                                kwitansi akan diperbarui otomatis.
                            </p>
                        </section>
                    </aside>
                </form>
            )}
        </AuthenticatedLayout>
    );
}

function SectionTitle({
    number,
    title,
}: {
    number: string;
    title: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ffb800] text-xs font-black">
                {number}
            </span>
            <h2 className="font-black">{title}</h2>
        </div>
    );
}

function Field({
    label,
    required = false,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </span>
            {children}
            {error && (
                <span className="mt-1.5 block text-xs font-semibold text-red-600">
                    {error}
                </span>
            )}
        </label>
    );
}

function Info({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <span className="mt-0.5 text-[#b07e00]">{icon}</span>
            <div>
                <p className="text-[10px] uppercase text-[#888]">
                    {label}
                </p>
                <p className="mt-1 text-sm font-bold">{value}</p>
            </div>
        </div>
    );
}

function Summary({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex justify-between gap-4 text-sm">
            <span className="text-white/55">{label}</span>
            <span className="text-right font-bold">{value}</span>
        </div>
    );
}