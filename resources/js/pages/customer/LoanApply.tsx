import CustomerLayout from '@/layouts/customer/CustomerLayout'; 
import AdminLayout from '@/layouts/admin/layout';
import LoanOfficerLayout from '@/layouts/loanOfficer/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import React, { useMemo } from 'react';
import { ArrowLeft, User, DollarSign, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';

// --- Type Definitions ---
interface LoanApplyProps {
    customerId?: number; 
    customerName?: string;
    
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

// Simple EMI Calculation (Replicated Client-Side for UX)
const calculateEmi = (principal: number, rateAnnual: number, months: number): number => {
    if (months <= 0) return 0;

    const rateMonthly = (rateAnnual / 100) / 12;

    if (rateMonthly === 0) {
        return Math.round(principal / months * 100) / 100;
    }

    const powerTerm = Math.pow(1 + rateMonthly, months);
    const numerator = principal * rateMonthly * powerTerm;
    const denominator = powerTerm - 1;

    return Math.round((numerator / denominator) * 100) / 100;
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};


export default function LoanApply() {
    const pageProps = usePage<SharedData & LoanApplyProps>().props;
    const { flash, auth } = pageProps;
    
    // DEFENSIVELY extract roles, ensuring it's an array if undefined
    const roles = auth.user.roles || [];

    // Determine context: True if customerId and customerName are passed (meaning customer portal view)
    const isCustomerPortal = !!pageProps.customerId;
    const initialCustomerId = pageProps.customerId ? pageProps.customerId.toString() : '';

    // Determine layout based on user role
    const isAdmin = roles.some(role => role.name === 'admin');
    const isLoanOfficer = roles.some(role => role.name === 'loan_officer');
    
    let Layout;
    if (isCustomerPortal) {
        Layout = CustomerLayout;
    } else if (isAdmin) {
        Layout = AdminLayout;
    } else if (isLoanOfficer) {
        Layout = LoanOfficerLayout;
    } else {
        Layout = AdminLayout; // Default to Admin layout for other staff/general
    }

    const { data, setData, post, processing, errors, reset } = useForm({
        // Automatically set customer_id from props if available, otherwise blank for staff entry
        customer_id: initialCustomerId, 
        amount: '10000',
        interest_rate: '7.5',
        term_months: '36',
    });

    // Client-side EMI Calculation for display
    const principal = parseFloat(data.amount);
    const rate = parseFloat(data.interest_rate);
    const months = parseInt(data.term_months);
    const monthlyEmi = useMemo(() => calculateEmi(principal, rate, months), [principal, rate, months]);
    
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/customer/loans/apply', {
            onSuccess: () => {
                // Reset form fields after successful submission
                reset('amount', 'interest_rate', 'term_months');
            },
            onError: () => {
                // Errors are displayed via the {errors} object and flash message.
            },
            // Submits to the centralized loans.store route
            preserveScroll: true,
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'New Loan Application', href: isCustomerPortal ? '/customer/loans/apply' : '/loans/applications' },
    ];


    return (
        <Layout breadcrumbs={breadcrumbs}>
            <Head title="Loan Application" />
            
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                
                {/* Header and Back Button */}
                <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Loan Application</h1>
                        <p className="text-sm text-muted-foreground">
                            {isCustomerPortal ? 
                                `Welcome, ${pageProps.customerName}. Apply for a new loan.` : 
                                `Submit a request for a new term loan on behalf of a customer.`
                            }
                        </p>
                    </div>
                    
                    {!isCustomerPortal && (
                        <Link href="/loans/applications" className={getButtonClasses('outline', 'default')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            View Applications
                        </Link>
                    )}
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

                {/* Application Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700 p-8">
                    
                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* --- Section 1: Customer & Loan Amount --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6 dark:border-gray-700">
                            
                            {/* Customer ID (CONDITIONAL DISPLAY) */}
                            {!isCustomerPortal ? (
                                <div>
                                    <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><User className='h-4 w-4'/> Customer ID</label>
                                    <input
                                        id="customer_id"
                                        type="number"
                                        value={data.customer_id}
                                        onChange={(e) => setData('customer_id', e.target.value)}
                                        required
                                        placeholder="e.g., 1 or 101"
                                        className={`w-full border ${errors.customer_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                                    />
                                    {errors.customer_id && <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>}
                                </div>
                            ) : (
                                // Hidden input for customer portal submission
                                <input type="hidden" name="customer_id" value={data.customer_id} />
                            )}
                            
                            {/* Loan Amount */}
                            <div className={!isCustomerPortal ? '' : 'md:col-span-2'}>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><DollarSign className='h-4 w-4'/> Principal Amount (USD)</label>
                                <input
                                    id="amount"
                                    type="number"
                                    step="100"
                                    min="100"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    required
                                    className={`w-full border ${errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                                />
                                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                            </div>
                        </div>

                        {/* --- Section 2: Term and Rate --- */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Term Months */}
                            <div>
                                <label htmlFor="term_months" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><Clock className='h-4 w-4'/> Loan Term (Months)</label>
                                <input
                                    id="term_months"
                                    type="number"
                                    // FIX: Changed step from 12 to 1 to allow any valid integer input
                                    step="1"
                                    min="6"
                                    max="120"
                                    value={data.term_months}
                                    onChange={(e) => setData('term_months', e.target.value)}
                                    required
                                    className={`w-full border ${errors.term_months ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                                />
                                {errors.term_months && <p className="mt-1 text-sm text-red-600">{errors.term_months}</p>}
                            </div>

                            {/* Interest Rate */}
                            <div>
                                <label htmlFor="interest_rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><FileText className='h-4 w-4'/> Annual Interest Rate (%)</label>
                                <input
                                    id="interest_rate"
                                    type="number"
                                    step="0.1"
                                    min="0.1"
                                    max="50"
                                    value={data.interest_rate}
                                    onChange={(e) => setData('interest_rate', e.target.value)}
                                    required
                                    className={`w-full border ${errors.interest_rate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                                />
                                {errors.interest_rate && <p className="mt-1 text-sm text-red-600">{errors.interest_rate}</p>}
                            </div>

                            {/* Calculated EMI Display */}
                            <div className="bg-indigo-50 dark:bg-indigo-900/50 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Estimated Monthly EMI</p>
                                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {monthlyEmi > 0 ? formatCurrency(monthlyEmi) : '---'}
                                </p>
                            </div>
                        </div>

                        {/* --- Submit Button --- */}
                        <div className="pt-4 border-t dark:border-gray-700">
                            <button
                                type="submit"
                                disabled={processing || monthlyEmi <= 0 || !data.customer_id}
                                className={`${getButtonClasses('default', 'default', processing || monthlyEmi <= 0 || !data.customer_id)} w-full md:w-auto px-6`}
                            >
                                {processing ? 'Submitting...' : (
                                    <span className="flex items-center">
                                        <FileText className="mr-2 h-4 w-4" /> Submit Application
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