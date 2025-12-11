import CustomerLayout from '@/layouts/customer/CustomerLayout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, useForm } from '@inertiajs/react';
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, DollarSign, CreditCard, User, Loader2, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

// --- Type Definitions ---
interface CustomerAccount {
    id: number;
    account_type: string;
    balance: number;
}
interface AccountDetails {
    id: number;
    type: string;
    balance: number;
    customer_name: string;
}
interface CustomerTransferProps {
    customerAccounts: CustomerAccount[]; // Passed by Controller
    customerName: string; // Passed by Controller
    customerId: number; // Passed by Controller
    flash?: { success?: string; error?: string; }
}
type StatusMessageType = { message: string; type: 'success' | 'error' } | null;
const TransactionStatusMessage: React.FC<{ statusMessage: StatusMessageType }> = ({ statusMessage }) => {
    if (!statusMessage) return null;

    return (
        <div className={`p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
        }`}>
            {statusMessage.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            {statusMessage.message}
        </div>
    );
}
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Helper function to simulate button classes (reused)
const getButtonClasses = (variant: 'default' | 'outline' | 'ghost' | 'icon', size: 'sm' | 'icon' | 'default', disabled: boolean = false) => {
    let base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';
    if (disabled) base += ' opacity-50 cursor-not-allowed';
    if (size === 'default') base += ' h-9 px-4 py-2';
    if (variant === 'default') base += ' bg-indigo-600 text-white hover:bg-indigo-700 shadow';
    
    return base;
};

// --- Target Account Lookup Utility (Adapted from TransactionIndex.tsx) ---
// This is used ONLY for looking up external or internal TARGET accounts.
interface TargetAccountLookupProps {
    accountId: string;
    onAccountFound: (details: AccountDetails) => void;
    onAccountNotFound: () => void;
    sourceAccountId: string;
}

const TargetAccountLookup: React.FC<TargetAccountLookupProps> = ({ accountId, onAccountFound, onAccountNotFound, sourceAccountId }) => {
    const [lookupDetails, setLookupDetails] = useState<AccountDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    const lookupAccount = useCallback(async (id: string) => {
        if (!id || id === sourceAccountId) {
            setLookupDetails(null);
            onAccountNotFound();
            setError(id === sourceAccountId ? 'Source and target accounts must be different.' : null);
            return;
        }
        
        if (isNaN(parseInt(id))) {
            setError("Account ID must be a number.");
            setLookupDetails(null);
            onAccountNotFound();
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post('/customer/account/lookup', { account_id: id });
            setLookupDetails(response.data);
            onAccountFound(response.data);
        } catch (e: any) {
            setLookupDetails(null);
            onAccountNotFound();
            setError(e.response?.data?.error || 'Target account lookup failed.');
        } finally {
            setIsLoading(false);
        }
    }, [onAccountFound, onAccountNotFound, sourceAccountId]);

    useEffect(() => {
        if (timer) clearTimeout(timer);
        
        const newTimer = setTimeout(() => {
            lookupAccount(accountId);
        }, 500); 
        
        setTimer(newTimer);
        return () => clearTimeout(newTimer);
    }, [accountId, lookupAccount]);
    
    const targetCustomerName = lookupDetails?.customer_name || '...';

    return (
        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-inner text-xs">
            {isLoading && <p className="text-indigo-500 flex items-center"><Loader2 className='animate-spin h-3 w-3 mr-1'/> Searching...</p>}
            {!isLoading && error && <p className="text-red-500">{error}</p>}
            {!isLoading && lookupDetails && (
                <p className="text-green-600 dark:text-green-400">
                    Transfer target: <span className="font-semibold">{targetCustomerName}</span> ({lookupDetails.type})
                </p>
            )}
        </div>
    );
};
// --- End Target Account Lookup Utility ---

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Fund Transfer', href: '/customer/transfer' },
];

export default function CustomerTransfer() {
    const pageProps = usePage<SharedData & CustomerTransferProps>().props;
    const { customerAccounts, customerName, flash } = pageProps;

    const [targetDetails, setTargetDetails] = useState<AccountDetails | null>(null);

    // Set initial source_account_id if accounts exist
    const initialSourceId = customerAccounts.length > 0 ? customerAccounts[0].id.toString() : '';

    const { data, setData, post, processing, errors, reset } = useForm({
        source_account_id: initialSourceId,
        target_account_id: '',
        amount: '',
        description: 'Online customer transfer.',
    });
    
    // Find the currently selected source account object
    const sourceAccount = customerAccounts.find(a => a.id === parseInt(data.source_account_id));
    
    const handleTargetFound = useCallback((details: AccountDetails) => setTargetDetails(details), []);
    const handleTargetNotFound = useCallback(() => setTargetDetails(null), []);
    
    // Check if submission is logically valid on the client side
    const isTransferValid = targetDetails && targetDetails.id.toString() !== data.source_account_id && 
                            parseFloat(data.amount) > 0.01 && 
                            sourceAccount && sourceAccount.balance >= parseFloat(data.amount);

    // --- Submission Logic ---
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isTransferValid) {
             alert("Error: Please check the amount, source balance, and target account validation.");
             return;
        }

        // The /transactions/transfer endpoint handles the logic for both internal staff and customer transfers.
        post('/customer/transactions/transfer', {
            onSuccess: () => {
                reset('amount', 'target_account_id');
            },
            preserveScroll: true,
        });
    };
    
    const statusMessage: StatusMessageType = flash?.success ? 
        { message: flash.success, type: 'success' } : 
        (flash?.error ? { message: flash.error, type: 'error' } : null);

    return (
        <CustomerLayout breadcrumbs={breadcrumbs}>
            <Head title="Fund Transfer" />
            
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                
                <h1 className="text-3xl font-bold tracking-tight border-b pb-4 dark:border-gray-700">Send Funds</h1>

                <TransactionStatusMessage statusMessage={statusMessage} />

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700 p-8">
                    <form onSubmit={submit} className="space-y-6">

                        {/* --- Source Account Selection --- */}
                        <div>
                            <label htmlFor="source_account_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><CreditCard className='h-4 w-4'/> Pay From Account</label>
                            <select
                                id="source_account_id"
                                value={data.source_account_id}
                                onChange={(e) => setData('source_account_id', e.target.value)}
                                required
                                className={`w-full border ${errors.source_account_id ? 'border-red-500' : 'border-gray-300'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition`}
                            >
                                <option value="" disabled>Select Source Account</option>
                                {customerAccounts.map(account => (
                                    <option key={account.id} value={account.id}>
                                        {account.account_type} ({formatCurrency(account.balance)})
                                    </option>
                                ))}
                            </select>
                            {sourceAccount && (
                                <p className={`mt-2 text-xs font-semibold ${sourceAccount.balance < 100 ? 'text-red-500' : 'text-green-600'}`}>
                                    Available Balance: {formatCurrency(sourceAccount.balance)}
                                </p>
                            )}
                            {errors.source_account_id && <p className="mt-1 text-sm text-red-600">{errors.source_account_id}</p>}
                        </div>

                        {/* --- Target Account ID --- */}
                        <div>
                            <label htmlFor="target_account_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><ArrowRight className='h-4 w-4'/> To Account Number</label>
                            <input
                                id="target_account_id"
                                type="number"
                                min={1}
                                value={data.target_account_id}
                                onChange={(e) => setData('target_account_id', e.target.value)}
                                required
                                placeholder="Enter 3-8 digit account number"
                                className={`w-full border ${errors.target_account_id ? 'border-red-500' : 'border-gray-300'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition`}
                            />
                            {/* Target Details Lookup Component */}
                            <TargetAccountLookup 
                                accountId={data.target_account_id} 
                                onAccountFound={handleTargetFound} 
                                onAccountNotFound={handleTargetNotFound} 
                                sourceAccountId={data.source_account_id}
                            />
                            {errors.target_account_id && <p className="mt-1 text-sm text-red-600">{errors.target_account_id}</p>}
                        </div>

                        {/* --- Amount and Description --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><DollarSign className='h-4 w-4'/> Amount (USD)</label>
                                <input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    required
                                    disabled={!targetDetails}
                                    className={`w-full border ${errors.amount ? 'border-red-500' : 'border-gray-300'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition`}
                                />
                                {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                            </div>
                            
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                                <input
                                    id="description"
                                    type="text"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    disabled={!targetDetails}
                                    className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition`}
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !isTransferValid}
                            className={`${getButtonClasses('default', 'default', processing || !isTransferValid)} w-full mt-4`}
                        >
                            {processing ? 'Processing...' : 'Confirm Transfer'}
                        </button>
                    </form>
                </div>
            </div>
        </CustomerLayout>
    );
}