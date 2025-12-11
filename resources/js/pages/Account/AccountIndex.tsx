import CashierLayout from '@/layouts/cashier/layout';
import AdminLayout from '@/layouts/admin/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { Wallet, Search, CreditCard, User, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Type Definitions ---
interface AccountRecord {
    id: number;
    account_type: 'Savings' | 'Current' | 'Fixed Deposit';
    balance: number;
    status: string;
    customer_id: number;
    customer: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
}

interface Paginator {
    data: AccountRecord[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    from: number | null; // Must be present
    to: number | null;   // Must be present
}

interface AccountIndexProps {
    accounts: Paginator;
    search: string;
}

// --- Helper Components ---

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

// Pagination Component (Reused Logic)
interface PaginationProps {
    links: AccountIndexProps['accounts']['links'];
    total: number;
    from: number | null;
    to: number | null;
}

const Pagination: React.FC<PaginationProps> = ({ links, total, from, to }) => {
    const pageLinks = links.slice(1, -1);
    const prevLink = links[0];
    const nextLink = links[links.length - 1];

    if (total === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 rounded-b-xl border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
                Showing {from} to {to} of {total} accounts
            </p>
            <div className="flex items-center space-x-2">
                <Link 
                    href={prevLink.url || '#'} 
                    className={getButtonClasses('outline', 'icon', !prevLink.url)}
                    aria-disabled={!prevLink.url}
                    tabIndex={!prevLink.url ? -1 : undefined}
                    preserveScroll
                >
                    <ChevronLeft className="h-4 w-4" />
                </Link>
                <nav className="flex items-center space-x-1">
                    {pageLinks.map(link => (
                        <Link
                            key={link.label}
                            href={link.url || '#'} 
                            className={`${getButtonClasses(link.active ? 'default' : 'outline', 'sm', !link.url)} w-10`}
                            aria-disabled={!link.url}
                            tabIndex={!link.url ? -1 : undefined}
                            preserveScroll
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <Link 
                    href={nextLink.url || '#'} 
                    className={getButtonClasses('outline', 'icon', !nextLink.url)}
                    aria-disabled={!nextLink.url}
                    tabIndex={!nextLink.url ? -1 : undefined}
                    preserveScroll
                >
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
};

// --- Main Component ---

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'All Accounts', href: '/accounts' },
];

export default function AccountIndex() {
    // We expect the controller to pass 'accounts' and 'search'
    const pageProps = usePage<SharedData & AccountIndexProps>().props;
    
    // FIXED: Ensure the default value matches the Paginator interface structure
    const emptyPaginator: Paginator = { total: 0, data: [], links: [], from: null, to: null };
    const { accounts = emptyPaginator, search, auth } = pageProps; 

    const [searchQuery, setSearchQuery] = useState(search || '');
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    
    const isAdmin = auth.user.roles.some(role => role.name === 'admin');
    const Layout = isAdmin ? AdminLayout : CashierLayout;

    // Debounce search input
    useEffect(() => {
        if (timer) clearTimeout(timer);
        
        const newTimer = setTimeout(() => {
            // Use Inertia.get to apply search filter
            router.get('/accounts', { search: searchQuery }, { 
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 300);
        
        setTimer(newTimer);
        return () => { if (timer) clearTimeout(timer); };
    }, [searchQuery]);


    return (
        <Layout breadcrumbs={breadcrumbs}>
            <Head title="All Accounts List" />
            
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                
                {/* Header and Actions */}
                <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">All Bank Accounts</h1>
                        <p className="text-sm text-muted-foreground">Comprehensive list of all active and inactive customer accounts.</p>
                    </div>
                    <Link href="/customers/create" className={getButtonClasses('default', 'default')}>
                        <User className="mr-2 h-4 w-4" />
                        Register New Customer
                    </Link>
                </div>
                
                {/* Search Bar */}
                <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:border dark:border-gray-700 p-4">
                    <Search className="h-5 w-5 text-gray-500 mr-3" />
                    <input
                        type="text"
                        placeholder="Search by Account No, Customer Name, or Email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 border-none focus:ring-0 p-0 text-lg bg-transparent dark:text-white"
                    />
                </div>

                {/* Accounts Data Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700">
                    
                    {/* Table Header */}
                    <div className="p-6">
                        {/* Accessing accounts.total is now safe */}
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Accounts ({accounts.total})</h2>
                        <hr className="mt-2 border-t border-gray-200 dark:border-gray-700" /> 
                    </div>
                    
                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">Account No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">Balance</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">Opened</th>
                                </tr>
                            </thead>
                            
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {/* accounts.data is safely accessed */}
                                {accounts.data.map(account => {
                                    const balanceColor = account.balance < 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400';
                                    const statusClass = account.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
                                    
                                    return (
                                        <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                <Link href={`/customers/${account.customer_id}`}>
                                                    #{account.id}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{account.customer.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{account.customer.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{account.account_type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClass}`}>
                                                    {account.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-base" style={{ color: balanceColor }}>
                                                {formatCurrency(account.balance)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs text-muted-foreground">
                                                {new Date(account.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                                
                                {accounts.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                                            No accounts found matching the criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* --- Pagination Footer --- */}
                    <div className="border-t">
                        {/* Safely check accounts before rendering pagination */}
                        {accounts && accounts.total > 0 && accounts.links && (
                            <Pagination 
                                links={accounts.links} 
                                total={accounts.total} 
                                from={accounts.from} 
                                to={accounts.to} 
                            />
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}