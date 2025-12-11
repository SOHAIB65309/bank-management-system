import LoanOfficerLayout from '@/layouts/loanOfficer/layout';
import AdminLayout from '@/layouts/admin/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { Search, Clock, User, DollarSign, Check, X, Loader2, Calendar } from 'lucide-react';
import { Pagination, PaginationProps } from '../Admin/EmployeeIndex';

// --- Type Definitions ---
interface CustomerData { id: number; name: string; }
interface LoanData { id: number; amount: number; interest_rate: number; customer: CustomerData; }

interface EmiRecord {
    id: number;
    loan_id: number;
    due_date: string;
    amount_due: number;
    payment_status: 'Pending' | 'Paid' | 'Late';
    loan: LoanData;
}

interface Paginator {
    data: EmiRecord[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    from: number | null;
    to: number | null;
}

interface EmiIndexProps {
    emis: Paginator;
    status: string;
    emiStatuses: string[];
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
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'EMI Tracking', href: '/loans/emis' },
];

const StatusBadge: React.FC<{ status: EmiRecord['payment_status'] }> = ({ status }) => {
    let color = 'bg-gray-100 text-gray-800';
    if (status === 'Paid') color = 'bg-green-100 text-green-800';
    else if (status === 'Pending') color = 'bg-yellow-100 text-yellow-800';
    else if (status === 'Late') color = 'bg-red-100 text-red-800';

    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${color} dark:bg-opacity-50`}>{status}</span>;
};

// --- Action Handler ---
const handleEmiPayment = (emi: EmiRecord) => {
    if (emi.payment_status === 'Paid') return;
    
    const confirmMessage = `Confirm payment of ${formatCurrency(emi.amount_due)} for EMI #${emi.id} (Loan #${emi.loan_id})?`;

    if (confirm(confirmMessage)) {
        // The payment route uses PUT/PATCH but Laravel standardizes to POST/PUT/DELETE
        router.post(`/loans/emis/${emi.id}/pay`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    }
};

export default function EmiIndex() {
    const pageProps = usePage<SharedData & EmiIndexProps>().props;
    const { emis, status: currentStatus, emiStatuses, search, flash, auth } = pageProps;

    const [searchQuery, setSearchQuery] = useState(search || '');
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    
    const isAdmin = auth.user.roles.some(role => role.name === 'admin');
    const Layout = isAdmin ? AdminLayout : LoanOfficerLayout;

    // Debounce search input
    useEffect(() => {
        if (timer) clearTimeout(timer);
        
        const newTimer = setTimeout(() => {
            router.get('/loans/emis', { status: currentStatus, search: searchQuery }, { 
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 300);
        
        setTimer(newTimer);
        return () => { if (timer) clearTimeout(timer); };
    }, [searchQuery, currentStatus]);

    const emisData = emis?.data || [];
    const totalEmis = emis?.total || 0;

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <Head title="EMI Tracking" />
            
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">EMI Payment Tracking</h1>
                        <p className="text-sm text-muted-foreground">Monitor scheduled payments and process incoming EMI collections.</p>
                    </div>
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
                            placeholder="Search by Customer Name or Loan ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 border-none focus:ring-0 p-0 text-lg bg-transparent dark:text-white"
                        />
                    </div>
                    
                    {/* Status Filter Dropdown */}
                    <select
                        value={currentStatus}
                        onChange={(e) => router.get('/loans/emis', { status: e.target.value, search: searchQuery }, { preserveState: true, preserveScroll: true })}
                        className="w-full md:w-48 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 text-sm transition duration-150"
                    >
                        {emiStatuses.map(s => (
                            <option key={s} value={s}>{s} EMIs</option>
                        ))}
                    </select>
                </div>

                {/* EMI Schedule Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700">
                    
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentStatus} EMIs Due ({totalEmis})</h2>
                        <hr className="mt-2 border-t border-gray-200 dark:border-gray-700" /> 
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">EMI ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer / Loan ID</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">Amount Due</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px] flex items-center gap-1"><Calendar className='h-3 w-3' /> Due Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">Payment</th>
                                </tr>
                            </thead>
                            
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {emisData.map(emi => {
                                    const isDueOrLate = emi.payment_status === 'Pending' || emi.payment_status === 'Late';
                                    const rowClass = emi.payment_status === 'Late' ? 'bg-red-50 dark:bg-red-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700';

                                    return (
                                        <tr key={emi.id} className={`${rowClass} transition duration-150`}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#{emi.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{emi.loan.customer.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Loan ID: #{emi.loan_id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-base text-red-600 dark:text-red-400">
                                                {formatCurrency(emi.amount_due)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {new Date(emi.due_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={emi.payment_status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {isDueOrLate ? (
                                                    <button 
                                                        onClick={() => handleEmiPayment(emi)}
                                                        className={getButtonClasses('default', 'sm')}
                                                    >
                                                        <DollarSign className="h-4 w-4 mr-1" /> Pay Now
                                                    </button>
                                                ) : (
                                                    <span className="text-sm text-green-600 dark:text-green-400 flex justify-end items-center gap-1">
                                                        <Check className='h-4 w-4'/> Paid
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {totalEmis === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                                            No EMIs found for the selected status.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* --- Pagination Footer --- */}
                    <div className="border-t">
                        {emis && emis.total > 0 && (
                            <Pagination links={emis.links} total={emis.total} from={emis.from} to={emis.to} />
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

// Pagination Component (Reused from LoanIndex for brevity)
// NOTE: Must be defined in the component if not available globally.
const PaginationLoan: React.FC<PaginationProps> = ({ links, total, from, to }) => {
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