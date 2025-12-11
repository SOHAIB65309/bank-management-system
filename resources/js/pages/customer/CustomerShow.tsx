import CashierLayout from '@/layouts/cashier/layout';
import AdminLayout from '@/layouts/admin/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import React from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Banknote, UserCheck, Wallet, PlusCircle, CreditCard, Clock, CheckCircle, XCircle, Pencil } from 'lucide-react';

// --- Type Definitions ---
interface Account {
    id: number;
    account_type: 'Savings' | 'Current' | 'Fixed Deposit';
    balance: number;
    status: string;
    transactions: Transaction[];
}

interface Transaction {
    id: number;
    type: 'Deposit' | 'Withdrawal' | 'Transfer';
    amount: number;
    description: string;
    created_at: string;
}

interface CustomerRecord {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    kyc_status: 'Pending' | 'Verified' | 'Rejected';
    accounts: Account[];
}

interface CustomerShowProps {
    customer: CustomerRecord;
    totalBalance: number;
    accountTypes: string[];
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

// Formatting currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

// --- Component to handle opening new accounts ---

interface NewAccountFormProps {
    customerId: number;
    accountTypes: string[];
}

const NewAccountForm: React.FC<NewAccountFormProps> = ({ customerId, accountTypes }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: customerId.toString(),
        account_type: accountTypes[0] || 'Savings',
        initial_balance: '0.00',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // POST to a new account creation endpoint in AccountController
        post('/accounts', {
            onSuccess: () => {
                alert('New account opened successfully! The page will now refresh.');
                // Inertia automatically refreshes the page on success if controller redirects/re-renders
                reset('initial_balance');
            },
            preserveScroll: true,
        });
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-inner space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 border-b pb-2">
                <PlusCircle className="h-5 w-5 text-green-600" /> Open New Account
            </h3>
            
            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                
                {/* Account Type */}
                <div>
                    <label htmlFor="new_account_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type</label>
                    <select
                        id="new_account_type"
                        value={data.account_type}
                        onChange={(e) => setData('account_type', e.target.value)}
                        required
                        className={`w-full border ${errors.account_type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-600 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                    >
                        {accountTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    {errors.account_type && <p className="mt-1 text-xs text-red-500">{errors.account_type}</p>}
                </div>

                {/* Initial Deposit */}
                <div>
                    <label htmlFor="new_initial_balance" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Deposit</label>
                    <input
                        id="new_initial_balance"
                        type="number"
                        step="0.01"
                        min="0.00"
                        value={data.initial_balance}
                        onChange={(e) => setData('initial_balance', e.target.value)}
                        required
                        className={`w-full border ${errors.initial_balance ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-600 dark:text-white rounded-md shadow-sm p-2 transition duration-150`}
                    />
                    {errors.initial_balance && <p className="mt-1 text-xs text-red-500">{errors.initial_balance}</p>}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={processing}
                    className={`${getButtonClasses('default', 'default', processing)} h-10 w-full`}
                >
                    {processing ? 'Opening...' : 'Open Account'}
                </button>
            </form>
        </div>
    );
};


// --- Main Component ---

export default function CustomerShow() {
    const pageProps = usePage<SharedData & CustomerShowProps>().props;
    const { customer, totalBalance, accountTypes, flash, auth } = pageProps;

    const isAdmin = auth.user.roles.some(role => role.name === 'admin');
    const Layout = isAdmin ? AdminLayout : CashierLayout;
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Customer & Accounts', href: '/customers' },
        { title: customer.name, href: `/customers/${customer.id}` },
    ];


    return (
        <Layout breadcrumbs={breadcrumbs}>
            <Head title={`Customer: ${customer.name}`} />
            
            <div className="p-6 space-y-8 max-w-7xl mx-auto">
                
                {/* Header and Back Button */}
                <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                        <Link href="/customers" className={getButtonClasses('outline', 'icon')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{customer.name}</h1>
                            <p className="text-sm text-muted-foreground">Customer ID: #{customer.id}</p>
                        </div>
                    </div>
                    {/* Action buttons (e.g., Edit Customer Profile) */}
                    <Link href={`/customers/${customer.id}/edit`} className={getButtonClasses('outline', 'default')}>
                        <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                    </Link>
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
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* --- LEFT COLUMN: Customer Profile & Total Balance --- */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Total Balance Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 dark:border dark:border-gray-700 space-y-3">
                            <div className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                                <Wallet className="h-6 w-6 text-indigo-500" /> Total Holdings
                            </div>
                            <p className="text-4xl font-extrabold text-indigo-600 dark:text-green-400">
                                {formatCurrency(totalBalance)}
                            </p>
                            <p className="text-sm text-muted-foreground">Across all {customer.accounts.length} linked accounts.</p>
                        </div>

                        {/* Profile Details Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 dark:border dark:border-gray-700 space-y-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2 mb-3 flex items-center gap-2">
                                <User className="h-5 w-5 text-indigo-500" /> Profile Details
                            </h2>
                            <DetailRow icon={Mail} label="Email" value={customer.email} />
                            <DetailRow icon={Phone} label="Phone" value={customer.phone || 'N/A'} />
                            <DetailRow icon={MapPin} label="Address" value={customer.address || 'N/A'} />
                            <DetailRow icon={UserCheck} label="KYC Status" value={customer.kyc_status} status={customer.kyc_status} />
                        </div>
                    </div>
                    
                    {/* --- RIGHT COLUMN: Accounts & Transactions --- */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        <NewAccountForm customerId={customer.id} accountTypes={accountTypes} />

                        {customer.accounts.map((account) => (
                            <AccountDetailsCard key={account.id} account={account} customerName={customer.name} />
                        ))}
                        
                        {customer.accounts.length === 0 && (
                            <div className="p-6 text-center text-muted-foreground bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700">
                                This customer currently has no active accounts.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

// Helper Component for Profile Detail Row
const DetailRow: React.FC<{ icon: React.ElementType, label: string, value: string, status?: string }> = ({ icon: Icon, label, value, status }) => {
    const statusColor = status === 'Verified' ? 'text-green-500' : (status === 'Pending' ? 'text-yellow-500' : 'text-gray-500');
    return (
        <div className="flex items-center text-sm">
            <Icon className="h-4 w-4 mr-3 text-indigo-500" />
            <span className="font-medium text-gray-500 dark:text-gray-400 w-24 shrink-0">{label}:</span>
            <span className={`font-semibold ml-2 ${status ? statusColor : 'text-gray-800 dark:text-white'}`}>{value}</span>
        </div>
    );
};

// Helper Component for Account Details Card
const AccountDetailsCard: React.FC<{ account: Account, customerName: string }> = ({ account }) => {
    const balanceColor = account.balance < 0 ? 'text-red-500' : 'text-green-500 dark:text-green-400';
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-indigo-500" /> {account.account_type} Account
                </h3>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${account.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                    {account.status}
                </span>
            </div>

            <div className="p-6 grid grid-cols-2 gap-4">
                {/* Balance and ID */}
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Account Balance</p>
                    <p className={`text-3xl font-bold ${balanceColor}`}>{formatCurrency(account.balance)}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Account Number (ID)</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">#{account.id}</p>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="px-6 pb-6 pt-0">
                <h4 className="text-lg font-semibold border-t pt-4 mt-2 dark:border-gray-700 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-500" /> Recent Transactions
                </h4>
                
                {account.transactions.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                        {account.transactions.map(tx => (
                            <li key={tx.id} className="flex justify-between items-center text-sm p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                <span className="font-medium capitalize text-gray-700 dark:text-gray-300">{tx.type}</span>
                                <span className={`font-semibold ${tx.type === 'Deposit' ? 'text-green-600' : (tx.type === 'Withdrawal' ? 'text-red-600' : 'text-indigo-600')}`}>
                                    {formatCurrency(tx.amount)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-2 text-sm text-gray-500">No recent transactions found.</p>
                )}
            </div>
        </div>
    );
};