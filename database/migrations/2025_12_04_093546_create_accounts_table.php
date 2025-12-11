<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       // ... in the up() method
Schema::create('accounts', function (Blueprint $table) {
    $table->id(); // This will serve as the Account Number
    $table->foreignId('customer_id')->constrained()->onDelete('cascade');
    $table->enum('account_type', ['Savings', 'Current', 'Fixed Deposit']);
    $table->decimal('balance', 15, 2)->default(0.00); // Max balance of 99,999,999,999,999.99
    $table->enum('status', ['Active', 'Suspended', 'Closed'])->default('Active');
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
