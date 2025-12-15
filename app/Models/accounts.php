<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class accounts extends Model
{
   use HasFactory;

    protected $fillable = ['customer_id', 'account_type', 'balance', 'status'];

    // One-to-Many inverse: An Account belongs to one Customer
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customers::class);
    }

    // One-to-Many relationship: An Account has many Transactions
    public function transactions(): HasMany
    {
        return $this->hasMany(Transactions::class,'account_id');
    }
}
