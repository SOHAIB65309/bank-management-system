<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoanApplicationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Loan applications can theoretically be submitted by anyone, 
        // but here we assume a customer portal or an unauthenticated entry point exists.
        // For internal staff access, we rely on the route middleware.
        return true; 
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'exists:customers,id'],
            'amount' => ['required', 'numeric', 'min:100'],
            'interest_rate' => ['required', 'numeric', 'min:0.01', 'max:50'],
            'term_months' => ['required', 'integer', 'min:6', 'max:120'], // 6 months up to 10 years
        ];
    }
}