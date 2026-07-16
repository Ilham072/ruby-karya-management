import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Download,
    FileClock,
    ReceiptText,
    Search,
    Stamp,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Receipt {
    id: number;
    receipt_number: string;
    receipt_date: string;
    amount: number | string;
    use_stamp: boolean;
    pdf_file_path: string | null;
    status: string;
    payment: {
        id: number;
        payment_date: string;
        amount: number | string;
        payment_method: string;
        invoice: {
            id: number;
            invoice_number: string;
            project: {
                id: number;
                name: string;
                customer: {
                    id: number;
                    name: string;
                };
            };
        };
    };
}

interface PaginatedReceipts {
    data: Receipt[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    receipts: PaginatedReceipts;
    filters: {
        search?: string;
    };
}

const currency = (value: number | string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value ?? 0));

const date = (value: string) =>
    new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(`${value.substring(0, 10)}T00:00:00`));

export default function Index({ receipts, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/receipts',
            { search },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kwitansi" />

            <section className="mb-7">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#b07e00]">
                    Dokumen Pembayaran
                </p>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Kwitansi
                </h1>
                <p className="mt-2 text-sm text-[#777]">
                    Kwitansi diterbitkan otomatis untuk setiap
                    pembayaran.
                </p>
            </section>

            <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-black/[0.06] p-5 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-black">Daftar Kwitansi</h2>
                        <p className="mt-1 text-xs text-[#888]">
                            Total {receipts.total} kwitansi
                        </p>
                    </div>

                    <form
                        onSubmit={submitSearch}
                        className="flex w-full gap-2 sm:max-w-md"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari nomor kwitansi..."
                                className="w-full rounded-xl border-black/10 py-2.5 pl-10 pr-3 text-sm focus:border-[#ffb800] focus:ring-[#ffb800]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="rounded-xl bg-[#202020] px-4 text-sm font-bold text-white"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {receipts.data.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                        <div className="mb-4 rounded-2xl bg-[#fff4d2] p-4 text-[#b07e00]">
                            <ReceiptText className="h-7 w-7" />
                        </div>
                        <p className="font-black">
                            Belum ada kwitansi
                        </p>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-[#888]">
                            Kwitansi akan diterbitkan otomatis setelah
                            pembayaran dicatat.
                        </p>
                        <Link
                            href="/payments/create"
                            className="mt-5 rounded-xl bg-[#ffb800] px-4 py-2.5 text-sm font-black"
                        >
                            Catat Pembayaran
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left">
                                <thead className="bg-[#f7f7f5] text-[11px] uppercase tracking-wider text-[#777]">
                                    <tr>
                                        <th className="px-6 py-4">
                                            Nomor Kwitansi
                                        </th>
                                        <th className="px-4 py-4">
                                            Invoice
                                        </th>
                                        <th className="px-4 py-4">
                                            Pelanggan
                                        </th>
                                        <th className="px-4 py-4">
                                            Jumlah
                                        </th>
                                        <th className="px-4 py-4">
                                            Dokumen
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-black/[0.06]">
                                    {receipts.data.map((receipt) => (
                                        <tr
                                            key={receipt.id}
                                            className="hover:bg-[#fafaf8]"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-black">
                                                    {
                                                        receipt.receipt_number
                                                    }
                                                </p>
                                                <p className="mt-1 text-xs text-[#888]">
                                                    {date(
                                                        receipt.receipt_date,
                                                    )}
                                                </p>

                                                {receipt.use_stamp && (
                                                    <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                                                        <Stamp className="h-3 w-3" />
                                                        Dengan stempel
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-black">
                                                    {
                                                        receipt.payment
                                                            .invoice
                                                            .invoice_number
                                                    }
                                                </p>
                                                <p className="mt-1 text-xs text-[#888]">
                                                    {
                                                        receipt.payment
                                                            .invoice
                                                            .project.name
                                                    }
                                                </p>
                                            </td>

                                            <td className="px-4 py-4 text-sm font-semibold">
                                                {
                                                    receipt.payment
                                                        .invoice.project
                                                        .customer.name
                                                }
                                            </td>

                                            <td className="px-4 py-4 text-sm font-black text-emerald-700">
                                                {currency(
                                                    receipt.amount,
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                <a
                                                    href={`/receipts/${receipt.id}/pdf`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 text-xs font-bold hover:bg-black/5">
                                                    <Download className="h-4 w-4" />
                                                    Lihat PDF
                                                </a>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                {receipt.pdf_file_path ? (
                                                    <a
                                                        href={`/receipts/${receipt.id}/pdf`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#202020] px-4 py-3 text-sm font-bold text-white">
                                                        <Download className="h-4 w-4" />
                                                        Lihat PDF Kwitansi
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-[#aaa]">
                                                        Belum tersedia
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-4 p-4 md:hidden">
                            {receipts.data.map((receipt) => (
                                <article
                                    key={receipt.id}
                                    className="rounded-2xl border border-black/[0.08] p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-black">
                                                {
                                                    receipt.receipt_number
                                                }
                                            </p>
                                            <p className="mt-1 text-xs text-[#888]">
                                                {date(
                                                    receipt.receipt_date,
                                                )}
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                                            Terbit
                                        </span>
                                    </div>

                                    <div className="mt-4 border-t border-dashed border-black/10 pt-4">
                                        <p className="text-xs text-[#888]">
                                            Invoice
                                        </p>
                                        <p className="mt-1 text-sm font-black">
                                            {
                                                receipt.payment.invoice
                                                    .invoice_number
                                            }
                                        </p>
                                        <p className="mt-2 text-sm font-bold">
                                            {
                                                receipt.payment.invoice
                                                    .project.name
                                            }
                                        </p>
                                        <p className="mt-1 text-xs text-[#888]">
                                            {
                                                receipt.payment.invoice
                                                    .project.customer.name
                                            }
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-end justify-between rounded-xl bg-[#f7f7f5] p-3">
                                        <div>
                                            <p className="text-[10px] uppercase text-[#888]">
                                                Pembayaran
                                            </p>
                                            {receipt.use_stamp && (
                                                <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-700">
                                                    <Stamp className="h-3 w-3" />
                                                    Dengan stempel
                                                </p>
                                            )}
                                        </div>

                                        <p className="text-base font-black text-emerald-700">
                                            {currency(receipt.amount)}
                                        </p>
                                    </div>

                                    {receipt.pdf_file_path ? (
                                        <a
                                            href={`/storage/${receipt.pdf_file_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#202020] px-4 py-3 text-sm font-bold text-white"
                                        >
                                            <Download className="h-4 w-4" />
                                            Unduh PDF
                                        </a>
                                    ) : (
                                        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-center text-xs font-semibold text-slate-500">
                                            PDF belum dibuat
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    </>
                )}

                {receipts.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-black/[0.06] px-5 py-4">
                        <p className="text-xs text-[#777]">
                            Halaman {receipts.current_page} dari{' '}
                            {receipts.last_page}
                        </p>

                        <div className="flex gap-2">
                            <PageButton
                                url={receipts.prev_page_url}
                                direction="left"
                            />
                            <PageButton
                                url={receipts.next_page_url}
                                direction="right"
                            />
                        </div>
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
}

function PageButton({
    url,
    direction,
}: {
    url: string | null;
    direction: 'left' | 'right';
}) {
    const Icon =
        direction === 'left' ? ChevronLeft : ChevronRight;

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