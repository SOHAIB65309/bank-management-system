<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\customers;
use App\Models\Account;
use Illuminate\Support\Facades\Log;

class CustomerPortalController extends Controller
{
    /**
     * Show the customer fund transfer view with required data.
     */
    public function transferForm(Request $request)
    {
        $user = $request->user();

        // Find the customer linked to the authenticated user's email
        $customer = customers::where('email', $user->email)->first();

        if (!$customer) {
            // This should ideally not happen if seeding is correct, but handles unregistered users
            return redirect()->route('dashboard')->with('error', 'Customer profile not linked.');
        }

        // Fetch active accounts for the customer to use as source accounts
        $customerAccounts = $customer->accounts()
            ->where('status', 'Active')
            ->select('id', 'account_type', 'balance')
            ->get();

        return Inertia::render( 'customer/CustomerTransfer', [
            'customerAccounts' => $customerAccounts,
            'customerName' => $customer->name,
            'customerId' => $customer->id,
        ]);
    }
/**
     * Show the customer loan application view.
     */
    public function loanApplyForm(Request $request)
    {
        $user = $request->user();
        $customer = Customers::where('email', $user->email)->first(); // Using singular model

        if (!$customer) {
            return redirect()->route('dashboard')->with('error', 'Customer profile not linked.');
        }

        // Pass customer data for form pre-population
        return Inertia::render('customer/LoanApply', [
            'customerId' => $customer->id,
            'customerName' => $customer->name,
            // You can pass default loan parameters here if needed
        ]);
    }
    /**
     * Show the customer EMI payment view with required data.
     */
     public function emiForm(Request $request)
    {
        $user = $request->user();
        $customer = Customers::where('email', $user->email)->first(); // Using singular model

        if (!$customer) {
            return redirect()->route('dashboard')->with('error', 'Customer profile not linked for EMI view.');
        }
 $customerAccounts = $customer->accounts()
            ->where('status', 'Active')
            ->select('id', 'account_type', 'balance')
            ->get();
        // Fetch active accounts (for source of payment)
        $pendingEmis = $customer->loans()
            ->whereIn('status', ['Approved', 'Late'])
            // FIX: Changed Eager Loading to a simple 'with' to avoid binding issues causing the RelationNotFoundException.
            ->with('emis') 
            ->get()
            ->pluck('emis')
            ->flatten()
            // FIX: Perform filtering in PHP after fetching for robustness
            ->filter(fn($emi) => in_array($emi->status, ['Pending', 'Late'])) 
            ->sortBy('due_date')
            ->values();
        // Removed dd($pendingEmis) to allow the app to render
        return Inertia::render('customer/CustomerEmiPay', [
            'pendingEmis' => $pendingEmis,
            'customerAccounts' => $customerAccounts,
        ]);
    }
}