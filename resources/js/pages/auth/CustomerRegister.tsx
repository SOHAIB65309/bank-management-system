import AuthLayout from '@/layouts/auth-layout'; // Use the standard Auth Layout
import { Link, Head, useForm } from '@inertiajs/react';
import React from 'react';
import { ArrowRight, User, Mail, Phone, MapPin, Lock, CheckCircle, XCircle } from 'lucide-react';
// import { store as customerRegisterStore } from '@/routes/customer/register'; // REMOVED: Unused and non-existent module

interface CustomerRegisterProps {
    status?: string;
    flash?: { success?: string; error?: string; }
}

// Helper function to simulate button classes (reused)
const getButtonClasses = (variant: 'default' | 'outline' | 'ghost' | 'icon', size: 'sm' | 'icon' | 'default', disabled: boolean = false) => {
    let base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

    if (disabled) base += ' opacity-50 cursor-not-allowed';

    if (size === 'sm') base += ' h-8 px-3';
    else if (size === 'icon') base += ' h-8 w-8';
    else base += ' h-9 px-4 py-2';

    if (variant === 'default') base += ' bg-indigo-600 text-white hover:bg-indigo-700 shadow';
    else if (variant === 'outline') base += ' border border-gray-300 dark:border-gray-600 bg-background hover:bg-gray-100 dark:hover:bg-gray-700';
    else if (variant === 'ghost') base += ' hover:bg-gray-100 dark:hover:bg-gray-700';
    
    return base;
};

export default function CustomerRegister({ status, flash }: CustomerRegisterProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        address: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Uses the newly defined customer registration route
        post('/customer/register');
    };

    return (
        <AuthLayout
            title="Open Your Bank Account"
            description="Create your secure customer portal access. KYC verification will be handled by staff after registration."
        >
            <Head title="Customer Sign Up" />

            {/* Status Messages */}
            {(flash?.success || flash?.error) && (
                <div className={`p-4 rounded-lg text-sm font-medium flex items-center gap-2 mb-4 ${
                    flash.success ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                }`}>
                    {flash.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    {flash.success || flash.error}
                </div>
            )}
            
            <form onSubmit={submit} className="space-y-6">
                
                {/* Auth Details */}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 flex items-center gap-2"><Lock className='h-4 w-4'/> Account Security</h2>
                
                <div className="grid gap-4">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><User className='h-4 w-4'/> Full Name</label>
                        <input
                            id="name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoFocus
                            className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition`}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><Mail className='h-4 w-4'/> Email Address</label>
                        <input
                            id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required
                            className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition`}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                            <input
                                id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} required
                                className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition`}
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>
                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
                            <input
                                id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} required
                                className={`w-full border ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition`}
                            />
                            {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
                        </div>
                    </div>
                </div>

                {/* Customer Details */}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 flex items-center gap-2"><User className='h-4 w-4'/> Contact Details</h2>
                <div className="grid gap-4">
                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><Phone className='h-4 w-4'/> Phone Number</label>
                        <input
                            id="phone" type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)} required
                            className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition`}
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>

                    {/* Address */}
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><MapPin className='h-4 w-4'/> Residential Address</label>
                        <textarea
                            id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} required rows={2}
                            className={`w-full border ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition`}
                        />
                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t dark:border-gray-700">
                    <button
                        type="submit"
                        disabled={processing}
                        className={`${getButtonClasses('default', 'default', processing)} w-full px-6`}
                    >
                        {processing ? 'Registering...' : (
                            <span className="flex items-center">
                                <ArrowRight className="mr-2 h-4 w-4" /> Start Banking
                            </span>
                        )}
                    </button>
                </div>
            </form>
            
            <div className="text-center text-sm text-muted-foreground mt-4">
                Already have portal access?{' '}
                <Link href="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
                    Log in here
                </Link>
            </div>
        </AuthLayout>
    );
}