import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    FileCheck2,
    Plus,
    ReceiptText,
    Search,
    WalletCards,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Payment {
    id: number;
    payment_date: string;
    amount: number | string;
    payment_method: string;
    bank_name: string | null;
    reference_number: string | null;
    notes: string | null;
    status: string;
    invoice: {
        id: number;
        invoice_number: string;
        total_amount: number | string;
        remaining_amount: number | string;
        project: {
            id: number;
            name: string;
            customer: {
                id: number;
                name: string;
            };
        };
    };
    receipt: {
        id: number;
        receipt_number: string;
        status: string;
    } | null;
}

interface PaginatedPayments {
    data: Payment[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    payments: PaginatedPayments;
    filters: {
        search?: string;
    };
}

const methodLabels: Record<string, string> = {
    transfer: 'Transfer',
    cash: 'Tunai',
    other: 'Lainnya',
};

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

export default function Index({ payments, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/payments',
            { search },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pembayaran" />

            <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#b07e00]">
                        Transaksi
                    </p>
                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                        Pembayaran
                    </h1>
                    <p className="mt-2 text-sm text-[#777]">
                        Catat pembayaran invoice dan terbitkan kwitansi.
                    </p>
                </div>

                <Link
                    href="/payments/create"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffb800] px-4 py-3 text-sm font-black text-[#202020]"
                >
                    <Plus className="h-4 w-4" />
                    Catat Pembayaran
                </Link>
            </section>

            <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-black/[0.06] p-5 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-black">Riwayat Pembayaran</h2>
                        <p className="mt-1 text-xs text-[#888]">
                            Total {payments.total} transaksi
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
                                placeholder="Cari invoice atau proyek..."
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

                {payments.data.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                        <div className="mb-4 rounded-2xl bg-[#fff4d2] p-4 text-[#b07e00]">
                            <WalletCards className="h-7 w-7" />
                        </div>
                        <p className="font-black">
                            Belum ada pembayaran
                        </p>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-[#888]">
                            Terbitkan invoice terlebih dahulu, kemudian
                            catat pembayarannya.
                        </p>
                        <Link
                            href="/payments/create"
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#ffb800] px-4 py-2.5 text-sm font-black"
                        >
                            <Plus className="h-4 w-4" />
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
                                            Pembayaran
                                        </th>
                                        <th className="px-4 py-4">
                                            Invoice
                                        </th>
                                        <th className="px-4 py-4">
                                            Proyek
                                        </th>
                                        <th className="px-4 py-4">
                                            Kwitansi
                                        </th>
                                        <th className="px-6 py-4 text-right">
                                            Jumlah
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-black/[0.06]">
                                    {payments.data.map((payment) => (
                                        <tr
                                            key={payment.id}
                                            className="hover:bg-[#fafaf8]"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-black">
                                                    {date(
                                                        payment.payment_date,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-xs text-[#888]">
                                                    {methodLabels[
                                                        payment
                                                            .payment_method
                                                    ] ??
                                                        payment.payment_method}
                                                    {payment.bank_name
                                                        ? ` · ${payment.bank_name}`
                                                        : ''}
                                                </p>
                                                {payment.reference_number && (
                                                    <p className="mt-1 text-[11px] text-[#999]">
                                                        Ref:{' '}
                                                        {
                                                            payment.reference_number
                                                        }
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-black">
                                                    {
                                                        payment.invoice
                                                            .invoice_number
                                                    }
                                                </p>
                                                <p className="mt-1 text-xs text-[#888]">
                                                    Sisa{' '}
                                                    {currency(
                                                        payment.invoice
                                                            .remaining_amount,
                                                    )}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-bold">
                                                    {
                                                        payment.invoice
                                                            .project.name
                                                    }
                                                </p>
                                                <p className="mt-1 text-xs text-[#888]">
                                                    {
                                                        payment.invoice
                                                            .project
                                                            .customer.name
                                                    }
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                {payment.receipt ? (
                                                    <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700">
                                                        <FileCheck2 className="h-4 w-4" />
                                                        {
                                                            payment.receipt
                                                                .receipt_number
                                                        }
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-[#999]">
                                                        Belum tersedia
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right text-sm font-black text-emerald-700">
                                                {currency(payment.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-4 p-4 md:hidden">
                            {payments.data.map((payment) => (
                                <article
                                    key={payment.id}
                                    className="rounded-2xl border border-black/[0.08] p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs text-[#888]">
                                                {date(
                                                    payment.payment_date,
                                                )}
                                            </p>
                                            <p className="mt-1 font-black">
                                                {
                                                    payment.invoice
                                                        .invoice_number
                                                }
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                                            Tercatat
                                        </span>
                                    </div>

                                    <div className="mt-4 border-t border-dashed border-black/10 pt-4">
                                        <p className="text-sm font-bold">
                                            {
                                                payment.invoice.project
                                                    .name
                                            }
                                        </p>
                                        <p className="mt-1 text-xs text-[#888]">
                                            {
                                                payment.invoice.project
                                                    .customer.name
                                            }
                                        </p>
                                    </div>

                                    <div className="mt-4 flex items-end justify-between rounded-xl bg-[#f7f7f5] p-3">
                                        <div>
                                            <p className="text-[10px] uppercase text-[#888]">
                                                Metode
                                            </p>
                                            <p className="mt-1 text-sm font-bold">
                                                {methodLabels[
                                                    payment.payment_method
                                                ] ??
                                                    payment.payment_method}
                                            </p>
                                        </div>

                                        <p className="text-base font-black text-emerald-700">
                                            {currency(payment.amount)}
                                        </p>
                                    </div>

                                    {payment.receipt && (
                                        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#b07e00]">
                                            <ReceiptText className="h-4 w-4" />
                                            {
                                                payment.receipt
                                                    .receipt_number
                                            }
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    </>
                )}

                {payments.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-black/[0.06] px-5 py-4">
                        <p className="text-xs text-[#777]">
                            Halaman {payments.current_page} dari{' '}
                            {payments.last_page}
                        </p>

                        <div className="flex gap-2">
                            <PageButton
                                url={payments.prev_page_url}
                                direction="left"
                            />
                            <PageButton
                                url={payments.next_page_url}
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