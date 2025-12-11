<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransferRequest extends FormRequest
{
    public function authorize(): bool
    {
       // Check 1: User is an employee (Admin or Cashier)
        $isEmployee = $this->user()->hasRole(['admin', 'cashier']);
        
        // Check 2: User is a pure customer (uses the new method)
        $isCustomer = $this->user()->IsCustomer();

        // Allow if the user is an authorized employee OR a logged-in customer.
        return $this->user() && ($isEmployee || $isCustomer);
    }

    public function rules(): array
    {
        return [
            'source_account_id' => ['required', 'integer', 'exists:accounts,id', 'different:target_account_id'],
            'target_account_id' => ['required', 'integer', 'exists:accounts,id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}