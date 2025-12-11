<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only employees (Admin or Cashier) can update customer details
        return $this->user() && ($this->user()->hasRole('admin') || $this->user()->hasRole('cashier'));
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        // The customer ID is provided via route model binding
        $customerId = $this->route('customer')->id ?? null;

        return [
            // Customer Details
            'name' => ['required', 'string', 'max:255'],
            // Email must be unique, except for the current customer being updated
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('customers')->ignore($customerId)],
            'phone' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:500'],
            'kyc_status' => [
                'required', 
                'string', 
                Rule::in(['Pending', 'Verified', 'Rejected']) // Staff can change KYC
            ],
        ];
    }
}