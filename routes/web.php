<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerPortalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CustomerAuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');
Route::prefix('customer')->group(function () {
    // Customer Register Form
    Route::get('/register', [CustomerAuthController::class, 'registerForm'])->name('customer.register.form');
    Route::post('/register', [CustomerAuthController::class, 'register'])->name('customer.register');
});


Route::middleware(['auth', 'verified'])->group(function () {

    // --- DASHBOARD (General Entry Point for all roles) ---
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::prefix('customer')->group(function () {
        Route::post('/account/lookup', [TransactionController::class, 'lookupAccount'])->name('api.account.lookup');
        Route::get('/transfer', [CustomerPortalController::class, 'transferForm'])->name('customer.transfer');
        Route::get('/loans/apply', [CustomerPortalController::class, 'loanApplyForm'])->name('customer.loan.apply.form');
        Route::post('/loans/apply', [LoanController::class, 'store'])->name('loans.store');
        Route::post('/transactions/transfer', [TransactionController::class, 'transfer'])->name('transactions.transfer');
        Route::get('/emis', [CustomerPortalController::class, 'emiForm'])->name('customer.emis.index');
        Route::put('/emis/{emi}/pay', [LoanController::class, 'payEmiFromCustomer'])->name('customer.emis.pay');

    });

    // --- EMPLOYEE MANAGEMENT ROUTES ---
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/employees', [AdminController::class, 'employeesIndex'])->name('admin.employees.index');
        Route::get('/admin/employees/create', [AdminController::class, 'employeesCreate'])->name('admin.employees.create');
        Route::post('/admin/employees', [AdminController::class, 'employeeStore'])->name('admin.employees.store');

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
        Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
        Route::post('/api/account/lookup', [TransactionController::class, 'lookupAccount'])->name('api.account.lookup');
        Route::post('/transactions/deposit', [TransactionController::class, 'deposit'])->name('transactions.deposit');
        Route::post('/transactions/withdrawal', [TransactionController::class, 'withdrawal'])->name('transactions.withdrawal');
        Route::post('/transactions/transfer', [TransactionController::class, 'transfer'])->name('transactions.transfer');
    });

    // --- 4. Loan Management (Accessible by Admin and Loan Officer) ---
    Route::middleware('role:admin|loan_officer')->group(function () {
        Route::get('/loans/applications', [LoanController::class, 'index'])->name('loans.applications.index');
        Route::post('/loans/approve/{loan}', [LoanController::class, 'approve'])->name('loans.approve');
        Route::get('/loans/emis', [LoanController::class, 'emiIndex'])->name('loans.emis.index');
        Route::post('/loans/emis/{emi}/pay', [LoanController::class, 'payEmi'])->name('loans.emis.pay');
        // Loan application submission used by staff or customer
    });
});

require __DIR__ . '/settings.php';