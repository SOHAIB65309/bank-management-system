<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
    public function roles(): BelongsToMany
    {
        // Explicitly setting the pivot table name to 'role_user'
        return $this->belongsToMany(Roles::class, 'role_users', 'user_id', 'role_id')->withTimestamps();
    }
    public function isCustomer(): bool
        {
            // Check if the user has ANY employee role defined in the system.
            // If the roles relationship is not loaded, this will load it.
            $employeeRoles = ['admin', 'cashier', 'loan_officer'];
            
            // This leverages the optimized hasRole method defined below.
            return !$this->hasRole($employeeRoles);
        }
    /**
     * Check if the user has a specific role.
     */
    public function hasRole($roles): bool
    {
        $roles = is_array($roles) ? $roles : [$roles];
        $roles = array_map('strtolower', $roles);
        $userRoleNames = $this->roles->pluck('name')->map('strtolower')->all();
        return count(array_intersect($roles, $userRoleNames)) > 0;
    }
}
