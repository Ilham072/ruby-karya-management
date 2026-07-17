<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    protected $fillable = [
        'company_name',
        'director_name',
        'address',
        'phone',
        'email',
        'instagram',
        'website',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
        'invoice_prefix',
        'receipt_prefix',
        'signature_file_path',
        'stamp_file_path',
    ];
}