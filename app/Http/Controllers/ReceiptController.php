<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReceiptController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search'));

        $receipts = Receipt::query()
            ->with([
                'payment:id,invoice_id,payment_date,amount,payment_method',
                'payment.invoice:id,project_id,invoice_number',
                'payment.invoice.project:id,customer_id,name',
                'payment.invoice.project.customer:id,name',
            ])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where(
                            'receipt_number',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhereHas(
                            'payment.invoice',
                            function ($query) use ($search) {
                                $query->where(
                                    'invoice_number',
                                    'like',
                                    "%{$search}%"
                                );
                            }
                        )
                        ->orWhereHas(
                            'payment.invoice.project',
                            function ($query) use ($search) {
                                $query->where(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                );
                            }
                        );
                });
            })
            ->latest('receipt_date')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Receipts/Index', [
            'receipts' => $receipts,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }
}