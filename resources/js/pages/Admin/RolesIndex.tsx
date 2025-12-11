import AdminLayout from '@/layouts/admin/layout';
import { type BreadcrumbItem, type SharedData, type User, type Role } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import React, { useState, useMemo, useEffect } from 'react';
import { Key, Search, User as UserIcon, XCircle, CheckCircle } from 'lucide-react';

// --- Type Definitions ---
// Note: We need a type for User that includes the roles relationship
interface UserWithRoles extends User {
    roles: Role[];
}

interface RolesIndexProps {
    roles: Role[]; // All possible roles (Admin, Cashier, Loan Officer)
    users: {
        data: UserWithRoles[];
        // Include other pagination properties
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
        from: number | null;
        to: number | null;
    };
    search: string;
    flash?: {
        success?: string;
        error?: string;
    }
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Portal', href: '/admin' },
    { title: 'Access Control', href: '/admin/roles' },
];

// Helper function to simulate button classes
const getButtonClasses = (variant: 'default' | 'outline' | 'ghost', disabled: boolean = false) => {
    let base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
    
    if (disabled) base += ' opacity-50 cursor-not-allowed';

    if (variant === 'default') base += ' bg-indigo-600 text-white hover:bg-indigo-700 shadow';
    else if (variant === 'outline') base += ' border border-gray-300 dark:border-gray-600 bg-background hover:bg-gray-100 dark:hover:bg-gray-700';
    else if (variant === 'ghost') base += ' hover:bg-gray-100 dark:hover:bg-gray-700';
    
    return base;
};


// Component to manage role assignment for a single user
interface UserRoleManagerProps {
    user: UserWithRoles;
    allRoles: Role[];
    isCurrentUser: boolean;
}

const UserRoleManager: React.FC<UserRoleManagerProps> = ({ user, allRoles, isCurrentUser }) => {
    // Map existing roles to a set of IDs for quick lookup
    const initialRoleIds = useMemo(() => new Set(user.roles.map(r => r.id)), [user.roles]);
    const [selectedRoleIds, setSelectedRoleIds] = useState<Set<number>>(initialRoleIds);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Check if the current state differs from the saved state
    const hasChanges = useMemo(() => {
        if (initialRoleIds.size !== selectedRoleIds.size) return true;
        for (const roleId of selectedRoleIds) {
            if (!initialRoleIds.has(roleId)) return true;
        }
        return false;
    }, [initialRoleIds, selectedRoleIds]);

    const handleRoleChange = (roleId: number, isChecked: boolean) => {
        // Prevent removing the admin role from the currently logged-in admin user
        if (isCurrentUser && isChecked === false && user.roles.find(r => r.id === roleId && r.name === 'admin')) {
             alert("You cannot remove your own 'admin' role.");
             return;
        }

        setSelectedRoleIds(prev => {
            const newSet = new Set(prev);
            if (isChecked) {
                newSet.add(roleId);
            } else {
                newSet.delete(roleId);
            }
            return newSet;
        });
    };

    const handleSave = () => {
        if (!hasChanges) return;

        setIsUpdating(true);
        router.put(
            // Route model binding expects user ID
            `/admin/roles/${user.id}`, 
            { role_ids: Array.from(selectedRoleIds) },
            {
                onSuccess: () => {
                    // Inertia auto-refreshes the page, but we ensure UI updates
                    setIsUpdating(false);
                    // No need to manually update state, the server response will refresh the whole list
                },
                onError: () => {
                    setIsUpdating(false);
                    // Server flashes error message handled by parent component
                },
                preserveScroll: true,
            }
        );
    };

    return (
        <div className="flex flex-col space-y-3">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
                {allRoles.map(role => (
                    <div key={role.id} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id={`role-${user.id}-${role.id}`}
                            checked={selectedRoleIds.has(role.id)}
                            onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            disabled={isUpdating}
                        />
                        <label 
                            htmlFor={`role-${user.id}-${role.id}`} 
                            className={`text-sm font-medium capitalize ${role.name === 'admin' ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                            {role.name.replace('_', ' ')}
                        </label>
                    </div>
                ))}
            </div>
            
            <button 
                onClick={handleSave}
                disabled={!hasChanges || isUpdating}
                className={`${getButtonClasses('default', !hasChanges || isUpdating)} w-24 h-8 text-xs font-semibold`}
            >
                {isUpdating ? 'Saving...' : 'Save Roles'}
            </button>
        </div>
    );
};


// Main Component
export default function RolesIndex() {
    const pageProps = usePage<SharedData & RolesIndexProps>().props;
    const { users, roles: allRoles, search, flash } = pageProps;
    const authUser = pageProps.auth.user;
    
    // Search state management
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    // Debounce search input
    useEffect(() => {
        if (timer) clearTimeout(timer);
        
        const newTimer = setTimeout(() => {
            router.get('/admin/roles', { search: searchQuery }, { 
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 300); // 300ms debounce
        
        setTimer(newTimer);
        
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [searchQuery]);


    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Access Control" />
            
            <div className="p-6 space-y-6">
                
                {/* Header and Flash Messages */}
                <div className="border-b pb-4 dark:border-gray-700">
                    <h1 className="text-3xl font-bold tracking-tight">Access Control & Roles</h1>
                    <p className="text-sm text-muted-foreground">Manage user roles and assign access permissions across all system users (employees and customers).</p>
                </div>
                
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 rounded-lg bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5" />
                        <p className="text-sm font-medium">{flash.success}</p>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-lg bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 flex items-center gap-3">
                        <XCircle className="h-5 w-5" />
                        <p className="text-sm font-medium">{flash.error}</p>
                    </div>
                )}


                {/* Users Table Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700">
                    
                    {/* Search Bar */}
                    <div className="p-6 border-b dark:border-gray-700 flex items-center gap-3">
                        <Search className="h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 border-none focus:ring-0 p-0 text-lg bg-transparent dark:text-white"
                        />
                    </div>

                    {/* Table Body */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[50px]">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Roles</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Assign/Revoke Roles</th>
                                </tr>
                            </thead>
                            
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {users.data.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted-foreground">#{user.id}</td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.roles.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map(role => (
                                                        <span 
                                                            key={role.id} 
                                                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                                                                role.name === 'admin' 
                                                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                                                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
                                                            }`}
                                                        >
                                                            {role.name.replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">No roles assigned</span>
                                            )}
                                        </td>
                                        
                                        <td className="px-6 py-4">
                                            <UserRoleManager 
                                                user={user} 
                                                allRoles={allRoles} 
                                                isCurrentUser={user.id === authUser.id}
                                            />
                                        </td>
                                    </tr>
                                ))}

                                {users.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                                            No users found. Try adjusting your search query.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* --- Pagination Footer --- */}
                    <div className="border-t">
                        {users && users.total > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 rounded-b-xl border-t border-gray-100 dark:border-gray-700">
                                {/* Summary */}
                                <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
                                    Showing {users.from} to {users.to} of {users.total} results
                                </p>

                                {/* Pagination Links (Simplified for brevity) */}
                                <div className="flex items-center space-x-2">
                                    {users.links.map(link => (
                                        <Link
                                            key={link.label}
                                            href={link.url || '#'} 
                                            className={`${getButtonClasses(link.active ? 'default' : 'outline', !link.url)} h-8 px-3 text-xs`}
                                            aria-disabled={!link.url}
                                            tabIndex={!link.url ? -1 : undefined}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            preserveScroll
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}