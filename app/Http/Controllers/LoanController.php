<?php

namespace App\Http\Controllers;

use App\Models\emis;
use App\Models\loans;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Requests\StoreLoanApplicationRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LoanController extends Controller
{
    /**
     * Helper function to calculate EMI.
     * M = P * [ i(1 + i)^n ] / [ (1 + i)^n – 1]
     */
    private function calculateEmi(float $principal, float $rateAnnual, int $months): float
    {
        // Monthly interest rate
        $rateMonthly = ($rateAnnual / 100) / 12;

        if ($rateMonthly == 0) {
            return $principal / $months;
        }

        // Formula components
        $powerTerm = pow(1 + $rateMonthly, $months);
        $numerator = $principal * $rateMonthly * $powerTerm;
        $denominator = $powerTerm - 1;

        if ($denominator == 0) {
            throw new \Exception("EMI Calculation failed: Denominator is zero.");
        }

        return round($numerator / $denominator, 2);
    }

    /**
     * Display a listing of loan applications and active loans.
     */
    public function index(Request $request)
    {
        $status = $request->input('status', 'Pending');
        $search = $request->input('search');

        $loansQuery = loans::with('customer:id,name,email');

        if ($status !== 'All') {
            $loansQuery->where('status', $status);
        }

        if ($search) {
            $loansQuery->whereHas('customer', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })->orWhere('id', $search);
        }

        $loans = $loansQuery->latest()->paginate(15)->withQueryString();

        return Inertia::render('LoanOfficer/LoanIndex', [
            'loans' => $loans,
            'status' => $status,
            'loanStatuses' => ['All', 'Pending', 'Approved', 'Rejected', 'Paid'],
        ]);
    }

    /**
     * Processes loan application creation (customer submits or staff enters).
     */
    public function store(StoreLoanApplicationRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                Loans::create([
                    'customer_id' => $request->customer_id,
                    'amount' => $request->amount,
                    'interest_rate' => $request->interest_rate,
                    'term_months' => $request->term_months,
                    'status' => 'Pending', // Always pending upon submission
                ]);
            });
            return redirect()->back()->with('success', 'Loan application submitted successfully and awaiting review.');

        } catch (\Exception $e) {
            Log::error("Loan submission failed: " . $e->getMessage());
            return redirect()->back()->with('error', 'Loan submission failed.');
        }
    }

    /**
     * Approves a loan, disburses funds (optional), and creates the EMI schedule.
     */
    public function approve(Request $request, Loans $loan)
    {
        $request->validate(['action' => 'required|in:approve,reject']);

        if ($loan->status !== 'Pending') {
            return redirect()->back()->with('error', "Loan is already {$loan->status}.");
        }

        if ($request->action === 'reject') {
            $loan->status = 'Rejected';
            $loan->save();
            return redirect()->back()->with('success', 'Loan application rejected.');
        }
     
        try {
            DB::transaction(function () use ($loan) {
                $loan->status = 'Approved';
                $loan->approved_at = now();
                $loan->save();

                // 1. Calculate EMI
                $emiAmount = $this->calculateEmi(
                    $loan->amount,
                    $loan->interest_rate,
                    $loan->term_months
                );

                // 2. Generate EMI Schedule
                $emiRecords = [];
                $startDate = now()->addMonth()->startOfMonth(); // First EMI due next month

                for ($i = 0; $i < $loan->term_months; $i++) {
                    $emiRecords[] = [
                        'loan_id' => $loan->id,
                        'due_date' => $startDate->copy()->addMonths($i),
                        'amount_due' => $emiAmount,
                        'status' => 'Pending',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                emis::insert($emiRecords);

                // OPTIONAL: Disburse funds to a primary customer account (Implementation depends on account finding logic)
                /*
                $customer = Customer::find($loan->customer_id);
                $account = $customer->accounts()->where('account_type', 'Savings')->first();
                if ($account) {
                    $account->balance += $loan->amount;
                    $account->save();
                    // Record disbursement transaction
                    Transaction::create([ ... ]);
                }
                */
            });

            return redirect()->back()->with('success', "Loan #{$loan->id} approved and EMI schedule generated. Monthly EMI: $" . number_format($emiAmount, 2));

        } catch (\Exception $e) {
            Log::error("Loan approval failed for ID {$loan->id}: " . $e->getMessage());
            return redirect()->back()->with('error', 'Loan approval failed due to processing error: ' . $e->getMessage());
        }
    }

    /**
     * Display a listing of EMI schedules for tracking.
     */
    public function emiIndex(Request $request)
    {
        $status = $request->input('status', 'Pending');
        $search = $request->input('search');

        $emisQuery = Emis::with(['loan.customer:id,name']);

        if ($status !== 'All') {
            $emisQuery->where('status', $status);
        }

        if ($search) {
            $emisQuery->whereHas('loan.customer', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            });
        }

        $emis = $emisQuery->orderBy('due_date')->paginate(20)->withQueryString();

        return Inertia::render('LoanOfficer/EmiIndex', [
            'emis' => $emis,
            'status' => $status,
            'emiStatuses' => ['All', 'Pending', 'Paid', 'Late'],
        ]);
    }

    /**
     * Processes an EMI payment.
     */
    public function payEmi(Request $request, Emis $emi)
    {
        // Check if the EMI is already paid or the user is authorized
        if ($emi->status === 'Paid') {
            return redirect()->back()->with('error', 'This EMI is already marked as paid.');
        }

        // NOTE: For simplicity, we assume staff handles the payment via cash/internal transfer.
        // In a real system, funds would be debited from a linked account.

        try {
            DB::transaction(function () use ($emi) {
                // Update EMI Status
                $emi->status = 'Paid';
                $emi->payment_date = now();
                $emi->save();

                // OPTIONAL: Record an internal transaction or log the cash receipt.

                // Check if the loan is fully paid after this EMI
                $pendingEmisCount = Emis::where('loan_id', $emi->loan_id)
                    ->where('status', 'Pending')
                    ->count();

                if ($pendingEmisCount === 0) {
                    $loan = Loans::findOrFail($emi->loan_id);
                    $loan->status = 'Paid';
                    $loan->save();
                }
            });

            return redirect()->back()->with('success', "EMI #{$emi->id} paid successfully. Loan balance updated.");
        } catch (\Exception $e) {
            Log::error("EMI payment failed for ID {$emi->id}: " . $e->getMessage());
            return redirect()->back()->with('error', 'Payment failed due to processing error.');
        }
    }
}