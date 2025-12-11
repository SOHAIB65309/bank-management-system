<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Customers;
use App\Models\Accounts;
use Illuminate\Support\Facades\DB;
class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $customersQuery = customers::with('accounts') // Eager load accounts
            ->select('customers.*')
            ->selectSub(function ($query) {
                $query->select(DB::raw('SUM(balance)'))
                      ->from('accounts')
                      ->whereColumn('accounts.customer_id', 'customers.id');
            }, 'total_balance');

        if ($search) {
            $customersQuery->where('name', 'like', "%{$search}%")
                           ->orWhere('email', 'like', "%{$search}%")
                           ->orWhere('phone', 'like', "%{$search}%");
        }
        
        // Default sorting: Newest customers first, or by search relevance
        $customers = $customersQuery->latest('customers.created_at')
                                    ->paginate(15)
                                    ->withQueryString();

        return Inertia::render('customer/CustomerIndex', [
            'customers' => $customers,
            'search' => $search,
        ]);
    }

     /**
     * Show the form for creating a new customer (Registration).
     */
    public function create()
    {
        $accountTypes = ['Savings', 'Current', 'Fixed Deposit'];
        $kycStatuses = ['Pending', 'Verified']; 
        
        return Inertia::render('customer/CustomerCreate', [
            'accountTypes' => $accountTypes,
            'kycStatuses' => $kycStatuses,
        ]);
    }

    /**
     * Store a newly created customer and their initial account.
     */
    public function store(StoreCustomerRequest $request)
    {
        // Use a database transaction to ensure both customer and account are created successfully
        try {
            DB::transaction(function () use ($request) {
                // 1. Create the Customer record
                $customer = Customers::create($request->only([
                    'name', 
                    'email', 
                    'phone', 
                    'address', 
                    'kyc_status'
                ]));

                // 2. Create the initial Account linked to the new customer
                Accounts::create([
                    'customer_id' => $customer->id,
                    'account_type' => $request->account_type,
                    'balance' => $request->initial_balance,
                    'status' => 'Active', // Default status for new accounts
                ]);
            });

            return redirect()->route('customers.index')->with('success', 'New customer and initial account created successfully.');

        } catch (\Exception $e) {
            Log::error("Customer and Account creation failed: " . $e->getMessage());
            return redirect()->back()->with('error', 'Registration failed: Could not create customer and initial account.');
        }
    }
    public function show(Customers $customer)
    {
        // Load accounts and the 5 most recent transactions for each account
        $customer->load([
            'accounts' => function ($query) {
                $query->with(['transactions' => function ($q) {
                    $q->latest()->limit(5); 
                }]);
            }
        ]);
        
        // Calculate the total balance for the customer across all accounts
        $totalBalance = $customer->accounts->sum('balance');

        return Inertia::render('Customer/CustomerShow', [
            'customer' => $customer,
            'totalBalance' => $totalBalance,
            'accountTypes' => ['Savings', 'Current', 'Fixed Deposit'], // For opening new accounts
        ]);
    }
/**
     * Show the form for editing the specified customer profile.
     */
    public function edit(Customers $customer)
    {
        $kycStatuses = ['Pending', 'Verified', 'Rejected'];
        
        return Inertia::render('Customer/CustomerEdit', [
            'customer' => $customer,
            'kycStatuses' => $kycStatuses,
        ]);
    }

    /**
     * Update the specified customer profile in storage.
     */
    public function update(UpdateCustomerRequest $request, Customers $customer)
    {
        try {
            $customer->update($request->validated());

            return redirect()->route('customers.show', $customer->id)
                             ->with('success', 'Customer profile updated and KYC status checked.');

        } catch (\Exception $e) {
            Log::error("Customer update failed for ID {$customer->id}: " . $e->getMessage());
            return redirect()->back()->with('error', 'Profile update failed.');
        }
    }
}
