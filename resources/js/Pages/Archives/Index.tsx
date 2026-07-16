import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    ChevronLeft,
    ChevronRight,
    Cloud,
    Download,
    FileText,
    HardDrive,
    ReceiptText,
    Search,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface ArchiveItem {
    id: number;
    document_type: 'invoice' | 'receipt';
    document_id: number;
    file_name: string;
    local_file_path: string | null;
    local_url: string | null;
    drive_file_id: string | null;
    drive_url: string | null;
    mime_type: string | null;
    archived_at: string | null;
    document_number: string | null;
    project_name: string | null;
    customer_name: string | null;
}

interface PaginatedArchives {
    data: ArchiveItem[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    archives: PaginatedArchives;
    filters: {
        search?: string;
        type?: string;
    };
}

const dateTime = (value: string | null) => {
    if (!value) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

export default function Index({ archives, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [type, setType] = useState(filters.type ?? '');

    const submitFilter = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/archives',
            { search, type },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Arsip" />

            <section className="mb-7">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#b07e00]">
                    Dokumen Perusahaan
                </p>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Arsip
                </h1>
                <p className="mt-2 text-sm text-[#777]">
                    Cari kembali invoice dan kwitansi yang sudah dibuat.
                </p>
            </section>

            <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-black/[0.06] p-5 lg:flex-row lg:items-center">
                    <div>
                        <h2 className="font-black">Arsip Dokumen</h2>
                        <p className="mt-1 text-xs text-[#888]">
                            Total {archives.total} dokumen
                        </p>
                    </div>

                    <form
                        onSubmit={submitFilter}
                        className="flex flex-col gap-2 sm:flex-row"
                    >
                        <select
                            value={type}
                            onChange={(event) =>
                                setType(event.target.value)
                            }
                            className="rounded-xl border-black/10 text-sm focus:border-[#ffb800] focus:ring-[#ffb800]"
                        >
                            <option value="">
                                Semua dokumen
                            </option>
                            <option value="invoice">Invoice</option>
                            <option value="receipt">
                                Kwitansi
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
                                placeholder="Cari nomor atau file..."
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

                {archives.data.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                        <div className="mb-4 rounded-2xl bg-[#fff4d2] p-4 text-[#b07e00]">
                            <Archive className="h-7 w-7" />
                        </div>
                        <p className="font-black">
                            Belum ada arsip
                        </p>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-[#888]">
                            Buka PDF invoice atau kwitansi agar salinannya
                            otomatis masuk ke arsip.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                        {archives.data.map((archive) => {
                            const Icon =
                                archive.document_type === 'invoice'
                                    ? FileText
                                    : ReceiptText;

                            return (
                                <article
                                    key={archive.id}
                                    className="rounded-2xl border border-black/[0.08] p-5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="rounded-xl bg-[#fff4d2] p-3 text-[#b07e00]">
                                            <Icon className="h-5 w-5" />
                                        </div>

                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-600">
                                            {archive.document_type ===
                                            'invoice'
                                                ? 'Invoice'
                                                : 'Kwitansi'}
                                        </span>
                                    </div>

                                    <p className="mt-4 break-all text-sm font-black">
                                        {archive.document_number ??
                                            archive.file_name}
                                    </p>

                                    <p className="mt-2 text-sm font-bold">
                                        {archive.project_name ?? '-'}
                                    </p>

                                    <p className="mt-1 text-xs text-[#888]">
                                        {archive.customer_name ?? '-'}
                                    </p>

                                    <div className="mt-4 space-y-2 border-t border-dashed border-black/10 pt-4">
                                        <div className="flex items-center gap-2 text-xs text-[#666]">
                                            <HardDrive className="h-4 w-4 text-emerald-600" />
                                            Tersimpan lokal
                                        </div>

                                        <div
                                            className={`flex items-center gap-2 text-xs ${
                                                archive.drive_file_id
                                                    ? 'text-blue-700'
                                                    : 'text-[#999]'
                                            }`}
                                        >
                                            <Cloud className="h-4 w-4" />
                                            {archive.drive_file_id
                                                ? 'Tersimpan di Google Drive'
                                                : 'Belum tersinkronisasi'}
                                        </div>

                                        <p className="text-[11px] text-[#999]">
                                            Diarsipkan{' '}
                                            {dateTime(
                                                archive.archived_at,
                                            )}
                                        </p>
                                    </div>

                                    <div className="mt-4 grid gap-2">
                                        {archive.local_url && (
                                            <a
                                                href={archive.local_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#202020] px-4 py-2.5 text-sm font-bold text-white"
                                            >
                                                <Download className="h-4 w-4" />
                                                Buka Dokumen
                                            </a>
                                        )}

                                        {archive.drive_url && (
                                            <a
                                                href={archive.drive_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 px-4 py-2.5 text-sm font-bold text-blue-700"
                                            >
                                                <Cloud className="h-4 w-4" />
                                                Buka Google Drive
                                            </a>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {archives.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-black/[0.06] px-5 py-4">
                        <p className="text-xs text-[#777]">
                            Halaman {archives.current_page} dari{' '}
                            {archives.last_page}
                        </p>

                        <div className="flex gap-2">
                            <PageButton
                                url={archives.prev_page_url}
                                direction="left"
                            />
                            <PageButton
                                url={archives.next_page_url}
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