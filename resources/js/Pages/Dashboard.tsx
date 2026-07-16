import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BriefcaseBusiness,
    CircleDollarSign,
    FilePlus2,
    FileText,
    Plus,
    ReceiptText,
    WalletCards,
} from 'lucide-react';

interface Summary {
    total_projects: number;
    active_projects: number;
    total_invoices: number;
    outstanding_amount: number;
    total_payments: number;
}

interface Invoice {
    id: number;
    invoice_number: string;
    invoice_date: string;
    due_date: string | null;
    total_amount: number | string;
    remaining_amount: number | string;
    status: string;
    project_name: string;
    customer_name: string;
}

interface Payment {
    id: number;
    payment_date: string;
    amount: number | string;
    payment_method: string;
    invoice_number: string;
    project_name: string;
}

interface DashboardProps {
    summary: Summary;
    recentInvoices: Invoice[];
    recentPayments: Payment[];
}

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
    }).format(new Date(`${value}T00:00:00`));
};

const statusStyle: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    published: 'bg-blue-50 text-blue-700',
    partial: 'bg-amber-50 text-amber-700',
    paid: 'bg-emerald-50 text-emerald-700',
    overdue: 'bg-red-50 text-red-700',
    cancelled: 'bg-zinc-100 text-zinc-500',
};

const statusLabel: Record<string, string> = {
    draft: 'Draft',
    published: 'Terbit',
    partial: 'Dibayar Sebagian',
    paid: 'Lunas',
    overdue: 'Jatuh Tempo',
    cancelled: 'Dibatalkan',
};

export default function Dashboard({
    summary,
    recentInvoices,
    recentPayments,
}: DashboardProps) {
    const cards = [
        {
            label: 'Total Proyek',
            value: summary.total_projects,
            detail: `${summary.active_projects} proyek aktif`,
            icon: BriefcaseBusiness,
            color: 'bg-[#202020] text-[#ffb800]',
        },
        {
            label: 'Invoice Terbit',
            value: summary.total_invoices,
            detail: 'Tidak termasuk draft',
            icon: FileText,
            color: 'bg-[#ffb800] text-[#202020]',
        },
        {
            label: 'Total Pembayaran',
            value: currency(summary.total_payments),
            detail: 'Pembayaran tercatat',
            icon: WalletCards,
            color: 'bg-emerald-100 text-emerald-700',
        },
        {
            label: 'Sisa Tagihan',
            value: currency(summary.outstanding_amount),
            detail: 'Belum dibayar',
            icon: CircleDollarSign,
            color: 'bg-red-100 text-red-700',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#b07e00]">
                        Ringkasan Bisnis
                    </p>
                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                        Dashboard
                    </h1>
                    <p className="mt-2 text-sm text-[#777]">
                        Pantau proyek, invoice, dan pembayaran CV Ruby Karya.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/projects/create"
                        className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-bold hover:bg-black/5"
                    >
                        <Plus className="h-4 w-4" />
                        Proyek Baru
                    </Link>

                    <Link
                        href="/invoices/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#ffb800] px-4 py-3 text-sm font-black text-[#202020] hover:bg-[#efa900]"
                    >
                        <FilePlus2 className="h-4 w-4" />
                        Buat Invoice
                    </Link>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            key={card.label}
                            className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm"
                        >
                            <div className="mb-5 flex items-start justify-between">
                                <p className="text-sm font-bold text-[#666]">
                                    {card.label}
                                </p>
                                <div
                                    className={`rounded-xl p-2.5 ${card.color}`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>

                            <p className="break-words text-2xl font-black tracking-tight">
                                {card.value}
                            </p>
                            <p className="mt-2 text-xs text-[#888]">
                                {card.detail}
                            </p>
                        </article>
                    );
                })}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.65fr_1fr]">
                <article className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-5 sm:px-6">
                        <div>
                            <h2 className="font-black">Invoice Terbaru</h2>
                            <p className="mt-1 text-xs text-[#888]">
                                Lima invoice terakhir
                            </p>
                        </div>

                        <Link
                            href="/invoices"
                            className="flex items-center gap-1 text-xs font-black text-[#a97900] hover:text-[#202020]"
                        >
                            Lihat Semua
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {recentInvoices.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="Belum ada invoice"
                            description="Invoice yang dibuat akan tampil di bagian ini."
                        />
                    ) : (
                        <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full text-left">
                                    <thead className="bg-[#f7f7f5] text-[11px] uppercase tracking-wider text-[#777]">
                                        <tr>
                                            <th className="px-6 py-4">Invoice</th>
                                            <th className="px-4 py-4">Proyek</th>
                                            <th className="px-4 py-4">Jumlah</th>
                                            <th className="px-4 py-4">Status</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-black/[0.06]">
                                        {recentInvoices.map((invoice) => (
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
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-bold">
                                                        {invoice.project_name}
                                                    </p>
                                                    <p className="mt-1 text-xs text-[#888]">
                                                        {invoice.customer_name}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4 text-sm font-black">
                                                    {currency(
                                                        invoice.total_amount,
                                                    )}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <StatusBadge
                                                        status={invoice.status}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="divide-y divide-black/[0.06] md:hidden">
                                {recentInvoices.map((invoice) => (
                                    <div
                                        key={invoice.id}
                                        className="space-y-4 p-5"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-black">
                                                    {invoice.invoice_number}
                                                </p>
                                                <p className="mt-1 text-xs text-[#888]">
                                                    {date(invoice.invoice_date)}
                                                </p>
                                            </div>

                                            <StatusBadge
                                                status={invoice.status}
                                            />
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold">
                                                {invoice.project_name}
                                            </p>
                                            <p className="mt-1 text-xs text-[#888]">
                                                {invoice.customer_name}
                                            </p>
                                        </div>

                                        <div className="flex items-end justify-between border-t border-dashed border-black/10 pt-3">
                                            <span className="text-xs text-[#777]">
                                                Total Invoice
                                            </span>
                                            <span className="text-base font-black">
                                                {currency(
                                                    invoice.total_amount,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </article>

                <article className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-5">
                        <div>
                            <h2 className="font-black">Pembayaran Terbaru</h2>
                            <p className="mt-1 text-xs text-[#888]">
                                Transaksi yang baru dicatat
                            </p>
                        </div>

                        <ReceiptText className="h-5 w-5 text-[#b07e00]" />
                    </div>

                    {recentPayments.length === 0 ? (
                        <EmptyState
                            icon={WalletCards}
                            title="Belum ada pembayaran"
                            description="Pembayaran terbaru akan muncul di sini."
                        />
                    ) : (
                        <div className="divide-y divide-black/[0.06]">
                            {recentPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-start justify-between gap-3 p-5"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-black">
                                            {payment.invoice_number}
                                        </p>
                                        <p className="mt-1 truncate text-xs text-[#777]">
                                            {payment.project_name}
                                        </p>
                                        <p className="mt-2 text-[11px] text-[#999]">
                                            {date(payment.payment_date)} ·{' '}
                                            {payment.payment_method}
                                        </p>
                                    </div>

                                    <p className="shrink-0 text-sm font-black text-emerald-700">
                                        {currency(payment.amount)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </article>
            </section>
        </AuthenticatedLayout>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-black ${
                statusStyle[status] ?? 'bg-zinc-100 text-zinc-600'
            }`}
        >
            {statusLabel[status] ?? status}
        </span>
    );
}

function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof FileText;
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 rounded-2xl bg-[#fff4d2] p-4 text-[#b07e00]">
                <Icon className="h-6 w-6" />
            </div>
            <p className="font-black">{title}</p>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[#888]">
                {description}
            </p>
        </div>
    );
}