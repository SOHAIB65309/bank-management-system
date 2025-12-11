<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;

class CheckUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $roles The required role(s) as a pipe-separated string (e.g., 'admin|cashier').
     */
    public function handle(Request $request, Closure $next, string $roles): Response
    {
        if (! $request->user()) {
            return redirect('/login');
        }

        // FIX: Change delimiter from comma (,) to pipe (|)
        $requiredRoles = collect(explode('|', $roles))
                             ->map(fn($r) => strtolower(trim($r))) // Ensure consistency
                             ->filter()
                             ->all();
        
        // Use the simplified User::hasRole method which handles checking array intersection internally.
        // This is the correct, robust way to check multiple roles.
        $hasRequiredRole = $request->user()->hasRole($requiredRoles);
        
        
        if (!$hasRequiredRole) {
            // Include user's current roles in the log for debugging
            $currentRoles = $request->user()->roles->pluck('name')->implode(', ');
            \Illuminate\Support\Facades\Log::warning("Access denied for User ID {$request->user()->id}. Required roles: {$roles}. User roles: {$currentRoles}.");

            abort(403, 'Unauthorized action. You do not have the required role.');
        }

        return $next($request);
    }
}