<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureSuperAdmin($request);

        $users = User::query()
            ->orderByRaw(
                "CASE
                    WHEN role = 'super_admin' THEN 0
                    ELSE 1
                END"
            )
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'email',
                'role',
                'is_active',
                'created_at',
                'updated_at',
            ]);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'summary' => [
                'total' => $users->count(),
                'active' => $users
                    ->where('is_active', true)
                    ->count(),
                'inactive' => $users
                    ->where('is_active', false)
                    ->count(),
                'admin' => $users
                    ->where('role', 'admin')
                    ->count(),
                'maximum' => 3,
            ],
            'canCreate' => $users->count() < 3,
        ]);
    }

    public function store(
        Request $request
    ): RedirectResponse {
        $this->ensureSuperAdmin($request);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
            ],
            'email' => [
                'required',
                'email',
                'max:150',
                'unique:users,email',
            ],
            'password' => [
                'required',
                'confirmed',
                Password::min(8),
            ],
        ]);

        DB::transaction(function () use ($validated) {
            $totalUsers = User::query()
                ->lockForUpdate()
                ->count();

            if ($totalUsers >= 3) {
                abort(
                    422,
                    'Jumlah pengguna sudah mencapai batas maksimal.'
                );
            }

            User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' =>
                    $validated['password'],
                'role' => 'admin',
                'is_active' => true,
            ]);
        });

        return back()->with(
            'success',
            'Akun Admin berhasil ditambahkan.'
        );
    }

    public function update(
        Request $request,
        User $user
    ): RedirectResponse {
        $this->ensureSuperAdmin($request);
        $this->ensureManageableAdmin($user);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
            ],
            'email' => [
                'required',
                'email',
                'max:150',
                Rule::unique('users', 'email')
                    ->ignore($user->id),
            ],
            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'is_active' =>
                $validated['is_active'],
        ]);

        return back()->with(
            'success',
            'Data Admin berhasil diperbarui.'
        );
    }

    public function resetPassword(
        Request $request,
        User $user
    ): RedirectResponse {
        $this->ensureSuperAdmin($request);
        $this->ensureManageableAdmin($user);

        $validated = $request->validate([
            'password' => [
                'required',
                'confirmed',
                Password::min(8),
            ],
        ]);

        $user->update([
            'password' => $validated['password'],
            'remember_token' => null,
        ]);

        return back()->with(
            'success',
            'Password Admin berhasil diperbarui.'
        );
    }

    private function ensureSuperAdmin(
        Request $request
    ): void {
        abort_unless(
            $request->user()?->role
                === 'super_admin',
            403,
            'Menu ini hanya dapat diakses oleh Super Admin.'
        );
    }

    private function ensureManageableAdmin(
        User $user
    ): void {
        abort_if(
            $user->role === 'super_admin',
            403,
            'Akun Super Admin tidak dapat dikelola dari menu ini.'
        );
    }
}