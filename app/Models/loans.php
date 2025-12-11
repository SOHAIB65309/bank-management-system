<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class loans extends Model
{
    use HasFactory;

    protected $fillable = ['customer_id', 'amount', 'interest_rate', 'term_months', 'status','approved_at'];

    // One-to-Many inverse: A Loan belongs to one Customer
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customers::class);
    }

    // One-to-Many relationship: A Loan has many EMIs
    public function emis(): HasMany
    {
        return $this->hasMany(Emis::class,'loan_id');
    }
}
