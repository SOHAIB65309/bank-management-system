import CashierLayout from '@/layouts/cashier/layout';
import AdminLayout from '@/layouts/admin/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import React, { useState, useCallback, useEffect } from 'react';
import { CreditCard, ArrowRight, DollarSign, ArrowDown, ArrowUp, CheckCircle, XCircle, User, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';
// --- Global Type Definitions ---
interface AccountDetails {
    id: number;
    type: string;
    balance: number;
    status: string;
    customer_name: string;
}

interface TransactionIndexProps {
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

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

// Define the required StatusMessage structure type
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

// --- Account Lookup Utility ---

interface AccountLookupProps {
    accountId: string;
    onAccountFound: (details: AccountDetails) => void;
    onAccountNotFound: () => void;
    isPrimary?: boolean;
}

const AccountLookup: React.FC<AccountLookupProps> = ({ accountId, onAccountFound, onAccountNotFound, isPrimary = true }) => {
    const [lookupDetails, setLookupDetails] = useState<AccountDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

      const lookupAccount = useCallback(async (id: string) => {
        // FIX 1: Removed restrictive length check. Check only for empty string.
        if (!id) {
            setLookupDetails(null);
            onAccountNotFound();
            return;
        }
        
        // Ensure ID is a valid number format before fetching
        if (isNaN(parseInt(id))) {
            setError("Account ID must be a number.");
            setLookupDetails(null);
            onAccountNotFound();
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // REFRACTOR: Use axios for cleaner POST and error handling
            const response = await axios.post('/api/account/lookup', {
                account_id: id 
            });

            // Axios successful response data is in response.data
            const data: AccountDetails = response.data;
            setLookupDetails(data);
            onAccountFound(data);
            
        } catch (e: any) {
            let errorMessage = 'Error looking up account.';

            if (axios.isAxiosError(e)) {
                if (e.response) {
                    if (e.response.status === 404) {
                        errorMessage = 'Account not found in system.';
                    } else if (e.response.data && e.response.data.error) {
                        // Use the error message sent from the controller (if available)
                        errorMessage = e.response.data.error; 
                    } else if (e.response.status === 419) {
                        // Specific handling for 419 Page Expired error
                        errorMessage = 'Session expired. Please refresh the page and try logging in again.';
                    } else {
                        errorMessage = `Server error during lookup (Status: ${e.response.status}).`;
                    }
                } else if (e.request) {
                    errorMessage = 'No response received from server.';
                }
            } else {
                errorMessage = e.message || 'Request setup error.';
            }
            
            setLookupDetails(null);
            onAccountNotFound();
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [onAccountFound, onAccountNotFound]);


    useEffect(() => {
        if (timer) clearTimeout(timer);
        
        const newTimer = setTimeout(() => {
            if (accountId) {
                lookupAccount(accountId);
            } else {
                setLookupDetails(null);
                onAccountNotFound();
                setError(null);
            }
        }, 500); // Debounce lookup
        
        setTimer(newTimer);
        
        return () => { if (timer) clearTimeout(timer); };
    }, [accountId, lookupAccount]);
    
    const balanceColor = lookupDetails && lookupDetails.balance < 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400';
    const statusClass = lookupDetails && lookupDetails.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';

    return (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700">
            {isLoading && (
                <div className="flex items-center text-sm text-indigo-600 dark:text-indigo-400">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Searching...
                </div>
            )}
            
            {!isLoading && error && (
                <div className="flex items-center text-sm text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-4 w-4 mr-2" /> {error}
                </div>
            )}

            {!isLoading && lookupDetails && (
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <DetailRow icon={User} label={isPrimary ? "Customer Name" : "Target Customer"} value={lookupDetails.customer_name} />
                    <DetailRow icon={CreditCard} label="Account Type" value={lookupDetails.type} />
                    <DetailRow 
                        icon={DollarSign} 
                        label="Current Balance" 
                        value={formatCurrency(lookupDetails.balance)}
                        valueClass={balanceColor}
                    />
                    <div>
                        <span className="font-medium text-gray-500 dark:text-gray-400 mr-2">Status:</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusClass}`}>{lookupDetails.status}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const DetailRow: React.FC<{ icon: React.ElementType, label: string, value: string, valueClass?: string }> = ({ icon: Icon, label, value, valueClass }) => (
    <div className="flex items-center">
        <Icon className="h-4 w-4 mr-2 text-indigo-500" />
        <span className="font-medium text-gray-500 dark:text-gray-400 mr-1">{label}:</span>
        <span className={`font-semibold text-gray-800 dark:text-white ${valueClass}`}>{value}</span>
    </div>
);


// --- Deposit Form Component (Updated with Lookup) ---

const DepositForm: React.FC<TransactionIndexProps> = ({ flash }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        account_id: '',
        amount: '',
        description: 'Cash deposit.',
    });
    const [accountFound, setAccountFound] = useState<AccountDetails | null>(null);

    const handleAccountFound = useCallback((details: AccountDetails) => {
        setAccountFound(details);
    }, []);

    const handleAccountNotFound = useCallback(() => {
        setAccountFound(null);
    }, []);
    
    // FIXED: Explicitly define the statusMessage type
    const statusMessage: StatusMessageType = flash?.success ? 
        { message: flash.success, type: 'success' } : 
        (flash?.error ? { message: flash.error, type: 'error' } : null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/transactions/deposit', {
            onSuccess: () => {
                reset();
            },
            preserveScroll: true,
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700 p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 border-b pb-3">
                <ArrowDown className="h-6 w-6 text-green-600" /> Process Cash Deposit
            </h2>
            <TransactionStatusMessage statusMessage={statusMessage} />

            <form onSubmit={submit} className="space-y-5">
                
                {/* Account ID Field */}
                <div>
                    <label htmlFor="deposit_account_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><CreditCard className='h-4 w-4'/> Account Number</label>
                    <input
                        id="deposit_account_id"
                        type="number"
                        value={data.account_id}
                        onChange={(e) => setData('account_id', e.target.value)}
                        required
                        className={`w-full border ${errors.account_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                    />
                    {errors.account_id && <p className="mt-1 text-sm text-red-600">{errors.account_id}</p>}
                    <AccountLookup accountId={data.account_id} onAccountFound={handleAccountFound} onAccountNotFound={handleAccountNotFound} />
                </div>

                {/* Amount Field */}
                <div>
                    <label htmlFor="deposit_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><DollarSign className='h-4 w-4'/> Deposit Amount (USD)</label>
                    <input
                        id="deposit_amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                        required
                        disabled={!accountFound} // Disable if account not found
                        className={`w-full border ${errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                    />
                    {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                </div>
                
                {/* Description Field */}
                <div>
                    <label htmlFor="deposit_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                    <input
                        id="deposit_description"
                        type="text"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        disabled={!accountFound}
                        className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t dark:border-gray-700">
                    <button
                        type="submit"
                        disabled={processing || !accountFound}
                        className={`${getButtonClasses('default', 'default', processing || !accountFound)} w-full px-6`}
                    >
                        {processing ? (
                            <span className="flex items-center"><Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> Depositing...</span>
                        ) : (
                            <span className="flex items-center"><ArrowRight className="mr-2 h-4 w-4" /> Finalize Deposit</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- Withdrawal Form Component (NEW) ---

const WithdrawalForm: React.FC<TransactionIndexProps> = ({ flash }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        account_id: '',
        amount: '',
        description: 'Cash withdrawal.',
    });
    const [accountFound, setAccountFound] = useState<AccountDetails | null>(null);

    const handleAccountFound = useCallback((details: AccountDetails) => setAccountFound(details), []);
    const handleAccountNotFound = useCallback(() => setAccountFound(null), []);
    
    // FIXED: Explicitly define the statusMessage type
    const statusMessage: StatusMessageType = flash?.success ? 
        { message: flash.success, type: 'success' } : 
        (flash?.error ? { message: flash.error, type: 'error' } : null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/transactions/withdrawal', {
            onSuccess: () => {
                reset();
            },
            preserveScroll: true,
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700 p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 border-b pb-3">
                <ArrowUp className="h-6 w-6 text-red-600" /> Process Cash Withdrawal
            </h2>
            <TransactionStatusMessage statusMessage={statusMessage} />

            <form onSubmit={submit} className="space-y-5">
                
                {/* Account ID Field */}
                <div>
                    <label htmlFor="withdrawal_account_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><CreditCard className='h-4 w-4'/> Account Number</label>
                    <input
                        id="withdrawal_account_id"
                        type="number"
                        value={data.account_id}
                        onChange={(e) => setData('account_id', e.target.value)}
                        required
                        className={`w-full border ${errors.account_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                    />
                    {errors.account_id && <p className="mt-1 text-sm text-red-600">{errors.account_id}</p>}
                    <AccountLookup accountId={data.account_id} onAccountFound={handleAccountFound} onAccountNotFound={handleAccountNotFound} />
                </div>

                {/* Amount Field */}
                <div>
                    <label htmlFor="withdrawal_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><DollarSign className='h-4 w-4'/> Withdrawal Amount (USD)</label>
                    <input
                        id="withdrawal_amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={data.amount}
                        onChange={(e) => setData('amount', e.target.value)}
                        required
                        disabled={!accountFound} // Disable if account not found
                        className={`w-full border ${errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                    />
                    {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                    
                    {accountFound && accountFound.balance < parseFloat(data.amount) && (
                         <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><AlertTriangle className='h-4 w-4'/> Warning: Insufficient funds for this withdrawal!</p>
                    )}
                </div>
                
                {/* Description Field */}
                <div>
                    <label htmlFor="withdrawal_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                    <input
                        id="withdrawal_description"
                        type="text"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        disabled={!accountFound}
                        className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t dark:border-gray-700">
                    <button
                        type="submit"
                        disabled={processing || !accountFound}
                        className={`${getButtonClasses('default', 'default', processing || !accountFound)} w-full px-6 bg-red-600 hover:bg-red-700`}
                    >
                        {processing ? (
                            <span className="flex items-center"><Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> Processing...</span>
                        ) : (
                            <span className="flex items-center"><ArrowRight className="mr-2 h-4 w-4" /> Finalize Withdrawal</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- Transfer Form Component (NEW) ---

const TransferForm: React.FC<TransactionIndexProps> = ({ flash }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        source_account_id: '',
        target_account_id: '',
        amount: '',
        description: 'Internal funds transfer.',
    });
    
    const [sourceFound, setSourceFound] = useState<AccountDetails | null>(null);
    const [targetFound, setTargetFound] = useState<AccountDetails | null>(null);

    const handleSourceFound = useCallback((details: AccountDetails) => setSourceFound(details), []);
    const handleSourceNotFound = useCallback(() => setSourceFound(null), []);
    const handleTargetFound = useCallback((details: AccountDetails) => setTargetFound(details), []);
    const handleTargetNotFound = useCallback(() => setTargetFound(null), []);
    
    // FIXED: Explicitly define the statusMessage type
    const statusMessage: StatusMessageType = flash?.success ? 
        { message: flash.success, type: 'success' } : 
        (flash?.error ? { message: flash.error, type: 'error' } : null);

    const isReadyToSubmit = sourceFound && targetFound && sourceFound.id !== targetFound.id;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/transactions/transfer', {
            onSuccess: () => {
                reset();
            },
            preserveScroll: true,
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700 p-8 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 border-b pb-3">
                <ArrowRight className="h-6 w-6 text-indigo-600" /> Process Fund Transfer
            </h2>
            <TransactionStatusMessage statusMessage={statusMessage} />

            <form onSubmit={submit} className="space-y-6">
                
                {/* --- SOURCE ACCOUNT --- */}
                <div className="border p-4 rounded-lg dark:border-gray-700 space-y-4">
                    <h3 className="text-lg font-semibold dark:text-white">Source Account (Debit)</h3>
                    <div>
                        <label htmlFor="source_account_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><CreditCard className='h-4 w-4'/> Account Number to Debit</label>
                        <input
                            id="source_account_id"
                            type="number"
                            value={data.source_account_id}
                            onChange={(e) => setData('source_account_id', e.target.value)}
                            required
                            className={`w-full border ${errors.source_account_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                        />
                        {errors.source_account_id && <p className="mt-1 text-sm text-red-600">{errors.source_account_id}</p>}
                        <AccountLookup accountId={data.source_account_id} onAccountFound={handleSourceFound} onAccountNotFound={handleSourceNotFound} isPrimary={false} />
                    </div>
                </div>

                {/* --- TARGET ACCOUNT --- */}
                <div className="border p-4 rounded-lg dark:border-gray-700 space-y-4">
                    <h3 className="text-lg font-semibold dark:text-white">Target Account (Credit)</h3>
                    <div>
                        <label htmlFor="target_account_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><CreditCard className='h-4 w-4'/> Account Number to Credit</label>
                        <input
                            id="target_account_id"
                            type="number"
                            value={data.target_account_id}
                            onChange={(e) => setData('target_account_id', e.target.value)}
                            required
                            className={`w-full border ${errors.target_account_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                        />
                        {errors.target_account_id && <p className="mt-1 text-sm text-red-600">{errors.target_account_id}</p>}
                        <AccountLookup accountId={data.target_account_id} onAccountFound={handleTargetFound} onAccountNotFound={handleTargetNotFound} isPrimary={false} />
                    </div>
                    {sourceFound && targetFound && sourceFound.id === targetFound.id && (
                        <p className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className='h-4 w-4'/> Error: Source and Target accounts cannot be the same.</p>
                    )}
                </div>

                {/* --- AMOUNT AND DESCRIPTION --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="transfer_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1"><DollarSign className='h-4 w-4'/> Transfer Amount (USD)</label>
                        <input
                            id="transfer_amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            required
                            disabled={!isReadyToSubmit}
                            className={`w-full border ${errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                        />
                        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
                    </div>

                    <div>
                        <label htmlFor="transfer_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                        <input
                            id="transfer_description"
                            type="text"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            disabled={!isReadyToSubmit}
                            className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t dark:border-gray-700">
                    <button
                        type="submit"
                        disabled={processing || !isReadyToSubmit}
                        className={`${getButtonClasses('default', 'default', processing || !isReadyToSubmit)} w-full px-6`}
                    >
                        {processing ? (
                            <span className="flex items-center"><Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> Processing Transfer...</span>
                        ) : (
                            <span className="flex items-center"><ArrowRight className="mr-2 h-4 w-4" /> Finalize Transfer</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};


// --- Main Transaction Index Component (Unchanged Structure) ---

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Transactions', href: '/transactions' },
];

export default function TransactionIndex() {
    const pageProps = usePage<SharedData & TransactionIndexProps>().props;
    const { flash, auth } = pageProps;

    const [activeTab, setActiveTab] = useState<'deposit' | 'withdrawal' | 'transfer'>('deposit');
    
    const isAdmin = auth.user.roles.some(role => role.name === 'admin');
    const Layout = isAdmin ? AdminLayout : CashierLayout;

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <Head title="Transaction Processing" />
            
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                
                {/* Header */}
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white border-b pb-4 dark:border-gray-700">
                    Teller Services
                </h1>
                
                {/* Tabs */}
                <div className="flex border-b dark:border-gray-700">
                    <TabButton 
                        label="Deposit" 
                        icon={ArrowDown} 
                        isActive={activeTab === 'deposit'} 
                        onClick={() => setActiveTab('deposit')} 
                    />
                    <TabButton 
                        label="Withdrawal" 
                        icon={ArrowUp} 
                        isActive={activeTab === 'withdrawal'} 
                        onClick={() => setActiveTab('withdrawal')} 
                    />
                    <TabButton 
                        label="Transfer" 
                        icon={ArrowRight} 
                        isActive={activeTab === 'transfer'} 
                        onClick={() => setActiveTab('transfer')} 
                    />
                </div>

                {/* Content */}
                <div className="pt-4">
                    {/* Render the correct form based on activeTab */}
                    {activeTab === 'deposit' && <DepositForm flash={flash} />}
                    {activeTab === 'withdrawal' && <WithdrawalForm flash={flash} />}
                    {activeTab === 'transfer' && <TransferForm flash={flash} />}
                </div>
            </div>
        </Layout>
    );
}

// Helper Component for Tabs
const TabButton: React.FC<{ label: string, icon: React.ElementType, isActive: boolean, onClick: () => void }> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 text-sm font-medium flex items-center gap-2 transition-colors ${
            isActive
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
    >
        <Icon className="h-5 w-5" />
        {label}
    </button>
);
