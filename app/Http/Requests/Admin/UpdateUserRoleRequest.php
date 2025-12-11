<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Roles;

class UpdateUserRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only the Admin should be able to update roles
        return $this->user()->hasRole('admin');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Fetch all valid role IDs
        $validRoleIds = Roles::pluck('id')->toArray();

        return [
            // role_ids is an array containing the IDs of all roles the user should now have
            'role_ids' => ['nullable', 'array'],
            'role_ids.*' => [
                'integer',
                // Ensure every ID in the array is a valid role ID
                Rule::in($validRoleIds),
            ],
        ];
    }
}