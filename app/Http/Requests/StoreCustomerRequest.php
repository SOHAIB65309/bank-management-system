<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only employees (Admin or Cashier) can register new customers
        return $this->user() && ($this->user()->hasRole('admin') || $this->user()->hasRole('cashier'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Customer Details
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:customers'],
            'phone' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:500'],
            'kyc_status' => [
                'required', 
                'string', 
                Rule::in(['Pending', 'Verified', 'Rejected'])
            ],

            // Initial Account Details
            'account_type' => [
                'required',
                'string',
                Rule::in(['Savings', 'Current', 'Fixed Deposit']),
            ],
            // Initial balance must be a non-negative number
            'initial_balance' => ['required', 'numeric', 'min:0'],
        ];
    }
}