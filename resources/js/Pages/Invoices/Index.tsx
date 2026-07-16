import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Download,
    FilePlus2,
    FileText,
    Search,
    Send,
    Trash2,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Invoice {
    id: number;
    invoice_number: string;
    invoice_date: string;
    due_date: string | null;
    term_number: number | null;
    total_amount: number | string;
    paid_amount: number | string;
    remaining_amount: number | string;
    status: string;
    project: {
        id: number;
        name: string;
        project_code: string | null;
        customer: {
            id: number;
            name: string;
        };
    };
}

interface PaginatedInvoices {
    data: Invoice[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    invoices: PaginatedInvoices;
    filters: {
        search?: string;
        status?: string;
    };
}

const statusLabels: Record<string, string> = {
    draft: 'Draft',
    published: 'Terbit',
    partial: 'Dibayar Sebagian',
    paid: 'Lunas',
    overdue: 'Jatuh Tempo',
    cancelled: 'Dibatalkan',
};

const statusStyles: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    published: 'bg-blue-50 text-blue-700',
    partial: 'bg-amber-50 text-amber-700',
    paid: 'bg-emerald-50 text-emerald-700',
    overdue: 'bg-red-50 text-red-700',
    cancelled: 'bg-zinc-100 text-zinc-500',
};

const currency = (value: number | string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const date = (value: string | null) => {
    if (!value) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(`${value.substring(0, 10)}T00:00:00`));
};

export default function Index({ invoices, filters }: Props) {
    const page = usePage();
    const user = (page.props as any).auth.user;
    const errors = (page.props as any).errors ?? {};

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const submitFilter = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/invoices',
            { search, status },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const publishInvoice = (invoice: Invoice) => {
        if (
            !window.confirm(
                `Terbitkan invoice ${invoice.invoice_number}? Setelah diterbitkan, invoice dapat menerima pembayaran.`,
            )
        ) {
            return;
        }

        router.patch(
            `/invoices/${invoice.id}/publish`,
            {},
            { preserveScroll: true },
        );
    };

    const deleteInvoice = (invoice: Invoice) => {
        if (
            !window.confirm(
                `Hapus draft invoice ${invoice.invoice_number}?`,
            )
        ) {
            return;
        }

        router.delete(`/invoices/${invoice.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Invoice" />

            <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#b07e00]">
                        Penagihan
                    </p>
                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                        Invoice
                    </h1>
                    <p className="mt-2 text-sm text-[#777]">
                        Kelola invoice, termin, dan status pembayaran.
                    </p>
                </div>

                <Link
                    href="/invoices/create"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffb800] px-4 py-3 text-sm font-black text-[#202020]"
                >
                    <FilePlus2 className="h-4 w-4" />
                    Buat Invoice
                </Link>
            </section>

            {errors.invoice && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {errors.invoice}
                </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-black/[0.06] p-5 lg:flex-row lg:items-center">
                    <div>
                        <h2 className="font-black">Daftar Invoice</h2>
                        <p className="mt-1 text-xs text-[#888]">
                            Total {invoices.total} invoice
                        </p>
                    </div>

                    <form
                        onSubmit={submitFilter}
                        className="flex flex-col gap-2 sm:flex-row"
                    >
                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                            className="rounded-xl border-black/10 text-sm focus:border-[#ffb800] focus:ring-[#ffb800]"
                        >
                            <option value="">Semua status</option>
                            <option value="draft">Draft</option>
                            <option value="published">Terbit</option>
                            <option value="partial">
                                Dibayar Sebagian
                            </option>
                            <option value="paid">Lunas</option>
                            <option value="overdue">
                                Jatuh Tempo
                            </option>
                            <option value="cancelled">
                                Dibatalkan
                            </option>
                        </select>

                        <div className="relative min-w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari invoice..."
                                className="w-full rounded-xl border-black/10 py-2.5 pl-10 pr-3 text-sm focus:border-[#ffb800] focus:ring-[#ffb800]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="rounded-xl bg-[#202020] px-4 py-2.5 text-sm font-bold text-white"
                        >
                            Terapkan
                        </button>
                    </form>
                </div>

                {invoices.data.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                        <div className="mb-4 rounded-2xl bg-[#fff4d2] p-4 text-[#b07e00]">
                            <FileText className="h-7 w-7" />
                        </div>
                        <p className="font-black">Belum ada invoice</p>
                        <p className="mt-2 max-w-sm text-sm text-[#888]">
                            Buat invoice pertama dari proyek yang sudah
                            terdaftar.
                        </p>
                        <Link
                            href="/invoices/create"
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#ffb800] px-4 py-2.5 text-sm font-black"
                        >
                            <FilePlus2 className="h-4 w-4" />
                            Buat Invoice
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left">
                                <thead className="bg-[#f7f7f5] text-[11px] uppercase tracking-wider text-[#777]">
                                    <tr>
                                        <th className="px-6 py-4">
                                            Nomor Invoice
                                        </th>
                                        <th className="px-4 py-4">
                                            Proyek
                                        </th>
                                        <th className="px-4 py-4">
                                            Tagihan
                                        </th>
                                        <th className="px-4 py-4">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-black/[0.06]">
                                    {invoices.data.map((invoice) => (
                                        <tr
                                            key={invoice.id}
                                            className="hover:bg-[#fafaf8]"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-black">
                                                    {
                                                        invoice.invoice_number
                                                    }
                                                </p>
                                                <p className="mt-1 text-xs text-[#888]">
                                                    {date(
                                                        invoice.invoice_date,
                                                    )}
                                                    {invoice.term_number
                                                        ? ` · Termin ${invoice.term_number}`
                                                        : ''}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-bold">
                                                    {
                                                        invoice.project
                                                            .name
                                                    }
                                                </p>
                                                <p className="mt-1 text-xs text-[#888]">
                                                    {
                                                        invoice.project
                                                            .customer.name
                                                    }
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-black">
                                                    {currency(
                                                        invoice.total_amount,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-xs text-[#888]">
                                                    Sisa{' '}
                                                    {currency(
                                                        invoice.remaining_amount,
                                                    )}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <StatusBadge
                                                    status={invoice.status}
                                                />
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <a
                                                        href={`/invoices/${invoice.id}/pdf`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-2.5 text-sm font-bold">
                                                        <Download className="h-4 w-4" />
                                                        Lihat PDF Invoice
                                                    </a>
                                                    {invoice.status ===
                                                        'draft' &&
                                                        user.role ===
                                                            'super_admin' && (
                                                            <button
                                                                type="button"
                                                                title="Terbitkan"
                                                                onClick={() =>
                                                                    publishInvoice(
                                                                        invoice,
                                                                    )
                                                                }
                                                                className="rounded-lg border border-amber-200 p-2 text-amber-700 hover:bg-amber-50"
                                                            >
                                                                <Send className="h-4 w-4" />
                                                            </button>
                                                        )}

                                                    {invoice.status ===
                                                        'draft' && (
                                                        <button
                                                            type="button"
                                                            title="Hapus draft"
                                                            onClick={() =>
                                                                deleteInvoice(
                                                                    invoice,
                                                                )
                                                            }
                                                            className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-4 p-4 md:hidden">
                            {invoices.data.map((invoice) => (
                                <article
                                    key={invoice.id}
                                    className="rounded-2xl border border-black/[0.08] p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-black">
                                                {invoice.invoice_number}
                                            </p>
                                            <p className="mt-1 text-xs text-[#888]">
                                                {date(
                                                    invoice.invoice_date,
                                                )}
                                            </p>
                                        </div>

                                        <StatusBadge
                                            status={invoice.status}
                                        />
                                    </div>

                                    <div className="mt-4 border-t border-dashed border-black/10 pt-4">
                                        <p className="font-bold">
                                            {invoice.project.name}
                                        </p>
                                        <p className="mt-1 text-xs text-[#888]">
                                            {
                                                invoice.project.customer
                                                    .name
                                            }
                                        </p>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#f7f7f5] p-3">
                                        <div>
                                            <p className="text-[10px] uppercase text-[#888]">
                                                Total
                                            </p>
                                            <p className="mt-1 text-sm font-black">
                                                {currency(
                                                    invoice.total_amount,
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-[10px] uppercase text-[#888]">
                                                Sisa
                                            </p>
                                            <p className="mt-1 text-sm font-black">
                                                {currency(
                                                    invoice.remaining_amount,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {invoice.status === 'draft' && (
                                        <div className="mt-4 flex gap-2">
                                            <a
                                                href={`/invoices/${invoice.id}/pdf`}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="Lihat PDF"
                                                className="rounded-lg border border-black/10 p-2 text-[#555] hover:bg-black/5">
                                                <Download className="h-4 w-4" />
                                            </a>
                                            {user.role ===
                                                'super_admin' && (
                                                    
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        publishInvoice(
                                                            invoice,
                                                        )
                                                    }
                                                    className="flex-1 rounded-xl bg-[#ffb800] px-3 py-2.5 text-sm font-black"
                                                >
                                                    Terbitkan
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    deleteInvoice(invoice)
                                                }
                                                className="rounded-xl border border-red-100 px-3 py-2.5 text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    </>
                )}

                {invoices.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-black/[0.06] px-5 py-4">
                        <p className="text-xs text-[#777]">
                            Halaman {invoices.current_page} dari{' '}
                            {invoices.last_page}
                        </p>

                        <div className="flex gap-2">
                            <PageButton
                                url={invoices.prev_page_url}
                                icon="left"
                            />
                            <PageButton
                                url={invoices.next_page_url}
                                icon="right"
                            />
                        </div>
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-black ${
                statusStyles[status] ?? 'bg-zinc-100 text-zinc-600'
            }`}
        >
            {statusLabels[status] ?? status}
        </span>
    );
}

function PageButton({
    url,
    icon,
}: {
    url: string | null;
    icon: 'left' | 'right';
}) {
    const Icon = icon === 'left' ? ChevronLeft : ChevronRight;

    if (!url) {
        return (
            <span className="rounded-lg border border-black/5 p-2 text-black/20">
                <Icon className="h-4 w-4" />
            </span>
        );
    }

    return (
        <Link
            href={url}
            preserveScroll
            className="rounded-lg border border-black/10 p-2 hover:bg-black/5"
        >
            <Icon className="h-4 w-4" />
        </Link>
    );
}