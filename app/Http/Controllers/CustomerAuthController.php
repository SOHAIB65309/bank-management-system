<?php

namespace App\Http\Controllers;

use App\Models\customers;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Customer;
use App\Http\Requests\CustomerRegisterRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CustomerAuthController extends Controller
{
    /**
     * Show the customer registration view.
     */
    public function registerForm()
    {
        return Inertia::render('customer/CustomerRegister');
    }

    /**
     * Handle customer registration submission.
     */
    public function register(CustomerRegisterRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                // 1. Create the Auth User Record
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                ]);

                // 2. Create the linked Customer Profile
                customers::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'address' => $request->address,
                    'kyc_status' => 'Pending', // Requires staff review and account opening
                ]);
                
                // 3. Log the user in immediately
                Auth::login($user);
            });

            return redirect()->route('dashboard')->with('success', 'Registration successful! Your profile requires KYC verification and account opening by bank staff.');

        } catch (\Exception $e) {
            Log::error("Customer registration failed: " . $e->getMessage());
            return redirect()->back()->with('error', 'Registration failed. Please try again or contact support.');
        }
    }
    
    // We rely on Laravel Fortify's default /login for the POST submission,
    // but the landing page should link to a dedicated customer login view if desired.
}