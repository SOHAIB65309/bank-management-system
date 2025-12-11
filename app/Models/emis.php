<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class emis extends Model
{
    use HasFactory;

    protected $table = 'emis'; 
    protected $fillable = ['loan_id', 'due_date', 'amount_due', 'payment_date', 'status'];

    // One-to-Many inverse: An EMI belongs to one Loan
    public function loan(): BelongsTo
    {
        return $this->belongsTo(loans::class);
    }
}
