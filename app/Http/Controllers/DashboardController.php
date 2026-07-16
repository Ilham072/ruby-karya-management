<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $summary = [
            'total_projects' => DB::table('projects')->count(),

            'active_projects' => DB::table('projects')
                ->where('status', 'active')
                ->count(),

            'total_invoices' => DB::table('invoices')
                ->whereNotIn('status', ['draft', 'cancelled'])
                ->count(),

            'outstanding_amount' => (float) DB::table('invoices')
                ->whereIn('status', ['published', 'partial', 'overdue'])
                ->sum('remaining_amount'),

            'total_payments' => (float) DB::table('payments')
                ->where('status', 'recorded')
                ->sum('amount'),
        ];

        $recentInvoices = DB::table('invoices')
            ->join('projects', 'projects.id', '=', 'invoices.project_id')
            ->join('customers', 'customers.id', '=', 'projects.customer_id')
            ->select([
                'invoices.id',
                'invoices.invoice_number',
                'invoices.invoice_date',
                'invoices.due_date',
                'invoices.total_amount',
                'invoices.remaining_amount',
                'invoices.status',
                'projects.name as project_name',
                'customers.name as customer_name',
            ])
            ->latest('invoices.created_at')
            ->limit(5)
            ->get();

        $recentPayments = DB::table('payments')
            ->join('invoices', 'invoices.id', '=', 'payments.invoice_id')
            ->join('projects', 'projects.id', '=', 'invoices.project_id')
            ->where('payments.status', 'recorded')
            ->select([
                'payments.id',
                'payments.payment_date',
                'payments.amount',
                'payments.payment_method',
                'invoices.invoice_number',
                'projects.name as project_name',
            ])
            ->latest('payments.created_at')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'summary' => $summary,
            'recentInvoices' => $recentInvoices,
            'recentPayments' => $recentPayments,
        ]);
    }
}