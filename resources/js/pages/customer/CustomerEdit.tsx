import CashierLayout from '@/layouts/cashier/layout';
import AdminLayout from '@/layouts/admin/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import React from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, UserCheck, CheckCircle, XCircle, Save } from 'lucide-react';

// --- Type Definitions ---
interface CustomerData {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    kyc_status: 'Pending' | 'Verified' | 'Rejected';
    created_at: string;
}

interface CustomerEditProps {
    customer: CustomerData;
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

export default function CustomerEdit() {
    const pageProps = usePage<SharedData & CustomerEditProps>().props;
    const { customer, kycStatuses, flash, auth } = pageProps;

    const { data, setData, put, processing, errors } = useForm({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
        kyc_status: customer.kyc_status,
    });

    // Determine layout based on user role
    const isAdmin = auth.user.roles.some(role => role.name === 'admin');
    const Layout = isAdmin ? AdminLayout : CashierLayout;
    
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // PUT to customers.update route
        put(`/customers/${customer.id}`);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & Accounts', href: '/customers' },
        { title: customer.name, href: `/customers/${customer.id}` },
        { title: 'Edit Profile', href: `/customers/${customer.id}/edit` },
    ];

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Customer: ${customer.name}`} />
            
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                
                {/* Header and Back Button */}
                <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <Link href={`/customers/${customer.id}`} className={getButtonClasses('outline', 'icon')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Customer Profile</h1>
                            <p className="text-sm text-muted-foreground">Modify details for Customer ID #{customer.id} | Joined: {new Date(customer.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
                
                {/* Status Messages (Success/Error) */}
                {(flash?.success || flash?.error) && (
                    <div className={`p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${
                        flash.success ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                    }`}>
                        {flash.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                        {flash.success || flash.error}
                    </div>
                )}

                {/* Profile Edit Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700 p-8">
                    
                    <form onSubmit={submit} className="space-y-8">
                        
                        {/* --- Section 1: Customer Details --- */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <User className="h-5 w-5 text-indigo-500" /> General Information
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
                                    <label htmlFor="kyc_status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><UserCheck className='h-4 w-4'/> KYC Status (Staff Action)</label>
                                    <select
                                        id="kyc_status"
                                        value={data.kyc_status}
                                        onChange={(e) => setData('kyc_status', e.target.value as 'Pending' | 'Verified' | 'Rejected')}
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
                                        Saving...
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <Save className="mr-2 h-4 w-4" /> Save Profile Changes
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