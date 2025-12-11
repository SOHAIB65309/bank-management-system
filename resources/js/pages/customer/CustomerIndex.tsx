import CashierLayout from '@/layouts/cashier/layout';
import AdminLayout from '@/layouts/admin/layout'; // Also import AdminLayout for full role flexibility
import { type BreadcrumbItem, type SharedData, type User, type Role } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Banknote, UserCheck, UserX, Wallet, ChevronLeft, ChevronRight, Eye, Pencil } from 'lucide-react';

// --- Type Definitions ---

// Define Customer type including the calculated total_balance and relationship to Accounts
interface Account {
    id: number;
    account_type: 'Savings' | 'Current' | 'Fixed Deposit';
    balance: number;
    status: string;
}

interface CustomerRecord {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    kyc_status: 'Pending' | 'Verified' | 'Rejected';
    total_balance: number; // Calculated field from Controller
    accounts: Account[]; // Eager loaded relationship
    created_at: string;
}

interface CustomerIndexProps {
    customers: {
        data: CustomerRecord[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
        from: number | null;
        to: number | null;
        current_page: number;
    };
    search: string;
}

// Helper function to simulate button classes (reused from Admin module)
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
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Customer & Accounts', href: '/customers' },
];


// --- Pagination Component (Reused Logic) ---

interface PaginationProps {
    links: CustomerIndexProps['customers']['links'];
    total: number;
    from: number | null;
    to: number | null;
    currentPage: number;
}

const Pagination: React.FC<PaginationProps> = ({ links, total, from, to }) => {
    const pageLinks = links.slice(1, -1);
    const prevLink = links[0];
    const nextLink = links[links.length - 1];

    if (total === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 rounded-b-xl border-t border-gray-100 dark:border-gray-700">
            {/* Summary */}
            <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
                Showing {from} to {to} of {total} customers
            </p>

            {/* Pagination Links */}
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
                
                {/* Page Numbers */}
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

export default function CustomerIndex() {
    const pageProps = usePage<SharedData & CustomerIndexProps>().props;
    const { customers, search, auth } = pageProps;

    const [searchQuery, setSearchQuery] = useState(search || '');
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    
    // Determine which layout to use based on the user's role (optional, but good practice)
    const isAdmin = auth.user.roles.some(role => role.name === 'admin');
    const Layout = isAdmin ? AdminLayout : CashierLayout;

    // Debounce search input
    useEffect(() => {
        if (timer) clearTimeout(timer);
        
        const newTimer = setTimeout(() => {
            router.get('/customers', { search: searchQuery }, { 
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 300);
        
        setTimer(newTimer);
        return () => { if (timer) clearTimeout(timer); };
    }, [searchQuery]);
    
    // Formatting currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };


    return (
        <Layout breadcrumbs={breadcrumbs}>
            <Head title="Customer & Accounts" />
            
            <div className="p-6 space-y-6">
                
                {/* Header and Actions */}
                <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Customer Records & Balances</h1>
                        <p className="text-sm text-muted-foreground">Search and manage all customer profiles and linked financial accounts.</p>
                    </div>
                    {/* Customer Registration CTA */}
                    <Link href="/customers/create" className={getButtonClasses('default', 'default')}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Register New Customer
                    </Link>
                </div>
                
                {/* Search Bar */}
                <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:border dark:border-gray-700 p-4">
                    <Search className="h-5 w-5 text-gray-500 mr-3" />
                    <input
                        type="text"
                        placeholder="Search by Name, Email, or Phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 border-none focus:ring-0 p-0 text-lg bg-transparent dark:text-white"
                    />
                </div>

                {/* Customer Data Table Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700">
                    
                    {/* Table Header */}
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Customers ({customers.total})</h2>
                        <hr className="mt-2 border-t border-gray-200 dark:border-gray-700" /> 
                    </div>
                    
                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[50px]">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name / Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center justify-end">
                                        <Wallet className="h-4 w-4 mr-1" />
                                        Total Balance
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">Actions</th>
                                </tr>
                            </thead>
                            
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {customers.data.map(customer => (
                                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted-foreground">#{customer.id}</td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{customer.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{customer.email} | {customer.phone}</div>
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span 
                                                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit ${
                                                    customer.kyc_status === 'Verified' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                                    customer.kyc_status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                }`}
                                            >
                                                {customer.kyc_status === 'Verified' ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                                                {customer.kyc_status}
                                            </span>
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-lg font-bold text-gray-800 dark:text-green-400">
                                            {formatCurrency(customer.total_balance)}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                {/* View Button */}
                                                <Link href={`/customers/${customer.id}`} className={getButtonClasses('ghost', 'icon')}>
                                                    <Eye className="h-4 w-4 text-indigo-500" />
                                                </Link>
                                                {/* Edit Button */}
                                                <Link href={`/customers/${customer.id}/edit`} className={getButtonClasses('ghost', 'icon')}>
                                                    <Pencil className="h-4 w-4 text-gray-500" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {/* Handle case where no customers are found */}
                                {customers.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                                            No customers found matching the criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* --- Pagination Footer --- */}
                    <div className="border-t">
                        {customers && customers.total > 0 && (
                            <Pagination 
                                links={customers.links} 
                                total={customers.total} 
                                from={customers.from} 
                                to={customers.to} 
                                currentPage={customers.current_page}
                            />
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}