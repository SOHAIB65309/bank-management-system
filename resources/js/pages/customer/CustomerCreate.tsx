import CashierLayout from '@/layouts/cashier/layout';
import AdminLayout from '@/layouts/admin/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import React from 'react';
import { ArrowLeft, UserPlus, Mail, Phone, MapPin, Banknote, UserCheck } from 'lucide-react';

// --- Type Definitions ---
interface CustomerCreateProps {
    accountTypes: string[];
    kycStatuses: string[];
    flash?: {
        success?: string;
        error?: string;
    }
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Customer & Accounts', href: '/customers' },
    { title: 'Register Customer', href: '/customers/create' },
];

export default function CustomerCreate() {
    const pageProps = usePage<SharedData & CustomerCreateProps>().props;
    const { accountTypes, kycStatuses, flash, auth } = pageProps;

    const { data, setData, post, processing, errors, reset } = useForm({
        // Customer Fields
        name: '',
        email: '',
        phone: '',
        address: '',
        kyc_status: kycStatuses[0] || 'Pending',

        // Account Fields
        account_type: accountTypes[0] || 'Savings',
        initial_balance: '0.00',
    });

    // Determine layout based on user role
    const isAdmin = auth.user.roles.some(role => role.name === 'admin');
    const Layout = isAdmin ? AdminLayout : CashierLayout;
    
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // Route for storing new customer
        post('/customers');
    };

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <Head title="Register New Customer" />
            
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                
                {/* Header and Back Button */}
                <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <Link href="/customers" className={getButtonClasses('outline', 'icon')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Customer Registration</h1>
                            <p className="text-sm text-muted-foreground">Register a new customer and open their first bank account.</p>
                        </div>
                    </div>
                </div>
                
                {/* Status Messages (Success/Error) */}
                {(flash?.success || flash?.error) && (
                    <div className={`p-4 rounded-lg text-sm font-medium ${
                        flash.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {flash.success || flash.error}
                    </div>
                )}

                {/* Registration Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700 p-8">
                    
                    <form onSubmit={submit} className="space-y-8">
                        
                        {/* --- Section 1: Customer Details (KYC) --- */}
                        <div className="space-y-4 border-b pb-6 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-indigo-500" /> Customer Information
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><Mail className='h-4 w-4'/> Email Address</label>
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                
                                {/* Phone */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><Phone className='h-4 w-4'/> Phone Number</label>
                                    <input
                                        id="phone"
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        required
                                        className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                                    />
                                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                </div>
                                
                                {/* KYC Status */}
                                <div>
                                    <label htmlFor="kyc_status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><UserCheck className='h-4 w-4'/> KYC Status</label>
                                    <select
                                        id="kyc_status"
                                        value={data.kyc_status}
                                        onChange={(e) => setData('kyc_status', e.target.value)}
                                        required
                                        className={`w-full border ${errors.kyc_status ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                                    >
                                        {kycStatuses.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                    {errors.kyc_status && <p className="mt-1 text-sm text-red-600">{errors.kyc_status}</p>}
                                </div>
                            </div>
                            
                            {/* Address */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><MapPin className='h-4 w-4'/> Residential Address</label>
                                <textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    required
                                    rows={2}
                                    className={`w-full border ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                                />
                                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                            </div>
                        </div>


                        {/* --- Section 2: Initial Account Setup --- */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <Banknote className="h-5 w-5 text-indigo-500" /> Account Details
                            </h2>
                            <p className='text-sm text-muted-foreground'>Every customer must open an initial account upon registration.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Account Type */}
                                <div>
                                    <label htmlFor="account_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type</label>
                                    <select
                                        id="account_type"
                                        value={data.account_type}
                                        onChange={(e) => setData('account_type', e.target.value)}
                                        required
                                        className={`w-full border ${errors.account_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                                    >
                                        {accountTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {errors.account_type && <p className="mt-1 text-sm text-red-600">{errors.account_type}</p>}
                                </div>

                                {/* Initial Balance */}
                                <div>
                                    <label htmlFor="initial_balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Deposit Amount (USD)</label>
                                    <input
                                        id="initial_balance"
                                        type="number"
                                        step="0.01"
                                        min="0.00"
                                        value={data.initial_balance}
                                        onChange={(e) => setData('initial_balance', e.target.value)}
                                        required
                                        className={`w-full border ${errors.initial_balance ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                                    />
                                    {errors.initial_balance && <p className="mt-1 text-sm text-red-600">{errors.initial_balance}</p>}
                                </div>
                            </div>
                        </div>

                        {/* --- Submit Button --- */}
                        <div className="pt-4 border-t dark:border-gray-700">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`${getButtonClasses('default', 'default', processing)} w-full md:w-auto px-6`}
                            >
                                {processing ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <UserPlus className="mr-2 h-4 w-4" /> Finalize Registration
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}