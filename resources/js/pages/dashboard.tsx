import AppLayout from '@/layouts/app-layout';
import CustomerLayout from '@/layouts/customer/CustomerLayout'; // NEW IMPORT
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react'; // ADDED Link
import React from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { User, DollarSign, Clock, FileText, Landmark, Users, CreditCard, AlertTriangle, Briefcase, TrendingUp, BarChart, ArrowRight, ArrowDown, ArrowUp, Wallet } from 'lucide-react';

// --- Type Definitions ---
interface DashboardMetrics {
    // ... Employee Metrics (as before) ...
    total_employees?: number;
    total_customers?: number;
    pending_kyc?: number;
    total_loans?: number;
    pending_loans?: number;
    total_deposits?: number;
    total_assets?: number;
    daily_deposits?: number;
    daily_withdrawals?: number;
    active_accounts?: number;
    total_transfers?: number;
    pending_applications?: number;
    approved_loans_value?: number;
    total_emis_due?: number;
    total_loan_customers?: number;

    // --- Customer Metrics (NEW) ---
    total_balance?: number;
    account_count?: number;
    recent_transactions?: { id: number; type: string; amount: number; created_at: string; }[];
}

interface CustomerData {
    id: number;
    name: string;
    email: string;
    // minimal customer data
}

interface DashboardProps {
    roleType: 'admin' | 'cashier' | 'loan_officer' | 'customer' | 'unregistered_user' | 'general';
    metrics: DashboardMetrics;
    customer: CustomerData | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

// Formatting currency
const formatCurrency = (amount: number, precision: number = 2) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
    }).format(amount);
};

// --- Metric Card Component (Reusable) ---
interface MetricCardProps {
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    unit?: string;
}
const getButtonClasses = (variant: 'default' | 'outline' | 'ghost' | 'icon', size: 'sm' | 'icon' | 'default') => {
    let base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    if (size === 'sm') base += ' h-8 px-3';
    else if (size === 'icon') base += ' h-8 w-8';
    else base += ' h-9 px-4 py-2';

    if (variant === 'default') base += ' bg-primary text-primary-foreground hover:bg-primary/90 shadow';
    else if (variant === 'outline') base += ' border border-input bg-background hover:bg-accent hover:text-accent-foreground';
    else if (variant === 'ghost') base += ' hover:bg-accent hover:text-accent-foreground';
    
    return base;
};
const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, color, unit }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition duration-300">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <p className="mt-1 text-3xl font-extrabold text-gray-900 dark:text-white">
            {value} {unit}
        </p>
    </div>
);


// --- Dashboard Views (Employee Views Omitted for brevity, but exist) ---
const AdminDashboardView: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Executive Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Total Bank Assets" value={formatCurrency(metrics.total_assets || 0, 0)} icon={Landmark} color="text-green-600" />
            <MetricCard title="Total Customers" value={metrics.total_customers || 0} icon={User} color="text-indigo-600" />
            <MetricCard title="Pending KYC" value={metrics.pending_kyc || 0} icon={AlertTriangle} color="text-yellow-600" />
            <MetricCard title="Total Employees" value={metrics.total_employees || 0} icon={Briefcase} color="text-gray-600" />
        </div>
        <ReportsPlaceholder title="System-wide Financial Overview" />
    </div>
);

const CashierDashboardView: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Daily Teller Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard title="Today's Deposits" value={formatCurrency(metrics.daily_deposits || 0)} icon={ArrowDown} color="text-green-600" />
            <MetricCard title="Today's Withdrawals" value={formatCurrency(metrics.daily_withdrawals || 0)} icon={ArrowUp} color="text-red-600" />
            <MetricCard title="Pending Customer KYC" value={metrics.pending_kyc || 0} icon={AlertTriangle} color="text-yellow-600" />
        </div>
        <ReportsPlaceholder title="Quick Customer Lookup (Link)" />
    </div>
);

const LoanOfficerDashboardView: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Loan Portfolio & Risk</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Pending Loan Applications" value={metrics.pending_applications || 0} icon={FileText} color="text-orange-600" />
            <MetricCard title="Total EMIs Overdue" value={metrics.total_emis_due || 0} icon={Clock} color="text-red-600" />
            <MetricCard title="Approved Loans Value" value={formatCurrency(metrics.approved_loans_value || 0, 0)} icon={DollarSign} color="text-green-600" />
            <MetricCard title="Loan Customers" value={metrics.total_loan_customers || 0} icon={User} color="text-indigo-600" />
        </div>
        <ReportsPlaceholder title="Loan Application Status Tracker" />
    </div>
);

const ReportsPlaceholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart className="h-5 w-5 text-indigo-500" /> {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Detailed reports and graphs will be displayed here.</p>
        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
    </div>
);


// --- NEW: Customer Dashboard View ---
const CustomerDashboardView: React.FC<DashboardProps> = ({ metrics, customer }) => {
    
    const recentTx = metrics.recent_transactions || [];
    
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Account Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Total Balance */}
                <div className="bg-indigo-600 p-6 rounded-xl shadow-xl text-white md:col-span-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Total Current Holdings</p>
                        <Wallet className="h-6 w-6" />
                    </div>
                    <p className="mt-1 text-5xl font-extrabold">
                        {formatCurrency(metrics.total_balance || 0, 2)}
                    </p>
                    <p className="text-sm opacity-80 mt-2">Across {metrics.account_count || 0} active accounts.</p>
                </div>

                {/* Loan Application CTA */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="h-5 w-5 text-red-500" /> Financing
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {metrics.pending_loans ? `You have ${metrics.pending_loans} loan application(s) pending review.` : "Need funds for a project?"}
                    </p>
                    <Link href="/loans/apply" className={`${getButtonClasses('default', 'sm')} w-full bg-red-600 hover:bg-red-700`}>
                        Apply for a New Loan
                    </Link>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Recent Transactions */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2">Recent Activity</h3>
                    
                    {recentTx.length > 0 ? (
                        <ul className="space-y-3">
                            {recentTx.map(tx => (
                                <li key={tx.id} className="flex justify-between items-center text-sm">
                                    <span className="font-medium capitalize text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        {tx.type.includes('Deposit') ? <ArrowDown className='h-4 w-4 text-green-600'/> : <ArrowUp className='h-4 w-4 text-red-600'/>}
                                        {tx.type}
                                    </span>
                                    <span className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(tx.amount)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-sm">No recent transactions recorded.</p>
                    )}
                </div>

                {/* EMI Payment Link */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700 space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2">Pay EMI</h3>
                    <p className="text-muted-foreground text-sm">
                        Quickly check your scheduled payments and process your next Equated Monthly Installment.
                    </p>
                    <Link 
                        href="/loans/emis/pay" 
                        className={`${getButtonClasses('outline', 'default')} w-full text-indigo-600 dark:text-indigo-400`}
                    >
                        <DollarSign className="h-4 w-4 mr-2" /> View & Pay Scheduled EMIs
                    </Link>
                    
                    <div className='pt-4'>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function Dashboard() {
    const pageProps = usePage<SharedData & DashboardProps>().props;
    const { roleType, metrics, customer } = pageProps;

    let DashboardComponent;
    let title = 'General Dashboard';
    let greeting = `Welcome back, ${pageProps.auth.user.name}.`;
    let Layout = AppLayout; // Default to AppLayout for employees

    if (roleType === 'admin') {
        DashboardComponent = AdminDashboardView;
        title = 'System Administrator Dashboard';
    } else if (roleType === 'cashier') {
        DashboardComponent = CashierDashboardView;
        title = 'Cashier Operations Dashboard';
    } else if (roleType === 'loan_officer') {
        DashboardComponent = LoanOfficerDashboardView;
        title = 'Loan Officer Dashboard';
    } else if (roleType === 'customer' && customer) {
        DashboardComponent = CustomerDashboardView;
        Layout = CustomerLayout; // Use the dedicated Customer Layout
        title = 'Customer Portal';
        greeting = `Hello, ${customer.name}. Your banking is secure.`;
    } else {
        DashboardComponent = () => <p className="p-8 text-center text-muted-foreground">Access is restricted. Please contact your administrator if you believe this is an error.</p>;
        title = 'Access Restricted';
    }

    return (
        <Layout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="p-6 space-y-6">
                <header className="border-b pb-4 dark:border-gray-700">
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="text-sm text-muted-foreground mt-1">{greeting}</p>
                </header>

                {/* Main Content */}
                {DashboardComponent && (
                    <DashboardComponent metrics={metrics} roleType={roleType} customer={customer} />
                )}
            </div>
        </Layout>
    );
}