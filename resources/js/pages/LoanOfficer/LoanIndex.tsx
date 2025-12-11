import LoanOfficerLayout from '@/layouts/loanOfficer/layout';
import AdminLayout from '@/layouts/admin/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { FileText, Search, User, Check, X, Clock, Loader2, DollarSign, ArrowRight } from 'lucide-react';

// --- Type Definitions ---
interface CustomerData { id: number; name: string; email: string; }

interface LoanRecord {
    id: number;
    amount: number;
    interest_rate: number;
    term_months: number;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
    customer_id: number;
    customer: CustomerData;
    created_at: string;
}

interface Paginator {
    data: LoanRecord[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    from: number | null;
    to: number | null;
}

interface LoanIndexProps {
    loans: Paginator;
    status: string;
    loanStatuses: string[];
    search: string;
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

// Formatting currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Loan Applications', href: '/loans' },
];

const StatusBadge: React.FC<{ status: LoanRecord['status'] }> = ({ status }) => {
    let color = 'bg-gray-100 text-gray-800';
    if (status === 'Approved') color = 'bg-green-100 text-green-800';
    else if (status === 'Pending') color = 'bg-yellow-100 text-yellow-800';
    else if (status === 'Rejected') color = 'bg-red-100 text-red-800';
    else if (status === 'Paid') color = 'bg-blue-100 text-blue-800';

    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${color} dark:bg-opacity-50`}>{status}</span>;
};

// --- Action Handler ---
const handleLoanAction = (loanId: number, action: 'approve' | 'reject') => {
    const confirmMessage = action === 'approve'
        ? `Are you sure you want to APPROVE Loan #${loanId}? This will generate the EMI schedule.`
        : `Are you sure you want to REJECT Loan #${loanId}?`;

    if (confirm(confirmMessage)) {
        router.post(`/loans/approve/${loanId}`, { action: action }, {
            preserveScroll: true,
            preserveState: true,
        });
    }
};

export default function LoanIndex() {
    const pageProps = usePage<SharedData & LoanIndexProps>().props;
    const { loans, status: currentStatus, loanStatuses, search, flash, auth } = pageProps;

    const [searchQuery, setSearchQuery] = useState(search || '');
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    
    const isAdmin = auth.user.roles.some(role => role.name === 'admin');
    const Layout = isAdmin ? AdminLayout : LoanOfficerLayout;

    // Debounce search input
    useEffect(() => {
        if (timer) clearTimeout(timer);
        
        const newTimer = setTimeout(() => {
            router.get('/loans', { status: currentStatus, search: searchQuery }, { 
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 300);
        
        setTimer(newTimer);
        return () => { if (timer) clearTimeout(timer); };
    }, [searchQuery, currentStatus]);

    const loansData = loans?.data || [];
    const totalLoans = loans?.total || 0;

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <Head title="Loan Applications" />
            
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Loan Applications & Review</h1>
                        <p className="text-sm text-muted-foreground">Manage loan lifecycle: approval, rejection, and status tracking.</p>
                    </div>
                    {/* Link to EMI Tracking Page */}
                    <Link href="/loans/emis" className={getButtonClasses('outline', 'default')}>
                        <Clock className="mr-2 h-4 w-4" />
                        Go to EMI Tracking
                    </Link>
                </div>
                
                {/* Status Messages (Flash) */}
                {(flash?.success || flash?.error) && (
                    <div className={`p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${
                        flash.success ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                    }`}>
                        {flash.success ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                        {flash.success || flash.error}
                    </div>
                )}
                
                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm dark:border dark:border-gray-700">
                    <div className="flex-1 flex items-center gap-3">
                        <Search className="h-5 w-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by Customer Name, Email or Loan ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 border-none focus:ring-0 p-0 text-lg bg-transparent dark:text-white"
                        />
                    </div>
                    
                    {/* Status Filter Dropdown */}
                    <select
                        value={currentStatus}
                        onChange={(e) => router.get('/loans', { status: e.target.value, search: searchQuery }, { preserveState: true, preserveScroll: true })}
                        className="w-full md:w-48 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 text-sm transition duration-150"
                    >
                        {loanStatuses.map(s => (
                            <option key={s} value={s}>{s} Loans</option>
                        ))}
                    </select>
                </div>

                {/* Loan Applications Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700">
                    
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentStatus} Applications ({totalLoans})</h2>
                        <hr className="mt-2 border-t border-gray-200 dark:border-gray-700" /> 
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">Terms/Rate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">Actions</th>
                                </tr>
                            </thead>
                            
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {loansData.map(loan => (
                                    <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#{loan.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">{loan.customer.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{loan.customer.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-base text-red-600 dark:text-red-400">{formatCurrency(loan.amount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {loan.term_months} mos @ {loan.interest_rate}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={loan.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {loan.status === 'Pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleLoanAction(loan.id, 'approve')}
                                                        className={getButtonClasses('default', 'sm')}
                                                    >
                                                        <Check className="h-4 w-4 mr-1" /> Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleLoanAction(loan.id, 'reject')}
                                                        className={`${getButtonClasses('outline', 'sm')} border-red-500 text-red-500 hover:bg-red-50`}
                                                    >
                                                        <X className="h-4 w-4 mr-1" /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <Link href={`/loans/emis?search=${loan.id}`} className={getButtonClasses('outline', 'sm')}>
                                                    <ArrowRight className="h-4 w-4 mr-1" /> View EMIs
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {totalLoans === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                                            No loan applications found for the selected status.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* --- Pagination Footer --- */}
                    <div className="border-t">
                        {loans && loans.total > 0 && (
                            <Pagination links={loans.links} total={loans.total} from={loans.from} to={loans.to} />
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

// Pagination Component (Minimal Implementation)
interface PaginationProps {
    links: Paginator['links'];
    total: number;
    from: number | null;
    to: number | null;
}

const Pagination: React.FC<PaginationProps> = ({ links, total, from, to }) => {
    const pageLinks = links.slice(1, -1);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4">
            <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
                Showing {from} to {to} of {total} results
            </p>
            <div className="flex items-center space-x-2">
                {links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url || '#'} 
                        className={`${getButtonClasses(link.active ? 'default' : 'outline', 'sm', !link.url)} h-8 px-3 text-xs`}
                        aria-disabled={!link.url}
                        tabIndex={!link.url ? -1 : undefined}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        preserveScroll
                    />
                ))}
            </div>
        </div>
    );
};