import AdminLayout from '@/layouts/admin/layout';
import { type BreadcrumbItem, type SharedData, type Role } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { ArrowLeft, UserPlus, Key, CheckCircle, XCircle } from 'lucide-react';

// --- Type Definitions ---

// Props should include the list of roles to assign and flash messages
interface EmployeeCreateProps {
    roles: Role[];
    flash?: {
        success?: string;
        error?: string;
    }
}

// Helper function to simulate button classes (copied from EmployeeIndex)
const getButtonClasses = (variant: 'default' | 'outline' | 'ghost' | 'icon', size: 'sm' | 'icon' | 'default') => {
    let base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    if (size === 'sm') base += ' h-8 px-3';
    else if (size === 'icon') base += ' h-8 w-8';
    else base += ' h-9 px-4 py-2';

    if (variant === 'default') base += ' bg-primary text-primary-foreground hover:bg-primary/90 shadow';
    else if (variant === 'outline') base += ' border border-input bg-background hover:bg-accent hover:text-accent-foreground';
    else if (variant === 'ghost') base += ' hover:bg-accent hover:text-accent-foreground';
    
    return base;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Portal', href: '/admin' },
    { title: 'Employee Management', href: '/admin/employees' },
    { title: 'Add Employee', href: '/admin/employees/create' },
];

export default function EmployeeCreate() {
    const pageProps = usePage<SharedData & EmployeeCreateProps>().props;
    const { roles, flash } = pageProps;
    
    // State for managing post-submission status (resets on navigation)
    const [submissionStatus, setSubmissionStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        assigned_role_id: roles[0]?.id.toString() || '', // Default to the first role found
    });

    // Clear submission status when form data changes (user starts typing again)
    React.useEffect(() => {
        if (submissionStatus) {
            setSubmissionStatus(null);
        }
    }, [data]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmissionStatus(null); // Clear previous status
        
        post('/admin/employees', {
            onSuccess: () => {
                setSubmissionStatus({
                    message: `Employee "${data.name}" successfully registered!`,
                    type: 'success',
                });
                reset('name', 'email', 'password', 'password_confirmation'); // Clear key fields
                // Optionally redirect to index page after success: Inertia.visit('/admin/employees');
            },
            onError: (errors) => {
                // If there are general errors not tied to a field, display them
                if (errors.general) {
                    setSubmissionStatus({
                        message: errors.general,
                        type: 'error',
                    });
                } else if (Object.keys(errors).length === 0) {
                     // Fallback for non-field specific 500 errors
                    setSubmissionStatus({
                        message: 'An unexpected error occurred during registration. Please check server logs.',
                        type: 'error',
                    });
                }
            },
            preserveScroll: true,
        });
    };

    const statusMessage = submissionStatus || (flash?.success ? { message: flash.success, type: 'success' } : (flash?.error ? { message: flash.error, type: 'error' } : null));

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Employee" />
            
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                
                {/* Header and Back Button */}
                <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/employees" className={getButtonClasses('outline', 'icon')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Add New Employee</h1>
                            <p className="text-sm text-muted-foreground">Register new bank staff and assign their primary role.</p>
                        </div>
                    </div>
                </div>
                
                {/* Employee Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700 p-8">
                    
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 border-b pb-4">Employee Details & Access</h2>

                    {/* --- Server Response / Status Display --- */}
                    {statusMessage && (
                        <div 
                            className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${
                                statusMessage.type === 'success' 
                                    ? 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-900 dark:border-green-600 dark:text-green-200' 
                                    : 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-900 dark:border-red-600 dark:text-red-200'
                            }`}
                        >
                            {statusMessage.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                            <p className="text-sm font-medium">{statusMessage.message}</p>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* --- 1. Basic Information --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Name Field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoFocus
                                    className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address (Login ID)</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>
                        </div>

                        {/* --- 2. Password and Confirmation --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                                />
                                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                    className={`w-full border ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                                />
                                {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
                            </div>
                        </div>

                        {/* --- 3. Role Assignment --- */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Key className="h-4 w-4" /> Assign Role (Mandatory)
                            </label>
                            <div className="flex flex-wrap gap-4">
                                {roles.map((role) => (
                                    <div key={role.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <input
                                            id={`role-${role.name}`}
                                            type="radio"
                                            name="assigned_role_id"
                                            value={role.id.toString()}
                                            checked={data.assigned_role_id === role.id.toString()}
                                            onChange={(e) => setData('assigned_role_id', e.target.value)}
                                            required
                                            className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                                        />
                                        <label htmlFor={`role-${role.name}`} className="text-sm font-medium text-gray-900 dark:text-white capitalize cursor-pointer">
                                            {role.name.replace('_', ' ')}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {errors.assigned_role_id && <p className="mt-1 text-sm text-red-600">{errors.assigned_role_id}</p>}
                        </div>

                        {/* --- Submit Button --- */}
                        <div className="pt-4 border-t dark:border-gray-700">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`${getButtonClasses('default', 'default')} w-full md:w-auto px-6`}
                            >
                                {processing ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Registering...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <UserPlus className="mr-2 h-4 w-4" /> Create Employee
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}