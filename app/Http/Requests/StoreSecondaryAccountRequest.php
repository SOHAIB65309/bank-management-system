<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSecondaryAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && ($this->user()->hasRole('admin') || $this->user()->hasRole('cashier'));
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'exists:customers,id'],
            'account_type' => [
                'required',
                'string',
                Rule::in(['Savings', 'Current', 'Fixed Deposit']),
            ],
            'initial_balance' => ['required', 'numeric', 'min:0'],
        ];
    }
}