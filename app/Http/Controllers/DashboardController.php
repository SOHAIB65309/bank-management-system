<?php

namespace App\Http\Controllers;

use App\Models\accounts;
use App\Models\customers;
use App\Models\emis;
use App\Models\loans;
use App\Models\transactions;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Show the appropriate dashboard metrics based on the user's role(s).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $metrics = [];
        $roleType = 'general';

        if ($user->hasRole('admin')) {
            $metrics = $this->getAdminMetrics();
            $roleType = 'admin';
        } elseif ($user->hasRole('cashier')) {
            $metrics = $this->getCashierMetrics();
            $roleType = 'cashier';
        } elseif ($user->hasRole('loan_officer')) {
            $metrics = $this->getLoanOfficerMetrics();
            $roleType = 'loan_officer';
        }

        return Inertia::render('dashboard', [
            'roleType' => $roleType,
            'metrics' => $metrics,
        ]);
    }

    private function getAdminMetrics(): array
    {
        return [
            'total_employees' => User::whereHas('roles')->count(),
            'total_customers' => customers::count(),
            'pending_kyc' => customers::where('kyc_status', 'Pending')->count(),
            'total_loans' => loans::count(),
            'pending_loans' => Loans::where('status', 'Pending')->count(),
            'total_deposits' => transactions::where('type', 'Deposit')->sum('amount'),
            'total_assets' => accounts::sum('balance'),
        ];
    }

    private function getCashierMetrics(): array
    {
        // Calculate deposits/withdrawals handled today/this month
        $today = now()->toDateString();
        return [
            'daily_deposits' => transactions::where('type', 'Deposit')->whereDate('created_at', $today)->sum('amount'),
            'daily_withdrawals' => Transactions::where('type', 'Withdrawal')->whereDate('created_at', $today)->sum('amount'),
            'pending_kyc' => Customers::where('kyc_status', 'Pending')->count(),
            'active_accounts' => Accounts::where('status', 'Active')->count(),
            'total_transfers' => Transactions::where('type', 'like', 'Transfer%')->count(),
        ];
    }

    private function getLoanOfficerMetrics(): array
    {
        return [
            'pending_applications' => loans::where('status', 'Pending')->count(),
            'approved_loans_value' => Loans::where('status', 'Approved')->sum('amount'),
            'total_emis_due' => emis::where('status', 'Pending')->whereDate('due_date', '<=', now())->count(),
            'total_loan_customers' => Loans::distinct('customer_id')->count(),
        ];
    }
}