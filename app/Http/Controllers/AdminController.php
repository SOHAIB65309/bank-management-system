<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEmployeeRequest;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\customers;
use App\Models\loans;
use App\Models\roles;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminController extends Controller
{
   

    /**
     * Display a listing of employees (Admin Management).
     */
    public function employeesIndex()
    {
        $employees = User::whereHas('roles')
            ->with('roles')
            ->paginate(10);

        return Inertia::render('Admin/EmployeeIndex', [
            'employees' => $employees,
        ]);
    }
    public function employeesCreate()
    {
        $roles = Roles::all(['id', 'name']); // Fetch roles
        return Inertia::render('Admin/EmployeeCreate', [
            'roles' => $roles, // Pass roles to the frontend
        ]);
    }
    public function employeestore(StoreEmployeeRequest $request)
    {
        try {
            DB::transaction(function () use ($request) {
                // 1. Create the new User
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'email_verified_at' => now(), // Assume admin verification on creation
                ]);

                // 2. Assign the specified Role (using syncWithoutDetaching since it's a new user)
                $user->roles()->syncWithoutDetaching([$request->assigned_role_id]);
            });

            // Redirect back to the index page on success with a flash message
            return redirect()->route('admin.employees.index')->with('success', 'Employee registered successfully!');

        } catch (Exception $e) {
            Log::error("Employee registration failed: " . $e->getMessage());

            // Redirect back with an error flash message
            return redirect()->back()->with('error', 'Error creating employee: Could not complete the transaction.');
        }
    }
    /**
     * Display the Role and Access Control settings (including all users).
     */
    public function rolesIndex(Request $request)
    {
        $search = $request->input('search');

        $usersQuery = User::with('roles:id,name');

        if ($search) {
            $usersQuery->where('name', 'like', "%{$search}%")
                       ->orWhere('email', 'like', "%{$search}%");
        }

        return Inertia::render('Admin/RolesIndex', [
            'roles' => Roles::all(['id', 'name']), // All available roles
            'users' => $usersQuery->paginate(10)->withQueryString(), // All users with pagination and search
            'search' => $search,
        ]);
    }

    /**
     * Update roles for a specific user.
     */
    public function updateUserRoles(UpdateUserRoleRequest $request, User $user)
    {
        // The request validates that the authenticated user is an admin
        // and that all role IDs are valid.

        try {
            // Detach all existing roles and attach the new ones
            $user->roles()->sync($request->role_ids);
            
            return redirect()->back()->with('success', "Roles for {$user->name} updated successfully.");
            
        } catch (Exception $e) {
            Log::error("Role update failed for User ID {$user->id}: " . $e->getMessage());
            return redirect()->back()->with('error', 'Error updating roles: Could not complete the action.');
        }
    }
}
