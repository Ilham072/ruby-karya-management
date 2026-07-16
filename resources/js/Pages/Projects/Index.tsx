import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    BriefcaseBusiness,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    FileText,
    Pencil,
    Plus,
    Search,
    Trash2,
    UserRound,
    X,
} from 'lucide-react';
import { FormEvent, ReactNode, useState } from 'react';

interface CustomerOption {
    id: number;
    name: string;
}

interface Project {
    id: number;
    customer_id: number;
    project_code: string | null;
    name: string;
    job_type: string;
    contract_number: string | null;
    contract_date: string | null;
    start_date: string | null;
    end_date: string | null;
    contract_value: number | string;
    description: string | null;
    status: string;
    customer: CustomerOption;
}

interface PaginatedProjects {
    data: Project[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    projects: PaginatedProjects;
    customers: CustomerOption[];
    filters: {
        search?: string;
        status?: string;
    };
}

const statusLabels: Record<string, string> = {
    draft: 'Draft',
    active: 'Aktif',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const statusStyles: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    active: 'bg-emerald-50 text-emerald-700',
    completed: 'bg-blue-50 text-blue-700',
    cancelled: 'bg-red-50 text-red-600',
};

const emptyForm = {
    customer_id: '',
    project_code: '',
    name: '',
    job_type: '',
    contract_number: '',
    contract_date: '',
    start_date: '',
    end_date: '',
    contract_value: '',
    description: '',
    status: 'draft',
};

const currency = (value: number | string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const date = (value: string | null) => {
    if (!value) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(`${value.substring(0, 10)}T00:00:00`));
};

export default function Index({
    projects,
    customers,
    filters,
}: Props) {
    const page = usePage();
    const globalErrors = (page.props as any).errors ?? {};

    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(
        filters.status ?? '',
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProject, setEditingProject] =
        useState<Project | null>(null);

    const form = useForm(emptyForm);

    const openCreateModal = () => {
        setEditingProject(null);
        form.reset();
        form.clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        form.setData({
            customer_id: String(project.customer_id),
            project_code: project.project_code ?? '',
            name: project.name,
            job_type: project.job_type,
            contract_number: project.contract_number ?? '',
            contract_date: project.contract_date?.substring(0, 10) ?? '',
            start_date: project.start_date?.substring(0, 10) ?? '',
            end_date: project.end_date?.substring(0, 10) ?? '',
            contract_value: String(project.contract_value ?? ''),
            description: project.description ?? '',
            status: project.status,
        });
        form.clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        if (form.processing) return;

        setModalOpen(false);
        setEditingProject(null);
        form.reset();
        form.clearErrors();
    };

    const submitFilter = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/projects',
            {
                search,
                status: statusFilter,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const submitProject = (event: FormEvent) => {
        event.preventDefault();

        if (editingProject) {
            form.put(`/projects/${editingProject.id}`, {
                preserveScroll: true,
                onSuccess: closeModal,
            });

            return;
        }

        form.post('/projects', {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const deleteProject = (project: Project) => {
        if (!window.confirm(`Hapus proyek "${project.name}"?`)) return;

        router.delete(`/projects/${project.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Proyek" />

            <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#b07e00]">
                        Manajemen Pekerjaan
                    </p>
                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                        Proyek
                    </h1>
                    <p className="mt-2 text-sm text-[#777]">
                        Kelola pekerjaan, kontrak, dan nilai proyek.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    disabled={customers.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffb800] px-4 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Proyek
                </button>
            </section>

            {customers.length === 0 && (
                <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Tambahkan pelanggan terlebih dahulu sebelum membuat
                    proyek.{' '}
                    <Link
                        href="/customers"
                        className="font-black underline"
                    >
                        Buka halaman pelanggan
                    </Link>
                </div>
            )}

            {globalErrors.project && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {globalErrors.project}
                </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-black/[0.06] p-5 lg:flex-row lg:items-center">
                    <div>
                        <h2 className="font-black">Daftar Proyek</h2>
                        <p className="mt-1 text-xs text-[#888]">
                            Total {projects.total} proyek
                        </p>
                    </div>

                    <form
                        onSubmit={submitFilter}
                        className="flex flex-col gap-2 sm:flex-row"
                    >
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            className="rounded-xl border-black/10 text-sm focus:border-[#ffb800] focus:ring-[#ffb800]"
                        >
                            <option value="">Semua status</option>
                            <option value="draft">Draft</option>
                            <option value="active">Aktif</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">
                                Dibatalkan
                            </option>
                        </select>

                        <div className="relative min-w-64 flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Cari proyek..."
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

                {projects.data.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                        <div className="mb-4 rounded-2xl bg-[#fff4d2] p-4 text-[#b07e00]">
                            <BriefcaseBusiness className="h-7 w-7" />
                        </div>
                        <p className="font-black">Belum ada proyek</p>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-[#888]">
                            Proyek yang ditambahkan akan tampil di bagian
                            ini.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left">
                                <thead className="bg-[#f7f7f5] text-[11px] uppercase tracking-wider text-[#777]">
                                    <tr>
                                        <th className="px-6 py-4">Proyek</th>
                                        <th className="px-4 py-4">
                                            Pelanggan
                                        </th>
                                        <th className="px-4 py-4">
                                            Nilai Kontrak
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
                                    {projects.data.map((project) => (
                                        <tr
                                            key={project.id}
                                            className="hover:bg-[#fafaf8]"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-black">
                                                    {project.name}
                                                </p>
                                                <p className="mt-1 text-xs text-[#888]">
                                                    {project.project_code ||
                                                        '-'}{' '}
                                                    · {project.job_type}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4 text-sm font-semibold">
                                                {project.customer.name}
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-black">
                                                    {currency(
                                                        project.contract_value,
                                                    )}
                                                </p>
                                                <p className="mt-1 text-xs text-[#888]">
                                                    Mulai{' '}
                                                    {date(project.start_date)}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <StatusBadge
                                                    status={project.status}
                                                />
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                project,
                                                            )
                                                        }
                                                        className="rounded-lg border border-black/10 p-2 text-[#555] hover:bg-[#fff8e5]"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteProject(
                                                                project,
                                                            )
                                                        }
                                                        className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-4 p-4 md:hidden">
                            {projects.data.map((project) => (
                                <article
                                    key={project.id}
                                    className="rounded-2xl border border-black/[0.08] p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-black">
                                                {project.name}
                                            </p>
                                            <p className="mt-1 text-xs text-[#888]">
                                                {project.project_code ||
                                                    'Tanpa kode'}
                                            </p>
                                        </div>
                                        <StatusBadge
                                            status={project.status}
                                        />
                                    </div>

                                    <div className="mt-4 space-y-3 border-t border-dashed border-black/10 pt-4">
                                        <InfoRow
                                            icon={UserRound}
                                            label="Pelanggan"
                                            value={project.customer.name}
                                        />
                                        <InfoRow
                                            icon={FileText}
                                            label="Jenis pekerjaan"
                                            value={project.job_type}
                                        />
                                        <InfoRow
                                            icon={CircleDollarSign}
                                            label="Nilai kontrak"
                                            value={currency(
                                                project.contract_value,
                                            )}
                                        />
                                        <InfoRow
                                            icon={CalendarDays}
                                            label="Periode"
                                            value={`${date(project.start_date)} - ${date(project.end_date)}`}
                                        />
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEditModal(project)
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2.5 text-sm font-bold"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteProject(project)
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2.5 text-sm font-bold text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Hapus
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}

                {projects.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-black/[0.06] px-5 py-4">
                        <p className="text-xs text-[#777]">
                            Halaman {projects.current_page} dari{' '}
                            {projects.last_page}
                        </p>

                        <div className="flex gap-2">
                            <PageButton
                                url={projects.prev_page_url}
                                icon={ChevronLeft}
                            />
                            <PageButton
                                url={projects.next_page_url}
                                icon={ChevronRight}
                            />
                        </div>
                    </div>
                )}
            </section>

            {modalOpen && (
                <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 sm:items-center sm:p-5">
                    <button
                        type="button"
                        aria-label="Tutup modal"
                        onClick={closeModal}
                        className="absolute inset-0"
                    />

                    <div className="relative z-10 max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-3xl sm:rounded-3xl sm:p-7">
                        <div className="mb-6 flex items-start justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b07e00]">
                                    Data Proyek
                                </p>
                                <h2 className="mt-2 text-xl font-black">
                                    {editingProject
                                        ? 'Edit Proyek'
                                        : 'Tambah Proyek'}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-xl border border-black/10 p-2"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={submitProject}
                            className="space-y-5"
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field
                                    label="Pelanggan"
                                    required
                                    error={form.errors.customer_id}
                                >
                                    <select
                                        value={form.data.customer_id}
                                        onChange={(event) =>
                                            form.setData(
                                                'customer_id',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                    >
                                        <option value="">
                                            Pilih pelanggan
                                        </option>
                                        {customers.map((customer) => (
                                            <option
                                                key={customer.id}
                                                value={customer.id}
                                            >
                                                {customer.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field
                                    label="Kode proyek"
                                    error={form.errors.project_code}
                                >
                                    <input
                                        value={form.data.project_code}
                                        onChange={(event) =>
                                            form.setData(
                                                'project_code',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                        placeholder="Otomatis jika dikosongkan"
                                    />
                                </Field>

                                <Field
                                    label="Nama proyek"
                                    required
                                    error={form.errors.name}
                                >
                                    <input
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                        placeholder="Nama pekerjaan/proyek"
                                    />
                                </Field>

                                <Field
                                    label="Jenis pekerjaan"
                                    required
                                    error={form.errors.job_type}
                                >
                                    <input
                                        value={form.data.job_type}
                                        onChange={(event) =>
                                            form.setData(
                                                'job_type',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                        placeholder="Contoh: Interior"
                                    />
                                </Field>

                                <Field
                                    label="Nomor kontrak"
                                    error={form.errors.contract_number}
                                >
                                    <input
                                        value={form.data.contract_number}
                                        onChange={(event) =>
                                            form.setData(
                                                'contract_number',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                    />
                                </Field>

                                <Field
                                    label="Tanggal kontrak"
                                    error={form.errors.contract_date}
                                >
                                    <input
                                        type="date"
                                        value={form.data.contract_date}
                                        onChange={(event) =>
                                            form.setData(
                                                'contract_date',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                    />
                                </Field>

                                <Field
                                    label="Tanggal mulai"
                                    error={form.errors.start_date}
                                >
                                    <input
                                        type="date"
                                        value={form.data.start_date}
                                        onChange={(event) =>
                                            form.setData(
                                                'start_date',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                    />
                                </Field>

                                <Field
                                    label="Tanggal selesai"
                                    error={form.errors.end_date}
                                >
                                    <input
                                        type="date"
                                        value={form.data.end_date}
                                        onChange={(event) =>
                                            form.setData(
                                                'end_date',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                    />
                                </Field>

                                <Field
                                    label="Nilai kontrak"
                                    required
                                    error={form.errors.contract_value}
                                >
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.data.contract_value}
                                        onChange={(event) =>
                                            form.setData(
                                                'contract_value',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                        placeholder="0"
                                    />
                                </Field>

                                <Field
                                    label="Status"
                                    required
                                    error={form.errors.status}
                                >
                                    <select
                                        value={form.data.status}
                                        onChange={(event) =>
                                            form.setData(
                                                'status',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="active">Aktif</option>
                                        <option value="completed">
                                            Selesai
                                        </option>
                                        <option value="cancelled">
                                            Dibatalkan
                                        </option>
                                    </select>
                                </Field>
                            </div>

                            <Field
                                label="Deskripsi"
                                error={form.errors.description}
                            >
                                <textarea
                                    rows={4}
                                    value={form.data.description}
                                    onChange={(event) =>
                                        form.setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    className="form-input resize-none"
                                />
                            </Field>

                            <div className="flex flex-col-reverse gap-2 border-t border-black/[0.06] pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-xl border border-black/10 px-5 py-3 text-sm font-bold"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-xl bg-[#ffb800] px-5 py-3 text-sm font-black disabled:opacity-50"
                                >
                                    {form.processing
                                        ? 'Menyimpan...'
                                        : editingProject
                                          ? 'Simpan Perubahan'
                                          : 'Tambah Proyek'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${
                statusStyles[status] ?? 'bg-zinc-100 text-zinc-600'
            }`}
        >
            {statusLabels[status] ?? status}
        </span>
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

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof UserRound;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#b07e00]" />
            <div>
                <p className="text-[11px] text-[#888]">{label}</p>
                <p className="mt-0.5 text-sm font-semibold">{value}</p>
            </div>
        </div>
    );
}

function PageButton({
    url,
    icon: Icon,
}: {
    url: string | null;
    icon: typeof ChevronLeft;
}) {
    if (!url) {
        return (
            <span className="cursor-not-allowed rounded-lg border border-black/5 p-2 text-black/20">
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