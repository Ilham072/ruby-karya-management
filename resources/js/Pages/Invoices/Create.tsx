import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    BriefcaseBusiness,
    Calculator,
    Plus,
    Stamp,
    Trash2,
    UserRound,
} from 'lucide-react';
import { ReactNode, useMemo } from 'react';

interface ProjectOption {
    id: number;
    customer_id: number;
    project_code: string | null;
    name: string;
    job_type: string;
    contract_value: number | string;
    customer: {
        id: number;
        name: string;
    };
}

interface ItemForm {
    description: string;
    details: string;
    quantity: string;
    unit: string;
    unit_price: string;
}

interface Props {
    projects: ProjectOption[];
    defaultDate: string;
    defaultDueDate: string;
}

const emptyItem = (): ItemForm => ({
    description: '',
    details: '',
    quantity: '1',
    unit: 'Paket',
    unit_price: '',
});

const currency = (value: number | string) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function Create({
    projects,
    defaultDate,
    defaultDueDate,
}: Props) {
    const page = usePage();
    const user = (page.props as any).auth.user;

    const form = useForm({
        project_id: '',
        invoice_date: defaultDate,
        due_date: defaultDueDate,
        term_number: '',
        description: '',
        use_stamp: false,
        action: 'draft',
        items: [emptyItem()],
    });

    const selectedProject = projects.find(
        (project) => String(project.id) === form.data.project_id,
    );

    const subtotal = useMemo(
        () =>
            form.data.items.reduce(
                (total, item) =>
                    total +
                    Number(item.quantity || 0) *
                        Number(item.unit_price || 0),
                0,
            ),
        [form.data.items],
    );

    const itemError = (index: number, field: keyof ItemForm) =>
        (form.errors as Record<string, string>)[
            `items.${index}.${field}`
        ];

    const updateItem = (
        index: number,
        field: keyof ItemForm,
        value: string,
    ) => {
        const items = [...form.data.items];

        items[index] = {
            ...items[index],
            [field]: value,
        };

        form.setData('items', items);
    };

    const addItem = () => {
        form.setData('items', [...form.data.items, emptyItem()]);
    };

    const removeItem = (index: number) => {
        if (form.data.items.length === 1) return;

        form.setData(
            'items',
            form.data.items.filter((_, itemIndex) => itemIndex !== index),
        );
    };

   const submit = (action: 'draft' | 'publish') => {
        form.transform((data) => ({
            ...data,
            action,
        }));

        form.post('/invoices', {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Buat Invoice" />

            <section className="mb-7">
                <Link
                    href="/invoices"
                    className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-[#666] hover:text-[#202020]"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Invoice
                </Link>

                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#b07e00]">
                    Penagihan Baru
                </p>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    Buat Invoice
                </h1>
                <p className="mt-2 text-sm text-[#777]">
                    Nomor invoice akan dibuat otomatis setelah disimpan.
                </p>
            </section>

            {projects.length === 0 ? (
                <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                    <h2 className="font-black text-amber-900">
                        Belum ada proyek
                    </h2>
                    <p className="mt-2 text-sm text-amber-800">
                        Tambahkan proyek terlebih dahulu sebelum membuat
                        invoice.
                    </p>
                    <Link
                        href="/projects"
                        className="mt-4 inline-flex rounded-xl bg-[#202020] px-4 py-3 text-sm font-bold text-white"
                    >
                        Buka Halaman Proyek
                    </Link>
                </section>
            ) : (
                <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                    <div className="space-y-6">
                        <section className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
                            <SectionTitle
                                number="01"
                                title="Informasi Invoice"
                            />

                            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                <Field
                                    label="Proyek"
                                    required
                                    error={form.errors.project_id}
                                >
                                    <select
                                        value={form.data.project_id}
                                        onChange={(event) =>
                                            form.setData(
                                                'project_id',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                    >
                                        <option value="">
                                            Pilih proyek
                                        </option>
                                        {projects.map((project) => (
                                            <option
                                                key={project.id}
                                                value={project.id}
                                            >
                                                {project.name} -{' '}
                                                {project.customer.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field
                                    label="Termin ke"
                                    error={form.errors.term_number}
                                >
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.data.term_number}
                                        onChange={(event) =>
                                            form.setData(
                                                'term_number',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                        placeholder="Opsional"
                                    />
                                </Field>

                                <Field
                                    label="Tanggal invoice"
                                    required
                                    error={form.errors.invoice_date}
                                >
                                    <input
                                        type="date"
                                        value={form.data.invoice_date}
                                        onChange={(event) =>
                                            form.setData(
                                                'invoice_date',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                    />
                                </Field>

                                <Field
                                    label="Jatuh tempo"
                                    error={form.errors.due_date}
                                >
                                    <input
                                        type="date"
                                        value={form.data.due_date}
                                        onChange={(event) =>
                                            form.setData(
                                                'due_date',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input"
                                    />
                                </Field>
                            </div>

                            {selectedProject && (
                                <div className="mt-5 grid gap-3 rounded-2xl bg-[#f7f7f5] p-4 sm:grid-cols-3">
                                    <ProjectInfo
                                        icon={
                                            <BriefcaseBusiness className="h-4 w-4" />
                                        }
                                        label="Proyek"
                                        value={selectedProject.name}
                                    />
                                    <ProjectInfo
                                        icon={
                                            <UserRound className="h-4 w-4" />
                                        }
                                        label="Pelanggan"
                                        value={
                                            selectedProject.customer.name
                                        }
                                    />
                                    <ProjectInfo
                                        icon={
                                            <Calculator className="h-4 w-4" />
                                        }
                                        label="Nilai kontrak"
                                        value={currency(
                                            selectedProject.contract_value,
                                        )}
                                    />
                                </div>
                            )}

                            <div className="mt-5">
                                <Field
                                    label="Keterangan invoice"
                                    required
                                    error={form.errors.description}
                                >
                                    <textarea
                                        rows={3}
                                        value={form.data.description}
                                        onChange={(event) =>
                                            form.setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                        className="form-input resize-none"
                                        placeholder="Contoh: Pembayaran termin 1 pekerjaan interior"
                                    />
                                </Field>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex items-center justify-between gap-4">
                                <SectionTitle
                                    number="02"
                                    title="Item Pekerjaan"
                                />

                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-xs font-black hover:bg-black/5"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah Item
                                </button>
                            </div>

                            <div className="mt-6 space-y-4">
                                {form.data.items.map((item, index) => {
                                    const amount =
                                        Number(item.quantity || 0) *
                                        Number(item.unit_price || 0);

                                    return (
                                        <article
                                            key={index}
                                            className="rounded-2xl border border-black/[0.08] p-4"
                                        >
                                            <div className="mb-4 flex items-center justify-between">
                                                <p className="text-sm font-black">
                                                    Item {index + 1}
                                                </p>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeItem(index)
                                                    }
                                                    disabled={
                                                        form.data.items
                                                            .length === 1
                                                    }
                                                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="sm:col-span-2">
                                                    <Field
                                                        label="Uraian pekerjaan"
                                                        required
                                                        error={itemError(
                                                            index,
                                                            'description',
                                                        )}
                                                    >
                                                        <input
                                                            value={
                                                                item.description
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateItem(
                                                                    index,
                                                                    'description',
                                                                    event
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                            className="form-input"
                                                            placeholder="Nama item pekerjaan"
                                                        />
                                                    </Field>
                                                </div>

                                                <div className="sm:col-span-2">
                                                    <Field
                                                        label="Detail"
                                                        error={itemError(
                                                            index,
                                                            'details',
                                                        )}
                                                    >
                                                        <input
                                                            value={
                                                                item.details
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateItem(
                                                                    index,
                                                                    'details',
                                                                    event
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                            className="form-input"
                                                            placeholder="Detail tambahan"
                                                        />
                                                    </Field>
                                                </div>

                                                <Field
                                                    label="Jumlah"
                                                    required
                                                    error={itemError(
                                                        index,
                                                        'quantity',
                                                    )}
                                                >
                                                    <input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        value={
                                                            item.quantity
                                                        }
                                                        onChange={(event) =>
                                                            updateItem(
                                                                index,
                                                                'quantity',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="form-input"
                                                    />
                                                </Field>

                                                <Field
                                                    label="Satuan"
                                                    error={itemError(
                                                        index,
                                                        'unit',
                                                    )}
                                                >
                                                    <input
                                                        value={item.unit}
                                                        onChange={(event) =>
                                                            updateItem(
                                                                index,
                                                                'unit',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="form-input"
                                                        placeholder="Paket"
                                                    />
                                                </Field>

                                                <Field
                                                    label="Harga satuan"
                                                    required
                                                    error={itemError(
                                                        index,
                                                        'unit_price',
                                                    )}
                                                >
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={
                                                            item.unit_price
                                                        }
                                                        onChange={(event) =>
                                                            updateItem(
                                                                index,
                                                                'unit_price',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="form-input"
                                                        placeholder="0"
                                                    />
                                                </Field>

                                                <div>
                                                    <p className="mb-2 text-sm font-bold">
                                                        Jumlah
                                                    </p>
                                                    <div className="flex min-h-[46px] items-center rounded-xl bg-[#f7f7f5] px-4 text-sm font-black">
                                                        {currency(amount)}
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm sm:p-6">
                            <SectionTitle
                                number="03"
                                title="Pengesahan"
                            />

                            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-black/[0.08] p-4">
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
                                        Gunakan stempel
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-[#888]">
                                        Stempel akan ditambahkan pada PDF
                                        ketika file stempel sudah tersedia.
                                    </p>
                                </div>
                            </label>
                        </section>
                    </div>

                    <aside className="xl:sticky xl:top-28 xl:self-start">
                        <section className="rounded-2xl bg-[#202020] p-5 text-white shadow-sm">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ffb800]">
                                Ringkasan
                            </p>

                            <div className="mt-6 space-y-4">
                                <SummaryRow
                                    label="Jumlah item"
                                    value={`${form.data.items.length} item`}
                                />
                                <SummaryRow
                                    label="Tanggal"
                                    value={form.data.invoice_date || '-'}
                                />
                                <SummaryRow
                                    label="Termin"
                                    value={
                                        form.data.term_number
                                            ? `Termin ${form.data.term_number}`
                                            : '-'
                                    }
                                />
                            </div>

                            <div className="mt-6 border-t border-white/10 pt-5">
                                <p className="text-xs text-white/55">
                                    Total Invoice
                                </p>
                                <p className="mt-2 break-words text-2xl font-black text-[#ffb800]">
                                    {currency(subtotal)}
                                </p>
                            </div>

                            <div className="mt-6 space-y-2">
                                {user.role === 'super_admin' && (
                                    <button
                                        type="button"
                                        disabled={form.processing}
                                        onClick={() =>
                                            submit('publish')
                                        }
                                        className="w-full rounded-xl bg-[#ffb800] px-4 py-3 text-sm font-black text-[#202020] disabled:opacity-50"
                                    >
                                        Simpan & Terbitkan
                                    </button>
                                )}

                                <button
                                    type="button"
                                    disabled={form.processing}
                                    onClick={() => submit('draft')}
                                    className="w-full rounded-xl border border-white/15 px-4 py-3 text-sm font-bold hover:bg-white/10 disabled:opacity-50"
                                >
                                    Simpan sebagai Draft
                                </button>
                            </div>

                            {form.hasErrors && (
                                <p className="mt-4 text-xs leading-5 text-red-300">
                                    Periksa kembali data yang ditandai
                                    sebelum menyimpan invoice.
                                </p>
                            )}
                        </section>
                    </aside>
                </div>
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

function ProjectInfo({
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

function SummaryRow({
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