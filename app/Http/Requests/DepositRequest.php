<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DepositRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only employees (Admin or Cashier) can perform deposits
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
            // Account ID must exist in the 'accounts' table
            'account_id' => ['required', 'integer', 'exists:accounts,id'],
            // Deposit amount must be a positive number
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}