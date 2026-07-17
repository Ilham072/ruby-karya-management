import { Link, usePage } from '@inertiajs/react';
import {
    Archive,
    Bell,
    BriefcaseBusiness,
    ChevronDown,
    FileText,
    LayoutDashboard,
    LogOut,
    Menu,
    ReceiptText,
    Settings,
    UserCog,
    UserCircle,
    UsersRound,
    WalletCards,
    X,
} from 'lucide-react';
import { PropsWithChildren, ReactNode, useState } from 'react';

const mainNavigation = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        label: 'Proyek',
        href: '/projects',
        icon: BriefcaseBusiness,
    },
    {
        label: 'Pelanggan',
        href: '/customers',
        icon: UsersRound,
    },
    {
        label: 'Invoice',
        href: '/invoices',
        icon: FileText,
    },
    {
        label: 'Pembayaran',
        href: '/payments',
        icon: WalletCards,
    },
    {
        label: 'Kwitansi',
        href: '/receipts',
        icon: ReceiptText,
    },
    {
        label: 'Arsip',
        href: '/archives',
        icon: Archive,
    },
];

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const page = usePage();
    const user = (page.props as any).auth.user;
    const navigation =
    user.role === 'super_admin'
        ? [
              ...mainNavigation,
              {
                  label: 'Pengguna',
                  href: '/users',
                  icon: UserCog,
              },
          ]
        : mainNavigation;
    const currentPath = new URL(page.url, window.location.origin).pathname;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const isActive = (href: string) =>
        href === '/dashboard'
            ? currentPath === '/dashboard'
            : currentPath.startsWith(href);

    const roleLabel =
        user.role === 'super_admin' ? 'Super Admin' : 'Admin';

    return (
        <div className="min-h-screen bg-[#f5f5f3] text-[#232323]">
            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Tutup navigasi"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/45 lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#202020] text-white transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffb800] text-sm font-black text-[#202020]">
                            RK
                        </div>

                        <div>
                            <p className="text-sm font-black tracking-wide">
                                RUBY KARYA
                            </p>
                            <p className="text-xs text-white/55">
                                Management
                            </p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-xl p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-6 pb-3 pt-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
                        Menu Utama
                    </p>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-4">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                    active
                                        ? 'bg-[#ffb800] text-[#202020]'
                                        : 'text-white/65 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="border-t border-white/10 p-4">
                    <Link
                        href={
                            user.role === 'super_admin'
                            ? '/company-settings'
                            : '/profile'
                        }
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/65 hover:bg-white/10 hover:text-white"
>
                        <Settings className="h-5 w-5" />

                        {user.role === 'super_admin'
                            ? 'Pengaturan Perusahaan'
                            : 'Pengaturan'}
                    </Link>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/65 hover:bg-red-500/15 hover:text-red-300"
                    >
                        <LogOut className="h-5 w-5" />
                        Keluar
                    </Link>
                </div>
            </aside>

            <div className="lg:pl-[280px]">
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-black/5 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-xl border border-black/10 p-2.5 hover:bg-black/5 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div>
                            <p className="text-sm font-bold text-[#232323] sm:text-base">
                                Ruby Karya Management
                            </p>
                            <p className="hidden text-xs text-[#777] sm:block">
                                Kelola proyek, invoice, dan pembayaran
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            className="relative rounded-xl border border-black/10 p-2.5 text-[#555] hover:bg-black/5"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ffb800]" />
                        </button>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() =>
                                    setProfileOpen((current) => !current)
                                }
                                className="flex items-center gap-3 rounded-xl border border-black/10 px-2 py-2 hover:bg-black/5 sm:px-3"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#202020] text-sm font-bold text-[#ffb800]">
                                    {user.name?.charAt(0)?.toUpperCase() ?? 'A'}
                                </div>

                                <div className="hidden text-left sm:block">
                                    <p className="max-w-36 truncate text-sm font-bold">
                                        {user.name}
                                    </p>
                                    <p className="text-[11px] text-[#777]">
                                        {roleLabel}
                                    </p>
                                </div>

                                <ChevronDown className="hidden h-4 w-4 text-[#777] sm:block" />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-xl">
                                    <div className="border-b border-black/5 px-3 py-3">
                                        <p className="truncate text-sm font-bold">
                                            {user.name}
                                        </p>
                                        <p className="truncate text-xs text-[#777]">
                                            {user.email}
                                        </p>
                                    </div>

                                    <Link
                                        href="/profile"
                                        className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-black/5"
                                    >
                                        <UserCircle className="h-4 w-4" />
                                        Profil Saya
                                    </Link>

                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Keluar
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {header && (
                    <div className="border-b border-black/5 bg-white px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                )}

                <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}