<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\DocumentPdfController;
use App\Http\Controllers\ArchiveController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware('auth')
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::resource('customers', CustomerController::class)
    ->only(['index', 'store', 'update', 'destroy']);
    Route::resource('projects', ProjectController::class)
    ->only(['index', 'store', 'update', 'destroy']);
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/invoices', [InvoiceController::class, 'index'])
        ->name('invoices.index');

    Route::get('/invoices/create', [InvoiceController::class, 'create'])
        ->name('invoices.create');

    Route::post('/invoices', [InvoiceController::class, 'store'])
        ->name('invoices.store');

    Route::patch(
        '/invoices/{invoice}/publish',
        [InvoiceController::class, 'publish']
    )->name('invoices.publish');

    Route::delete(
    '/invoices/{invoice}',
        [InvoiceController::class, 'destroy']
    )->name('invoices.destroy');

    Route::get('/payments', [PaymentController::class, 'index'])
    ->name('payments.index');

    Route::get('/payments/create', [PaymentController::class, 'create'])
        ->name('payments.create');

    Route::post('/payments', [PaymentController::class, 'store'])
        ->name('payments.store');

    Route::get('/receipts', [ReceiptController::class, 'index'])
        ->name('receipts.index');

    Route::get('/invoices/{invoice}/pdf', [DocumentPdfController::class, 'invoice'])
        ->name('invoices.pdf');

    Route::get('/receipts/{receipt}/pdf', [DocumentPdfController::class, 'receipt'])
        ->name('receipts.pdf');
        
    Route::get('/archives', [ArchiveController::class, 'index'])
        ->name('archives.index');

    Route::get('/archives/{archive}/open', [ArchiveController::class, 'open'])
        ->name('archives.open');

    Route::post('/archives/{archive}/sync', [ArchiveController::class, 'sync'])
        ->name('archives.sync');
    
    Route::get('/users', [UserManagementController::class, 'index'])
        ->name('users.index');

    Route::post('/users', [UserManagementController::class, 'store'])
        ->name('users.store');

    Route::patch('/users/{user}', [UserManagementController::class, 'update'])
        ->name('users.update');

    Route::patch('/users/{user}/password', [UserManagementController::class, 'resetPassword',])
        ->name('users.password');
    
});

require __DIR__.'/auth.php';
