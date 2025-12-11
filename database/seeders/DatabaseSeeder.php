<?php

namespace Database\Seeders;
// Use singular model name
use App\Models\accounts;
use App\Models\Customers; // Use singular model name
use App\Models\roles;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $password = Hash::make('12345678'); // Default password for all test users

        // 1. Define and Create Roles
        $rolesData = [
            'admin',
            'cashier',
            'loan_officer',
        ];

        foreach ($rolesData as $roleName) {
            roles::firstOrCreate(['name' => $roleName]);
        }

        $roles = Roles::pluck('id', 'name');
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@bank.com'],
            [
                'name' => 'System Administrator',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );
        if ($roles->has('admin')) {
            $adminUser->roles()->syncWithoutDetaching($roles['admin']);
        }

        // --- 2.2. Cashier User ---
        $cashierUser = User::firstOrCreate(
            ['email' => 'cashier@bank.com'],
            [
                'name' => 'Cashier Employee',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );
        if ($roles->has('cashier')) {
            $cashierUser->roles()->syncWithoutDetaching($roles['cashier']);
        }

        // --- 2.3. Loan Officer User ---
        $loanOfficerUser = User::firstOrCreate(
            ['email' => 'loan.officer@bank.com'],
            [
                'name' => 'Loan Officer',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );
        if ($roles->has('loan_officer')) {
            $loanOfficerUser->roles()->syncWithoutDetaching($roles['loan_officer']);
        }

        $this->command->info('Test employees created with password: 12345678');


        // 3. Create Customer Users (in 'users' table) and Link to Customer Profiles

        // --- 3.1. Alice Customer User ---
        User::firstOrCreate(
            ['email' => 'alice@test.com'],
            [
                'name' => 'Alice Johnson',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );

        // --- 3.2. Bob Customer User ---
        User::firstOrCreate(
            ['email' => 'bob@test.com'],
            [
                'name' => 'Bob Smith',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );


        // 4. Create Test Customer Profiles (in 'customers' table) and Accounts
        
        $customer1 = Customers::firstOrCreate(
            ['email' => 'alice@test.com'],
            [
                'name' => 'Alice Johnson',
                'phone' => '555-0001',
                'address' => '123 Main St, Anytown',
                'kyc_status' => 'Verified',
            ]
        );

        accounts::firstOrCreate(
            ['customer_id' => $customer1->id, 'account_type' => 'Savings'],
            [
                'balance' => 15000.50,
                'status' => 'Active',
            ]
        );

        $customer2 = Customers::firstOrCreate(
            ['email' => 'bob@test.com'],
            [
                'name' => 'Bob Smith',
                'phone' => '555-0002',
                'address' => '456 Oak Ave, Big City',
                'kyc_status' => 'Pending', // Pending KYC for testing
            ]
        );

        Accounts::firstOrCreate(
            ['customer_id' => $customer2->id, 'account_type' => 'Current'],
            [
                'balance' => 75000.00,
                'status' => 'Active',
            ]
        );

        $this->command->info('Test customers and accounts created.');
    }
}