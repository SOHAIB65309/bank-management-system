import CustomerLayout from '@/layouts/customer/CustomerLayout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, Clock, CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

// --- Type Definitions ---
interface CustomerAccount {
    id: number;
    account_type: string;
    balance: number;
}
interface CustomerEmi {
    id: number;
    loan_id: number;
    amount_due: number | string; // Allow string type as received from JSON
    due_date: string;
    status: 'Pending' | 'Late';
}
interface CustomerEmiPayProps {
    flash?: { success?: string; error?: string; }
    pendingEmis: CustomerEmi[]; // Passed by Controller
    customerAccounts: CustomerAccount[]; // Passed by Controller
}

const formatCurrency = (amount: number | string) => {
    // Ensure amount is parsed to a number before formatting
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numAmount);
};

// Helper function to simulate button classes (reused)
const getButtonClasses = (variant: 'default' | 'outline' | 'ghost' | 'icon', size: 'sm' | 'icon' | 'default', disabled: boolean = false) => {
    let base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
    if (disabled) base += ' opacity-50 cursor-not-allowed';
    if (variant === 'default') base += ' bg-indigo-600 text-white hover:bg-indigo-700 shadow';
    if (size === 'default') base += ' h-9 px-4 py-2';
    return base;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'EMI Payments', href: '/customer/emis' },
];

export default function CustomerEmiPay() {
    // FIX: Destructure real props
    const pageProps = usePage<SharedData & CustomerEmiPayProps>().props;
    const { flash, pendingEmis: initialPendingEmis, customerAccounts: initialCustomerAccounts } = pageProps;

    const [pendingEmis, setPendingEmis] = useState<CustomerEmi[]>(initialPendingEmis);
    const [customerAccounts, setCustomerAccounts] = useState<CustomerAccount[]>(initialCustomerAccounts);
    
    // Ensure initial selection is based on the first item if it exists
    const [selectedEmi, setSelectedEmi] = useState<CustomerEmi | null>(initialPendingEmis.length > 0 ? initialPendingEmis[0] : null);
    
    // Form state for payment execution
    const { data, setData, post, processing, errors, reset } = useForm({
        source_account_id: customerAccounts.length > 0 ? customerAccounts[0].id.toString() : '',
        amount: selectedEmi ? String(selectedEmi.amount_due) : '', // Ensure string conversion
    });

    // Update form when selected EMI changes
    useEffect(() => {
        if (selectedEmi) {
            setData({ ...data, amount: String(selectedEmi.amount_due) });
        } else {
            setData({ ...data, amount: '' });
        }
    }, [selectedEmi]);

    // Handle initial selection if list is available
    useEffect(() => {
        if (!selectedEmi && pendingEmis.length > 0) {
            setSelectedEmi(pendingEmis[0]);
        }
    }, [pendingEmis]);


    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmi) return;

        const sourceAccount = customerAccounts.find(a => a.id === parseInt(data.source_account_id));
        const amount = parseFloat(data.amount);
        
        // FIX: Explicitly parse EMI amount to float before comparison/using toFixed
        const emiAmountDue = parseFloat(String(selectedEmi.amount_due));


        if (!sourceAccount) {
             alert("Error: Please select a source account.");
             return;
        }
        if (sourceAccount.balance < amount) {
            alert("Error: Insufficient funds in the selected source account.");
            return;
        }
        // FIX: Use parsed values for reliable comparison
        if (emiAmountDue > amount) {
            alert("Error: Payment amount is less than the amount due.");
            return;
        }

        // FIX: Use router.put for update action
            router.put(`/customer/emis/${selectedEmi.id}/pay`, { // Changed POST to PUT
                source_account_id: data.source_account_id,
                amount: amount,
            }, {
                onSuccess: () => {
                    // Use router.reload() for a true application state update
                    router.reload({ 
                        only: ['pendingEmis', 'customerAccounts'],
                        onFinish: () => {
                            // FIX: Use optional chaining for flash message safely
                            alert(flash?.success || `Payment confirmed!`); 
                            // Clear selected EMI to prompt user to select next one
                            setSelectedEmi(null); 
                        }
                    });
                },
                preserveScroll: true,
            });
    };

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>  
            <Head title="EMI Payment" />
            
            <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* --- Left Column: Pending EMIs List --- */}
                <div className="lg:col-span-2 space-y-6">
                    <h1 className="text-3xl font-bold tracking-tight border-b pb-4 dark:border-gray-700">Scheduled EMIs Due</h1>
                    
                    {(flash?.success || flash?.error) && (
                        <div className={`p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${
                            flash.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {flash.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                            {flash.success || flash.error}
                        </div>
                    )}
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Total Pending: {pendingEmis.length}</h2>
                        </div>
                        
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {pendingEmis.map(emi => {
                                const isSelected = emi.id === selectedEmi?.id;
                                // Cast to string if it was a number type for consistency
                                const isLate = emi.status === 'Late';

                                return (
                                    <li 
                                        key={emi.id} 
                                        className={`p-4 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition duration-150 flex justify-between items-center ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900' : ''} ${isLate ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                                        onClick={() => setSelectedEmi(emi)}
                                    >
                                        <div>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(emi.amount_due)}</p>
                                            <p className="text-xs text-muted-foreground">Loan #{emi.loan_id} | Due: {new Date(emi.due_date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isLate && <span className="text-sm text-red-600 font-semibold flex items-center"><Clock className='h-4 w-4 mr-1'/> LATE</span>}
                                            <button className={getButtonClasses('outline', 'sm', isSelected)} disabled={isSelected}>
                                                {isSelected ? 'Selected' : 'Pay Now'}
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        {pendingEmis.length === 0 && (
                            <p className="p-6 text-center text-muted-foreground">Congratulations! You have no pending EMIs.</p>
                        )}
                    </div>
                </div>

                {/* --- Right Column: Payment Form --- */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="sticky top-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Payment Execution</h2>

                        {!selectedEmi ? (
                            <p className="text-center text-muted-foreground">Select an EMI from the list to proceed with payment.</p>
                        ) : (
                            <form onSubmit={submitPayment} className="space-y-4">
                                
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Amount Due</p>
                                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(selectedEmi.amount_due)}</p>
                                </div>

                                {/* Source Account Selection */}
                                <div>
                                    <label htmlFor="source_account_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><CreditCard className='h-4 w-4'/> Pay From</label>
                                    <select
                                        id="source_account_id"
                                        value={data.source_account_id}
                                        onChange={(e) => setData('source_account_id', e.target.value)}
                                        required
                                        className={`w-full border ${errors.source_account_id ? 'border-red-500' : 'border-gray-300'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition`}
                                    >
                                        <option value="" disabled>Select Account</option>
                                        {customerAccounts.map(account => (
                                            <option key={account.id} value={account.id}>
                                                {account.account_type} ({formatCurrency(account.balance)})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.source_account_id && <p className="mt-1 text-sm text-red-600">{errors.source_account_id}</p>}
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={processing || !data.source_account_id}
                                    className={`${getButtonClasses('default', 'default', processing || !data.source_account_id)} w-full mt-4`}
                                >
                                    {processing ? 'Processing...' : 'Execute Payment'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

            </div>
        </CustomerLayout>
    );
}