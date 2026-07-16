<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentArchive extends Model
{
    use HasFactory;

    protected $fillable = [
        'document_type',
        'document_id',
        'file_name',
        'local_file_path',
        'drive_file_id',
        'drive_folder_id',
        'drive_url',
        'mime_type',
        'archived_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'archived_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}