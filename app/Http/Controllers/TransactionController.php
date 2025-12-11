<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\DepositRequest;
use App\Http\Requests\TransferRequest;
use App\Http\Requests\WithdrawalRequest;
use App\Models\accounts;
use App\Models\transactions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TransactionController extends Controller
{
    /**
     * Display the transaction processing index page.
     */
    public function index()
    {
        // This page will host the forms for Deposit, Withdrawal, and Transfer
        return Inertia::render('Transaction/TransactionIndex');
    }

    public function lookupAccount(Request $request)
    {
        $request->validate(['account_id' => 'required|integer']);

        try {
            $account = Accounts::with('customer:id,name')->findOrFail($request->account_id, ['id', 'customer_id', 'account_type', 'balance', 'status']);

            // Check if the account is linked to a customer
            if (!$account->customer) {
                return response()->json(['error' => 'Account has no linked customer.'], 404);
            }

            return response()->json([
                'id' => $account->id,
                'type' => $account->account_type,
                'balance' => $account->balance,
                'status' => $account->status,
                'customer_name' => $account->customer->name,
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Account not found.'], 404);
        }
    }


    /**
     * Process a deposit into a specific account.
     */
    public function deposit(DepositRequest $request)
    {
        $accountId = $request->account_id;
        $amount = $request->amount;

        try {
            DB::transaction(function () use ($accountId, $amount, $request) {
                $account = Accounts::lockForUpdate()->findOrFail($accountId);

                if ($account->status !== 'Active') {
                    throw new \Exception('Account is not active and cannot accept deposits.');
                }

                $account->balance += $amount;
                $account->save();

                Transactions::create([
                    'account_id' => $accountId,
                    'type' => 'Deposit',
                    'amount' => $amount,
                    'description' => $request->description ?? 'Cash deposit by staff.',
                ]);
            });

            return redirect()->back()->with('success', "Deposit of $" . number_format($amount, 2) . " successful into Account #{$accountId}.");

        } catch (\Exception $e) {
            Log::error("Deposit failed for Account #{$accountId}: " . $e->getMessage());
            $message = $e->getMessage() === 'Account is not active and cannot accept deposits.' ? $e->getMessage() : 'Deposit failed: Database error.';
            return redirect()->back()->with('error', $message);
        }
    }

    /**
     * Process a withdrawal from a specific account.
     */
    public function withdrawal(WithdrawalRequest $request)
    {
        $accountId = $request->account_id;
        $amount = $request->amount;

        try {
            DB::transaction(function () use ($accountId, $amount, $request) {
                $account = Accounts::lockForUpdate()->findOrFail($accountId);

                if ($account->status !== 'Active') {
                    throw new \Exception('Account is not active and cannot process withdrawals.');
                }

                if ($account->balance < $amount) {
                    throw new \Exception('Insufficient funds in the account.');
                }

                $account->balance -= $amount;
                $account->save();

                Transactions::create([
                    'account_id' => $accountId,
                    'type' => 'Withdrawal',
                    'amount' => $amount,
                    'description' => $request->description ?? 'Cash withdrawal by staff.',
                ]);
            });

            return redirect()->back()->with('success', "Withdrawal of $" . number_format($amount, 2) . " successful from Account #{$accountId}.");

        } catch (\Exception $e) {
            Log::error("Withdrawal failed for Account #{$accountId}: " . $e->getMessage());
            $message = $e->getMessage();
            return redirect()->back()->with('error', $message);
        }
    }

    /**
     * Process a transfer between two accounts.
     */
    public function transfer(TransferRequest $request)
    {
        $sourceId = $request->source_account_id;
        $targetId = $request->target_account_id;
        $amount = $request->amount;
        $description = $request->description ?? 'Funds transfer.';

        if ($sourceId === $targetId) {
            return redirect()->back()->with('error', 'Cannot transfer funds to the same account.');
        }

        try {
            DB::transaction(function () use ($sourceId, $targetId, $amount, $description) {
                // Fetch and Lock both accounts (Order accounts by ID to prevent deadlock)
                $accounts = Accounts::lockForUpdate()->whereIn('id', [$sourceId, $targetId])->orderBy('id')->get();

                $sourceAccount = $accounts->firstWhere('id', $sourceId);
                $targetAccount = $accounts->firstWhere('id', $targetId);

                if (!$sourceAccount || !$targetAccount) {
                    throw new \Exception('One or both accounts were not found or are invalid.');
                }
                if ($sourceAccount->status !== 'Active' || $targetAccount->status !== 'Active') {
                    throw new \Exception('One or both accounts are inactive.');
                }
                if ($sourceAccount->balance < $amount) {
                    throw new \Exception('Insufficient funds in the source account.');
                }

                // 1. Decrease Source Balance
                $sourceAccount->balance -= $amount;
                $sourceAccount->save();

                // 2. Increase Target Balance
                $targetAccount->balance += $amount;
                $targetAccount->save();

                // 3. Record Transactions (Outflow from source, Inflow to target)
                Transactions::create([
                    'account_id' => $sourceId,
                    'type' => 'Transfer (Out)',
                    'amount' => -$amount, // Negative amount for source outflow tracking
                    'description' => $description . " [To: #{$targetId}]",
                ]);
                Transactions::create([
                    'account_id' => $targetId,
                    'type' => 'Transfer (In)',
                    'amount' => $amount,
                    'description' => $description . " [From: #{$sourceId}]",
                ]);
            });

            return redirect()->back()->with('success', "Transfer of $" . number_format($amount, 2) . " successful from #{$sourceId} to #{$targetId}.");

        } catch (\Exception $e) {
            Log::error("Transfer failed: " . $e->getMessage());
            return redirect()->back()->with('error', 'Transfer failed: ' . $e->getMessage());
        }
    }
}
