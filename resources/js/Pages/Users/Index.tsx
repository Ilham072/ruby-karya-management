import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    KeyRound,
    Pencil,
    Plus,
    ShieldCheck,
    UserCheck,
    UserCog,
    UserRound,
    UserX,
    X,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'admin';
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
}

interface Props {
    users: UserItem[];
    summary: {
        total: number;
        active: number;
        inactive: number;
        admin: number;
        maximum: number;
    };
    canCreate: boolean;
}

const formatDate = (value: string | null) => {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value));
};

export default function Index({
    users,
    summary,
    canCreate,
}: Props) {
    const [createOpen, setCreateOpen] =
        useState(false);

    const [editingUser, setEditingUser] =
        useState<UserItem | null>(null);

    const [passwordUser, setPasswordUser] =
        useState<UserItem | null>(null);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        is_active: true,
    });

    const passwordForm = useForm({
        password: '',
        password_confirmation: '',
    });

    const openEdit = (user: UserItem) => {
        setEditingUser(user);

        editForm.setData({
            name: user.name,
            email: user.email,
            is_active: user.is_active,
        });

        editForm.clearErrors();
    };

    const openPassword = (user: UserItem) => {
        setPasswordUser(user);
        passwordForm.reset();
        passwordForm.clearErrors();
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();

        createForm.post('/users', {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setCreateOpen(false);
            },
        });
    };

    const submitEdit = (event: FormEvent) => {
        event.preventDefault();

        if (!editingUser) {
            return;
        }

        editForm.patch(
            `/users/${editingUser.id}`,
            {
                preserveScroll: true,
                onSuccess: () =>
                    setEditingUser(null),
            },
        );
    };

    const submitPassword = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        if (!passwordUser) {
            return;
        }

        passwordForm.patch(
            `/users/${passwordUser.id}/password`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    passwordForm.reset();
                    setPasswordUser(null);
                },
            },
        );
    };

    const toggleStatus = (user: UserItem) => {
        const action = user.is_active
            ? 'menonaktifkan'
            : 'mengaktifkan';

        if (
            !window.confirm(
                `Yakin ingin ${action} akun ${user.name}?`,
            )
        ) {
            return;
        }

        router.patch(
            `/users/${user.id}`,
            {
                name: user.name,
                email: user.email,
                is_active: !user.is_active,
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Pengguna" />

            <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#b07e00]">
                        Khusus Super Admin
                    </p>

                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                        Manajemen Pengguna
                    </h1>

                    <p className="mt-2 text-sm text-[#777]">
                        Kelola akun yang dapat mengakses
                        Ruby Karya Management.
                    </p>
                </div>

                <button
                    type="button"
                    disabled={!canCreate}
                    onClick={() => {
                        createForm.clearErrors();
                        setCreateOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffb800] px-5 py-3 text-sm font-black text-[#202020] transition hover:bg-[#e9a800] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                    Tambah Admin
                </button>
            </section>

            <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    label="Total Pengguna"
                    value={`${summary.total}/${summary.maximum}`}
                    icon={UserRound}
                />

                <SummaryCard
                    label="Admin"
                    value={summary.admin}
                    icon={UserCog}
                />

                <SummaryCard
                    label="Akun Aktif"
                    value={summary.active}
                    icon={UserCheck}
                    color="emerald"
                />

                <SummaryCard
                    label="Akun Nonaktif"
                    value={summary.inactive}
                    icon={UserX}
                    color="red"
                />
            </section>

            {!canCreate && (
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                    Batas maksimal tiga pengguna telah
                    tercapai. Nonaktifkan akun jika hanya
                    ingin menghentikan akses pengguna.
                </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-sm">
                <div className="border-b border-black/[0.06] p-5">
                    <h2 className="font-black">
                        Daftar Pengguna
                    </h2>

                    <p className="mt-1 text-xs text-[#888]">
                        Satu Super Admin dan maksimal dua
                        Admin
                    </p>
                </div>

                {/* Card mobile */}
                <div className="grid gap-4 p-4 md:grid-cols-2 lg:hidden">
                    {users.map((user) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            onEdit={() =>
                                openEdit(user)
                            }
                            onPassword={() =>
                                openPassword(user)
                            }
                            onToggle={() =>
                                toggleStatus(user)
                            }
                        />
                    ))}
                </div>

                {/* Tabel desktop */}
                <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full">
                        <thead className="bg-[#fafafa]">
                            <tr className="border-b border-black/[0.06] text-left">
                                <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-[#777]">
                                    Pengguna
                                </th>
                                <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-[#777]">
                                    Peran
                                </th>
                                <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-[#777]">
                                    Status
                                </th>
                                <th className="px-5 py-4 text-xs font-black uppercase tracking-wider text-[#777]">
                                    Dibuat
                                </th>
                                <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-wider text-[#777]">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-black/[0.06] last:border-0"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar
                                                user={user}
                                            />

                                            <div>
                                                <p className="text-sm font-black">
                                                    {user.name}
                                                </p>
                                                <p className="mt-1 text-xs text-[#777]">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <RoleBadge
                                            role={user.role}
                                        />
                                    </td>

                                    <td className="px-5 py-4">
                                        <StatusBadge
                                            active={
                                                user.is_active
                                            }
                                        />
                                    </td>

                                    <td className="px-5 py-4 text-xs text-[#777]">
                                        {formatDate(
                                            user.created_at,
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        {user.role ===
                                        'admin' ? (
                                            <div className="flex justify-end gap-2">
                                                <ActionButtons
                                                    user={
                                                        user
                                                    }
                                                    onEdit={() =>
                                                        openEdit(
                                                            user,
                                                        )
                                                    }
                                                    onPassword={() =>
                                                        openPassword(
                                                            user,
                                                        )
                                                    }
                                                    onToggle={() =>
                                                        toggleStatus(
                                                            user,
                                                        )
                                                    }
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-right text-xs text-[#999]">
                                                Akun utama
                                            </p>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {createOpen && (
                <Modal
                    title="Tambah Admin"
                    description="Tambahkan akun baru untuk pengelola aplikasi."
                    onClose={() =>
                        setCreateOpen(false)
                    }
                >
                    <form
                        onSubmit={submitCreate}
                        className="space-y-4"
                    >
                        <TextField
                            label="Nama lengkap"
                            value={createForm.data.name}
                            error={createForm.errors.name}
                            onChange={(value) =>
                                createForm.setData(
                                    'name',
                                    value,
                                )
                            }
                        />

                        <TextField
                            label="Email"
                            type="email"
                            value={createForm.data.email}
                            error={createForm.errors.email}
                            onChange={(value) =>
                                createForm.setData(
                                    'email',
                                    value,
                                )
                            }
                        />

                        <TextField
                            label="Password"
                            type="password"
                            value={
                                createForm.data.password
                            }
                            error={
                                createForm.errors.password
                            }
                            onChange={(value) =>
                                createForm.setData(
                                    'password',
                                    value,
                                )
                            }
                        />

                        <TextField
                            label="Konfirmasi password"
                            type="password"
                            value={
                                createForm.data
                                    .password_confirmation
                            }
                            onChange={(value) =>
                                createForm.setData(
                                    'password_confirmation',
                                    value,
                                )
                            }
                        />

                        <FormActions
                            processing={
                                createForm.processing
                            }
                            submitLabel="Simpan Admin"
                            onCancel={() =>
                                setCreateOpen(false)
                            }
                        />
                    </form>
                </Modal>
            )}

            {editingUser && (
                <Modal
                    title="Edit Admin"
                    description={editingUser.email}
                    onClose={() =>
                        setEditingUser(null)
                    }
                >
                    <form
                        onSubmit={submitEdit}
                        className="space-y-4"
                    >
                        <TextField
                            label="Nama lengkap"
                            value={editForm.data.name}
                            error={editForm.errors.name}
                            onChange={(value) =>
                                editForm.setData(
                                    'name',
                                    value,
                                )
                            }
                        />

                        <TextField
                            label="Email"
                            type="email"
                            value={editForm.data.email}
                            error={
                                editForm.errors.email
                            }
                            onChange={(value) =>
                                editForm.setData(
                                    'email',
                                    value,
                                )
                            }
                        />

                        <label className="flex items-center gap-3 rounded-xl border border-black/10 p-4">
                            <input
                                type="checkbox"
                                checked={
                                    editForm.data
                                        .is_active
                                }
                                onChange={(event) =>
                                    editForm.setData(
                                        'is_active',
                                        event.target
                                            .checked,
                                    )
                                }
                                className="rounded border-black/20 text-[#ffb800] focus:ring-[#ffb800]"
                            />

                            <span>
                                <span className="block text-sm font-bold">
                                    Akun aktif
                                </span>
                                <span className="text-xs text-[#777]">
                                    Pengguna dapat login ke
                                    aplikasi.
                                </span>
                            </span>
                        </label>

                        <FormActions
                            processing={
                                editForm.processing
                            }
                            submitLabel="Simpan Perubahan"
                            onCancel={() =>
                                setEditingUser(null)
                            }
                        />
                    </form>
                </Modal>
            )}

            {passwordUser && (
                <Modal
                    title="Reset Password"
                    description={`Buat password baru untuk ${passwordUser.name}.`}
                    onClose={() =>
                        setPasswordUser(null)
                    }
                >
                    <form
                        onSubmit={submitPassword}
                        className="space-y-4"
                    >
                        <TextField
                            label="Password baru"
                            type="password"
                            value={
                                passwordForm.data
                                    .password
                            }
                            error={
                                passwordForm.errors
                                    .password
                            }
                            onChange={(value) =>
                                passwordForm.setData(
                                    'password',
                                    value,
                                )
                            }
                        />

                        <TextField
                            label="Konfirmasi password"
                            type="password"
                            value={
                                passwordForm.data
                                    .password_confirmation
                            }
                            onChange={(value) =>
                                passwordForm.setData(
                                    'password_confirmation',
                                    value,
                                )
                            }
                        />

                        <FormActions
                            processing={
                                passwordForm.processing
                            }
                            submitLabel="Reset Password"
                            onCancel={() =>
                                setPasswordUser(null)
                            }
                        />
                    </form>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}

function SummaryCard({
    label,
    value,
    icon: Icon,
    color = 'yellow',
}: {
    label: string;
    value: string | number;
    icon: typeof UserRound;
    color?: 'yellow' | 'emerald' | 'red';
}) {
    const colors = {
        yellow: 'bg-[#fff4d2] text-[#b07e00]',
        emerald: 'bg-emerald-50 text-emerald-700',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <article className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
            <div
                className={`mb-4 inline-flex rounded-xl p-3 ${colors[color]}`}
            >
                <Icon className="h-5 w-5" />
            </div>

            <p className="text-2xl font-black">
                {value}
            </p>

            <p className="mt-1 text-xs text-[#777]">
                {label}
            </p>
        </article>
    );
}

function UserCard({
    user,
    onEdit,
    onPassword,
    onToggle,
}: {
    user: UserItem;
    onEdit: () => void;
    onPassword: () => void;
    onToggle: () => void;
}) {
    return (
        <article className="rounded-2xl border border-black/[0.08] p-5">
            <div className="flex items-start gap-3">
                <UserAvatar user={user} />

                <div className="min-w-0">
                    <p className="truncate text-sm font-black">
                        {user.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#777]">
                        {user.email}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <RoleBadge role={user.role} />
                <StatusBadge active={user.is_active} />
            </div>

            <p className="mt-4 text-xs text-[#888]">
                Dibuat {formatDate(user.created_at)}
            </p>

            {user.role === 'admin' && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-black/5 pt-4">
                    <ActionButtons
                        user={user}
                        onEdit={onEdit}
                        onPassword={onPassword}
                        onToggle={onToggle}
                    />
                </div>
            )}
        </article>
    );
}

function UserAvatar({
    user,
}: {
    user: UserItem;
}) {
    return (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#202020] text-sm font-black text-[#ffb800]">
            {user.name.charAt(0).toUpperCase()}
        </div>
    );
}

function RoleBadge({
    role,
}: {
    role: UserItem['role'];
}) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                role === 'super_admin'
                    ? 'bg-[#fff4d2] text-[#9a6d00]'
                    : 'bg-slate-100 text-slate-600'
            }`}
        >
            {role === 'super_admin' && (
                <ShieldCheck className="h-3 w-3" />
            )}

            {role === 'super_admin'
                ? 'Super Admin'
                : 'Admin'}
        </span>
    );
}

function StatusBadge({
    active,
}: {
    active: boolean;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
            }`}
        >
            {active ? (
                <CheckCircle2 className="h-3 w-3" />
            ) : (
                <UserX className="h-3 w-3" />
            )}

            {active ? 'Aktif' : 'Nonaktif'}
        </span>
    );
}

function ActionButtons({
    user,
    onEdit,
    onPassword,
    onToggle,
}: {
    user: UserItem;
    onEdit: () => void;
    onPassword: () => void;
    onToggle: () => void;
}) {
    return (
        <>
            <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-2 text-xs font-bold hover:bg-black/5"
            >
                <Pencil className="h-3.5 w-3.5" />
                Edit
            </button>

            <button
                type="button"
                onClick={onPassword}
                className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-2 text-xs font-bold hover:bg-black/5"
            >
                <KeyRound className="h-3.5 w-3.5" />
                Password
            </button>

            <button
                type="button"
                onClick={onToggle}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${
                    user.is_active
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
            >
                {user.is_active ? (
                    <UserX className="h-3.5 w-3.5" />
                ) : (
                    <UserCheck className="h-3.5 w-3.5" />
                )}

                {user.is_active
                    ? 'Nonaktifkan'
                    : 'Aktifkan'}
            </button>
        </>
    );
}

function TextField({
    label,
    value,
    onChange,
    type = 'text',
    error,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    error?: string;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-bold">
                {label}
            </span>

            <input
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className="w-full rounded-xl border-black/10 focus:border-[#ffb800] focus:ring-[#ffb800]"
            />

            {error && (
                <span className="mt-1 block text-xs text-red-600">
                    {error}
                </span>
            )}
        </label>
    );
}

function FormActions({
    processing,
    submitLabel,
    onCancel,
}: {
    processing: boolean;
    submitLabel: string;
    onCancel: () => void;
}) {
    return (
        <div className="flex justify-end gap-2 border-t border-black/5 pt-4">
            <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-bold"
            >
                Batal
            </button>

            <button
                type="submit"
                disabled={processing}
                className="rounded-xl bg-[#ffb800] px-4 py-2.5 text-sm font-black text-[#202020] disabled:opacity-50"
            >
                {processing
                    ? 'Menyimpan...'
                    : submitLabel}
            </button>
        </div>
    );
}

function Modal({
    title,
    description,
    children,
    onClose,
}: {
    title: string;
    description: string;
    children: React.ReactNode;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-black/5 p-5">
                    <div>
                        <h2 className="font-black">
                            {title}
                        </h2>

                        <p className="mt-1 text-xs text-[#777]">
                            {description}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-black/5"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}