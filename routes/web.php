<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    // --- DASHBOARD (General Entry Point for all roles) ---
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // --- ADMIN PORTAL ENTRY POINT ---
    // This is the main hub for Admin-specific tasks
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/employees', [AdminController::class, 'employeesIndex'])->name('admin.employees.index');
        Route::get('/admin/employees/create', [AdminController::class, 'employeesCreate'])->name('admin.employees.create');
        Route::post('/admin/employees', [AdminController::class, 'employeestore'])->name('admin.employees.store');
        Route::get('/admin/roles', [AdminController::class, 'rolesIndex'])->name('admin.roles.index');
        Route::put('/admin/roles/{user}', [AdminController::class, 'updateUserRoles'])->name('admin.roles.update');

    });


    // --- 2. Customer Management (Accessible by Admin and Cashier) ---
    Route::middleware('role:admin|cashier')->group(function () {
        Route::resource('customers', CustomerController::class); // CRUD operations
    });

    // --- 3. Account & Transaction Management (Accessible by Admin and Cashier) ---
    Route::middleware('role:admin|cashier')->group(function () {
        Route::get('/accounts', [AccountController::class, 'index'])->name('accounts.index');

        // Index page for transactions (hosting Deposit/Withdrawal forms)
        Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');

        // API Endpoint for Account Lookup
        Route::post('/api/account/lookup', [TransactionController::class, 'lookupAccount'])->name('api.account.lookup');

        // Transaction Endpoints
        Route::post('/transactions/deposit', [TransactionController::class, 'deposit'])->name('transactions.deposit');
        Route::post('/transactions/withdrawal', [TransactionController::class, 'withdrawal'])->name('transactions.withdrawal');
        Route::post('/transactions/transfer', [TransactionController::class, 'transfer'])->name('transactions.transfer');
    });
    // --- 4. Loan Management (Accessible by Admin and Loan Officer) ---
    Route::middleware('role:admin|loan_officer')->group(function () {

        // Loan Application Index (Viewing all applications)
        Route::get('/loans/applications', [LoanController::class, 'index'])->name('loans.index');

        // Loan Application Approval/Rejection Action (Using POST/PUT for status change)
        Route::post('/loans/approve/{loan}', [LoanController::class, 'approve'])->name('loans.approve');

        // EMI Tracking Index
        Route::get('/loans/emis', [LoanController::class, 'emiIndex'])->name('loans.emis.index');

        // EMI Payment Action
        Route::post('/loans/emis/{emi}/pay', [LoanController::class, 'payEmi'])->name('loans.emis.pay');

        // Additional: Loan Application Submission (for customers/staff)
        Route::post('/loans/apply', [LoanController::class, 'store'])->name('loans.store');
    });
});

require __DIR__ . '/settings.php';