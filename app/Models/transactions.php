<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class transactions extends Model
{
   use  HasFactory;

    protected $fillable = ['account_id', 'type', 'amount', 'description'];

    // One-to-Many inverse: A Transaction belongs to one Account
    public function account(): BelongsTo
    {
        return $this->belongsTo(Accounts::class);
    }
}
