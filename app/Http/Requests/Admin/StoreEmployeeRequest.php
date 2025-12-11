<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Roles;

class StoreEmployeeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only the Admin should be able to create new employees
        return $this->user()->hasRole('admin');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Fetch all valid role IDs to validate the submitted role ID
        $validRoleIds = Roles::pluck('id')->toArray();

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            // Validate that the assigned role ID is present and exists in the roles table
            'assigned_role_id' => [
                'required',
                'integer',
                Rule::in($validRoleIds),
            ],
        ];
    }
    
    /**
     * Prepare the data for validation.
     * Ensures role ID is cast to integer before validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure the role ID is cast to integer if it exists, as it comes from a string input
        if ($this->has('assigned_role_id')) {
            $this->merge([
                'assigned_role_id' => (int) $this->assigned_role_id,
            ]);
        }
    }
}