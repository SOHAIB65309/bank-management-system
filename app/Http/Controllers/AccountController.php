<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSecondaryAccountRequest;
use App\Models\accounts;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AccountController extends Controller
{
    /**
     * Display a listing of accounts (e.g., for general Cashier overview).
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        // Check for authorization before proceeding
        if (!$request->user() || !($request->user()->hasRole('admin') || $request->user()->hasRole('cashier'))) {
            // Should be handled by middleware, but good practice for internal checks
            abort(403, 'Unauthorized action.');
        }

        $accountsQuery = Accounts::with('customer:id,name,email') // Eager load minimal customer details
            ->select('accounts.*');

        if ($search) {
            // Search by Account ID, Customer Name, or Customer Email
            // Note: Searching the ID requires direct comparison, others use LIKE
            $accountsQuery->where(function ($query) use ($search) {
                $query->where('accounts.id', $search)
                    ->orWhereHas('customer', function ($query) use ($search) {
                        $query->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $accounts = $accountsQuery->latest('accounts.created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Account/AccountIndex', [
            'accounts' => $accounts,
            'search' => $search,
        ]);
    }

    /**
     * Store a newly created secondary account for an existing customer.
     * This handles the form submission from CustomerShow.tsx.
     */
    public function store(StoreSecondaryAccountRequest $request)
    {
        // Validation handled by StoreSecondaryAccountRequest: customer_id exists, 
        // account_type is valid, and initial_balance is >= 0.

        try {
            DB::transaction(function () use ($request) {
                // 1. Create the new Account
                accounts::create([
                    'customer_id' => $request->customer_id,
                    'account_type' => $request->account_type,
                    'balance' => $request->initial_balance,
                    'status' => 'Active',
                ]);
            });

            // Redirect back to the customer's detailed view page
            return redirect()->route('customers.show', $request->customer_id)
                ->with('success', 'New secondary account opened successfully.');

        } catch (\Exception $e) {
            Log::error("Secondary account creation failed for Customer ID {$request->customer_id}: " . $e->getMessage());
            return redirect()->back()->with('error', 'Error opening new account: Could not complete the transaction.');
        }
    }
}
