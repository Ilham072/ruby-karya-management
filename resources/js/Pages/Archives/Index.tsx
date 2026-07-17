import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Archive,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Cloud,
    CloudOff,
    Eye,
    FileImage,
    FileText,
    HardDrive,
    ReceiptText,
    RefreshCw,
    Search,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

type DocumentType =
    | 'invoice'
    | 'receipt'
    | 'payment_proof';

interface ArchiveItem {
    id: number;
    document_type: DocumentType;
    document_id: number;
    file_name: string;
    local_file_path: string | null;
    local_url: string | null;
    local_exists: boolean;
    drive_file_id: string | null;
    drive_folder_id: string | null;
    drive_url: string | null;
    is_synced: boolean;
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
    years: number[];
    filters: {
        search?: string;
        type?: string;
        year?: number | null;
    };
}

const dateTime = (value: string | null) => {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

const documentLabel = (type: DocumentType) => {
    if (type === 'invoice') {
        return 'Invoice';
    }

    if (type === 'receipt') {
        return 'Kwitansi';
    }

    return 'Bukti Pembayaran';
};

const DocumentIcon = ({
    type,
    className = 'h-5 w-5',
}: {
    type: DocumentType;
    className?: string;
}) => {
    if (type === 'invoice') {
        return <FileText className={className} />;
    }

    if (type === 'receipt') {
        return <ReceiptText className={className} />;
    }

    return <FileImage className={className} />;
};

export default function Index({
    archives,
    years,
    filters,
}: Props) {
    const [search, setSearch] = useState(
        filters.search ?? '',
    );

    const [type, setType] = useState(
        filters.type ?? '',
    );

    const [year, setYear] = useState(
        filters.year?.toString() ?? '',
    );

    const [syncingId, setSyncingId] = useState<
        number | null
    >(null);

    const submitFilter = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/archives',
            {
                search: search || undefined,
                type: type || undefined,
                year: year || undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const resetFilter = () => {
        setSearch('');
        setType('');
        setYear('');

        router.get(
            '/archives',
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const syncArchive = (archive: ArchiveItem) => {
        router.post(
            `/archives/${archive.id}/sync`,
            {},
            {
                preserveScroll: true,
                onStart: () => setSyncingId(archive.id),
                onFinish: () => setSyncingId(null),
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
                    Cari invoice, kwitansi, dan bukti
                    pembayaran CV Ruby Karya.
                </p>
            </section>

            <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                <div className="border-b border-black/[0.06] p-5">
                    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                        <div>
                            <h2 className="font-black">
                                Arsip Dokumen
                            </h2>

                            <p className="mt-1 text-xs text-[#888]">
                                Total {archives.total} dokumen
                            </p>
                        </div>

                        <form
                            onSubmit={submitFilter}
                            className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
                        >
                            <select
                                value={type}
                                onChange={(event) =>
                                    setType(
                                        event.target.value,
                                    )
                                }
                                className="rounded-xl border-black/10 text-sm focus:border-[#ffb800] focus:ring-[#ffb800]"
                            >
                                <option value="">
                                    Semua dokumen
                                </option>
                                <option value="invoice">
                                    Invoice
                                </option>
                                <option value="receipt">
                                    Kwitansi
                                </option>
                                <option value="payment_proof">
                                    Bukti Pembayaran
                                </option>
                            </select>

                            <select
                                value={year}
                                onChange={(event) =>
                                    setYear(
                                        event.target.value,
                                    )
                                }
                                className="rounded-xl border-black/10 text-sm focus:border-[#ffb800] focus:ring-[#ffb800]"
                            >
                                <option value="">
                                    Semua tahun
                                </option>

                                {years.map((item) => (
                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>
                                ))}
                            </select>

                            <div className="relative min-w-64 flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />

                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Cari nomor atau file..."
                                    className="w-full rounded-xl border-black/10 py-2.5 pl-10 pr-3 text-sm focus:border-[#ffb800] focus:ring-[#ffb800]"
                                />
                            </div>

                            <button
                                type="submit"
                                className="rounded-xl bg-[#202020] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black"
                            >
                                Terapkan
                            </button>

                            <button
                                type="button"
                                onClick={resetFilter}
                                className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-bold text-[#555] transition hover:bg-black/5"
                            >
                                Reset
                            </button>
                        </form>
                    </div>
                </div>

                {archives.data.length === 0 ? (
                    <EmptyArchive />
                ) : (
                    <>
                        {/* Card untuk mobile dan tablet */}
                        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:hidden">
                            {archives.data.map(
                                (archive) => (
                                    <ArchiveCard
                                        key={archive.id}
                                        archive={archive}
                                        syncing={
                                            syncingId
                                            === archive.id
                                        }
                                        onSync={() =>
                                            syncArchive(
                                                archive,
                                            )
                                        }
                                    />
                                ),
                            )}
                        </div>

                        {/* Tabel untuk desktop */}
                        <div className="hidden overflow-x-auto lg:block">
                            <table className="w-full min-w-[1000px]">
                                <thead className="bg-[#fafafa] text-left">
                                    <tr className="border-b border-black/[0.06]">
                                        <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-[#777]">
                                            Dokumen
                                        </th>
                                        <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-[#777]">
                                            Proyek
                                        </th>
                                        <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-[#777]">
                                            Penyimpanan
                                        </th>
                                        <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-[#777]">
                                            Diarsipkan
                                        </th>
                                        <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wider text-[#777]">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {archives.data.map(
                                        (archive) => (
                                            <ArchiveRow
                                                key={
                                                    archive.id
                                                }
                                                archive={
                                                    archive
                                                }
                                                syncing={
                                                    syncingId
                                                    ===
                                                    archive.id
                                                }
                                                onSync={() =>
                                                    syncArchive(
                                                        archive,
                                                    )
                                                }
                                            />
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {archives.last_page > 1 && (
                    <Pagination archives={archives} />
                )}
            </section>
        </AuthenticatedLayout>
    );
}

function ArchiveCard({
    archive,
    syncing,
    onSync,
}: {
    archive: ArchiveItem;
    syncing: boolean;
    onSync: () => void;
}) {
    return (
        <article className="rounded-2xl border border-black/[0.08] p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="rounded-xl bg-[#fff4d2] p-3 text-[#b07e00]">
                    <DocumentIcon
                        type={archive.document_type}
                    />
                </div>

                <TypeBadge
                    type={archive.document_type}
                />
            </div>

            <p className="mt-4 break-words text-sm font-black">
                {archive.document_number
                    ?? archive.file_name}
            </p>

            <p className="mt-2 text-sm font-bold">
                {archive.project_name ?? '-'}
            </p>

            <p className="mt-1 text-xs text-[#888]">
                {archive.customer_name ?? '-'}
            </p>

            <div className="mt-4 space-y-2 border-t border-dashed border-black/10 pt-4">
                <StorageStatus archive={archive} />

                <p className="text-[11px] text-[#999]">
                    Diarsipkan{' '}
                    {dateTime(archive.archived_at)}
                </p>
            </div>

            <ArchiveActions
                archive={archive}
                syncing={syncing}
                onSync={onSync}
            />
        </article>
    );
}

function ArchiveRow({
    archive,
    syncing,
    onSync,
}: {
    archive: ArchiveItem;
    syncing: boolean;
    onSync: () => void;
}) {
    return (
        <tr className="border-b border-black/[0.06] last:border-0 hover:bg-black/[0.015]">
            <td className="px-5 py-4">
                <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-[#fff4d2] p-2.5 text-[#b07e00]">
                        <DocumentIcon
                            type={archive.document_type}
                            className="h-4 w-4"
                        />
                    </div>

                    <div>
                        <p className="max-w-64 break-words text-sm font-black">
                            {archive.document_number
                                ?? archive.file_name}
                        </p>

                        <div className="mt-1">
                            <TypeBadge
                                type={
                                    archive.document_type
                                }
                            />
                        </div>
                    </div>
                </div>
            </td>

            <td className="px-5 py-4">
                <p className="text-sm font-bold">
                    {archive.project_name ?? '-'}
                </p>
                <p className="mt-1 text-xs text-[#888]">
                    {archive.customer_name ?? '-'}
                </p>
            </td>

            <td className="px-5 py-4">
                <StorageStatus archive={archive} />
            </td>

            <td className="px-5 py-4 text-xs text-[#777]">
                {dateTime(archive.archived_at)}
            </td>

            <td className="px-5 py-4">
                <div className="flex justify-end">
                    <ArchiveActions
                        archive={archive}
                        syncing={syncing}
                        onSync={onSync}
                        compact
                    />
                </div>
            </td>
        </tr>
    );
}

function TypeBadge({
    type,
}: {
    type: DocumentType;
}) {
    return (
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase text-slate-600">
            {documentLabel(type)}
        </span>
    );
}

function StorageStatus({
    archive,
}: {
    archive: ArchiveItem;
}) {
    return (
        <div className="space-y-2">
            <div
                className={`flex items-center gap-2 text-xs ${
                    archive.local_exists
                        ? 'text-emerald-700'
                        : 'text-red-600'
                }`}
            >
                <HardDrive className="h-4 w-4" />
                {archive.local_exists
                    ? 'Tersimpan lokal'
                    : 'File lokal tidak ditemukan'}
            </div>

            <div
                className={`flex items-center gap-2 text-xs ${
                    archive.is_synced
                        ? 'text-blue-700'
                        : 'text-[#999]'
                }`}
            >
                {archive.is_synced ? (
                    <CheckCircle2 className="h-4 w-4" />
                ) : (
                    <CloudOff className="h-4 w-4" />
                )}

                {archive.is_synced
                    ? 'Tersimpan di Google Drive'
                    : 'Belum tersinkronisasi'}
            </div>
        </div>
    );
}

function ArchiveActions({
    archive,
    syncing,
    onSync,
    compact = false,
}: {
    archive: ArchiveItem;
    syncing: boolean;
    onSync: () => void;
    compact?: boolean;
}) {
    return (
        <div
            className={
                compact
                    ? 'flex flex-wrap justify-end gap-2'
                    : 'mt-4 grid gap-2'
            }
        >
            {archive.local_url && (
                <a
                    href={archive.local_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#202020] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black"
                >
                    <Eye className="h-4 w-4" />
                    Buka
                </a>
            )}

            {!archive.is_synced
                && archive.local_exists && (
                    <button
                        type="button"
                        onClick={onSync}
                        disabled={syncing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-100 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {syncing ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Cloud className="h-4 w-4" />
                        )}

                        {syncing
                            ? 'Menyinkronkan'
                            : 'Sinkronkan'}
                    </button>
                )}
        </div>
    );
}

function EmptyArchive() {
    return (
        <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 rounded-2xl bg-[#fff4d2] p-4 text-[#b07e00]">
                <Archive className="h-7 w-7" />
            </div>

            <p className="font-black">
                Belum ada arsip
            </p>

            <p className="mt-2 max-w-sm text-sm leading-6 text-[#888]">
                Invoice, kwitansi, dan bukti pembayaran
                yang diarsipkan akan muncul di bagian ini.
            </p>
        </div>
    );
}

function Pagination({
    archives,
}: {
    archives: PaginatedArchives;
}) {
    return (
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
        direction === 'left'
            ? ChevronLeft
            : ChevronRight;

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
            className="rounded-lg border border-black/10 p-2 transition hover:bg-black/5"
        >
            <Icon className="h-4 w-4" />
        </Link>
    );
}