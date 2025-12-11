<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class customers extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'email', 'phone', 'address','kyc_status'];
    public function accounts()
    {
        return $this->HasMany(accounts::class,'customer_id');
    }
    public function loans()
    {
        return $this->HasMany(loans::class,'customer_id');
    }
    
}
