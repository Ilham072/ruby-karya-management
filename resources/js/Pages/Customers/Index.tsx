import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Search,
    Trash2,
    UserRound,
    UsersRound,
    X,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Customer {
    id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
    created_at: string;
}

interface PaginatedCustomers {
    data: Customer[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    customers: PaginatedCustomers;
    filters: {
        search?: string;
    };
}

const emptyForm = {
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
};

export default function Index({ customers, filters }: Props) {
    const page = usePage();
    const globalErrors = (page.props as any).errors ?? {};

    const [search, setSearch] = useState(filters.search ?? '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] =
        useState<Customer | null>(null);

    const form = useForm(emptyForm);

    const openCreateModal = () => {
        setEditingCustomer(null);
        form.reset();
        form.clearErrors();
        setModalOpen(true);
    };

    const openEditModal = (customer: Customer) => {
        setEditingCustomer(customer);
        form.setData({
            name: customer.name ?? '',
            contact_person: customer.contact_person ?? '',
            phone: customer.phone ?? '',
            email: customer.email ?? '',
            address: customer.address ?? '',
            notes: customer.notes ?? '',
        });
        form.clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        if (form.processing) return;

        setModalOpen(false);
        setEditingCustomer(null);
        form.reset();
        form.clearErrors();
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/customers',
            { search },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const submitCustomer = (event: FormEvent) => {
        event.preventDefault();

        if (editingCustomer) {
            form.put(`/customers/${editingCustomer.id}`, {
                preserveScroll: true,
                onSuccess: closeModal,
            });

            return;
        }

        form.post('/customers', {
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const deleteCustomer = (customer: Customer) => {
        const confirmed = window.confirm(
            `Hapus pelanggan "${customer.name}"?`,
        );

        if (!confirmed) return;

        router.delete(`/customers/${customer.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pelanggan" />

            <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#b07e00]">
                        Data Master
                    </p>
                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                        Pelanggan
                    </h1>
                    <p className="mt-2 text-sm text-[#777]">
                        Kelola data pelanggan dan penanggung jawab proyek.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffb800] px-4 py-3 text-sm font-black text-[#202020] hover:bg-[#efa900]"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Pelanggan
                </button>
            </section>

            {globalErrors.customer && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {globalErrors.customer}
                </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-black/[0.06] p-5 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-black">Daftar Pelanggan</h2>
                        <p className="mt-1 text-xs text-[#888]">
                            Total {customers.total} pelanggan
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
                                placeholder="Cari pelanggan..."
                                className="w-full rounded-xl border-black/10 py-2.5 pl-10 pr-3 text-sm focus:border-[#ffb800] focus:ring-[#ffb800]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="rounded-xl bg-[#202020] px-4 text-sm font-bold text-white hover:bg-black"
                        >
                            Cari
                        </button>
                    </form>
                </div>

                {customers.data.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
                        <div className="mb-4 rounded-2xl bg-[#fff4d2] p-4 text-[#b07e00]">
                            <UsersRound className="h-7 w-7" />
                        </div>
                        <p className="font-black">Belum ada pelanggan</p>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-[#888]">
                            Tambahkan pelanggan pertama sebelum membuat proyek.
                        </p>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#ffb800] px-4 py-2.5 text-sm font-black"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Pelanggan
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left">
                                <thead className="bg-[#f7f7f5] text-[11px] uppercase tracking-wider text-[#777]">
                                    <tr>
                                        <th className="px-6 py-4">
                                            Pelanggan
                                        </th>
                                        <th className="px-4 py-4">Kontak</th>
                                        <th className="px-4 py-4">Alamat</th>
                                        <th className="px-6 py-4 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-black/[0.06]">
                                    {customers.data.map((customer) => (
                                        <tr
                                            key={customer.id}
                                            className="hover:bg-[#fafaf8]"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#202020] font-black text-[#ffb800]">
                                                        {customer.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black">
                                                            {customer.name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-[#888]">
                                                            {customer.contact_person ||
                                                                'Kontak belum diisi'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                <p className="text-sm font-semibold">
                                                    {customer.phone || '-'}
                                                </p>
                                                <p className="mt-1 text-xs text-[#888]">
                                                    {customer.email || '-'}
                                                </p>
                                            </td>

                                            <td className="max-w-xs px-4 py-4 text-sm text-[#666]">
                                                <p className="line-clamp-2">
                                                    {customer.address || '-'}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                customer,
                                                            )
                                                        }
                                                        className="rounded-lg border border-black/10 p-2 text-[#555] hover:border-[#ffb800] hover:bg-[#fff8e5]"
                                                        title="Edit pelanggan"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteCustomer(
                                                                customer,
                                                            )
                                                        }
                                                        className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
                                                        title="Hapus pelanggan"
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
                            {customers.data.map((customer) => (
                                <article
                                    key={customer.id}
                                    className="rounded-2xl border border-black/[0.08] p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#202020] font-black text-[#ffb800]">
                                            {customer.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="font-black">
                                                {customer.name}
                                            </p>
                                            <p className="mt-1 text-xs text-[#888]">
                                                {customer.contact_person ||
                                                    'Kontak belum diisi'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2 border-t border-dashed border-black/10 pt-4">
                                        <InfoRow
                                            icon={Phone}
                                            value={customer.phone}
                                        />
                                        <InfoRow
                                            icon={Mail}
                                            value={customer.email}
                                        />
                                        <InfoRow
                                            icon={MapPin}
                                            value={customer.address}
                                        />
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEditModal(customer)
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2.5 text-sm font-bold"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                deleteCustomer(customer)
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

                {customers.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-black/[0.06] px-5 py-4">
                        <p className="text-xs text-[#777]">
                            Halaman {customers.current_page} dari{' '}
                            {customers.last_page}
                        </p>

                        <div className="flex gap-2">
                            {customers.prev_page_url ? (
                                <Link
                                    href={customers.prev_page_url}
                                    preserveScroll
                                    className="rounded-lg border border-black/10 p-2 hover:bg-black/5"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Link>
                            ) : (
                                <span className="cursor-not-allowed rounded-lg border border-black/5 p-2 text-black/20">
                                    <ChevronLeft className="h-4 w-4" />
                                </span>
                            )}

                            {customers.next_page_url ? (
                                <Link
                                    href={customers.next_page_url}
                                    preserveScroll
                                    className="rounded-lg border border-black/10 p-2 hover:bg-black/5"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <span className="cursor-not-allowed rounded-lg border border-black/5 p-2 text-black/20">
                                    <ChevronRight className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {modalOpen && (
                <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-5">
                    <button
                        type="button"
                        aria-label="Tutup modal"
                        onClick={closeModal}
                        className="absolute inset-0"
                    />

                    <div className="relative z-10 max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-7">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b07e00]">
                                    Data Pelanggan
                                </p>
                                <h2 className="mt-2 text-xl font-black">
                                    {editingCustomer
                                        ? 'Edit Pelanggan'
                                        : 'Tambah Pelanggan'}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="rounded-xl border border-black/10 p-2 hover:bg-black/5"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form
                            onSubmit={submitCustomer}
                            className="space-y-5"
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field
                                    label="Nama pelanggan"
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
                                        placeholder="Contoh: Masjid Besar Istiqlal"
                                    />
                                </Field>

                                <Field
                                    label="Penanggung jawab"
                                    error={form.errors.contact_person}
                                >
                                    <input
                                        value={form.data.contact_person}
                                        onChange={(event) =>
                                            form.setData(
                                                'contact_person',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                        placeholder="Nama kontak"
                                    />
                                </Field>

                                <Field
                                    label="Nomor telepon"
                                    error={form.errors.phone}
                                >
                                    <input
                                        value={form.data.phone}
                                        onChange={(event) =>
                                            form.setData(
                                                'phone',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                        placeholder="08xxxxxxxxxx"
                                    />
                                </Field>

                                <Field
                                    label="Email"
                                    error={form.errors.email}
                                >
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(event) =>
                                            form.setData(
                                                'email',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                        placeholder="email@contoh.com"
                                    />
                                </Field>
                            </div>

                            <Field
                                label="Alamat"
                                error={form.errors.address}
                            >
                                <textarea
                                    rows={3}
                                    value={form.data.address}
                                    onChange={(event) =>
                                        form.setData(
                                            'address',
                                            event.target.value,
                                        )
                                    }
                                    className="form-input resize-none"
                                    placeholder="Alamat pelanggan"
                                />
                            </Field>

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
                                    placeholder="Catatan tambahan jika diperlukan"
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
                                    className="rounded-xl bg-[#ffb800] px-5 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {form.processing
                                        ? 'Menyimpan...'
                                        : editingCustomer
                                          ? 'Simpan Perubahan'
                                          : 'Tambah Pelanggan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
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
    children: React.ReactNode;
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
    value,
}: {
    icon: typeof Phone;
    value: string | null;
}) {
    return (
        <div className="flex items-start gap-2 text-sm text-[#666]">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#b07e00]" />
            <span>{value || '-'}</span>
        </div>
    );
}