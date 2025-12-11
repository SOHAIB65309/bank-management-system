import AdminLayout from '@/layouts/admin/layout';
import { type BreadcrumbItem, type SharedData, type User, type Role } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import { UserPlus, Pencil, Trash2, Key, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// --- Type Definitions for Pagination ---

// Extend the User interface to include the roles relationship for display
interface Employee extends Omit<User, 'roles'> {

    roles: Role[];
}

// Define the Link object from Laravel/Inertia pagination
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// Define the full structure of the Inertia/Laravel Paginator
interface Paginator {
    data: Employee[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

// Define the expected props structure for the page
interface AdminEmployeeIndexProps {
    employees: Paginator;
}

// --- Helper Components ---

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Portal', href: '/admin' },
    { title: 'Employee Management', href: '/admin/employees' },
];
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
// Helper component for rendering role badges
const RoleBadges: React.FC<{ roles: Role[] }> = ({ roles }) => (
    <div className="flex flex-wrap gap-1">
        {roles.map(role => (
            <Badge key={role.id} variant={role.name === 'admin' ? 'default' : 'secondary'} className="capitalize">
                {role.name.replace('_', ' ')}
            </Badge>
        ))}
    </div>
);

// New Pagination Component
export interface PaginationProps {
    links: PaginationLink[];
    total: number;
    from: number | null;
    to: number | null;
}

export const Pagination: React.FC<PaginationProps> = ({ links, total, from, to }) => {
    // Exclude 'previous' and 'next' links from the main loop
    const pageLinks = links.slice(1, -1);
    const prevLink = links[0];
    const nextLink = links[links.length - 1];

    if (total === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 rounded-b-xl border-t border-gray-100 dark:border-gray-700">
            {/* Summary */}
            <p className="text-sm text-muted-foreground mb-4 sm:mb-0">
                Showing {from} to {to} of {total} results
            </p>

            {/* Pagination Links */}
            <div className="flex items-center space-x-2">
                <Button 
                    variant="outline" 
                    size="icon" 
                    disabled={!prevLink.url}
                    asChild
                >
                    <Link href={prevLink.url || '#'} preserveScroll>
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                
                {/* Page Numbers */}
                <nav className="flex items-center space-x-1">
                    {pageLinks.map(link => (
                        <Button
                            key={link.label}
                            variant={link.active ? 'default' : 'outline'}
                            size="sm"
                            asChild
                            className="w-10"
                        >
                            <Link 
                                href={link.url || '#'} 
                                disabled={!link.url}
                                className={!link.url ? 'pointer-events-none opacity-50' : ''}
                                preserveScroll
                            >
                                {link.label}
                            </Link>
                        </Button>
                    ))}
                </nav>

                <Button 
                    variant="outline" 
                    size="icon" 
                    disabled={!nextLink.url}
                    asChild
                >
                    <Link href={nextLink.url || '#'} preserveScroll>
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
};
// --- End Pagination Component ---

export default function EmployeeIndex() {
    const pageProps = usePage<SharedData & AdminEmployeeIndexProps>().props;
    const employees = pageProps.employees;
    
    const employeeData = employees?.data || [];
    const totalEmployees = employees?.total || 0;


    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee Management" />
            
            <div className="p-6 space-y-6">
                
                {/* Header and Actions */}
                <div className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Employee Records</h1>
                        <p className="text-sm text-muted-foreground">Manage all bank staff access and profiles.</p>
                    </div>
                    {/* Replaced Button with Link using Tailwind classes */}
                    <Link href="/admin/employees/create" className={getButtonClasses('default', 'default')}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        New Employee
                    </Link>
                </div>
                
                {/* Employee Data Table Card (Replaced Card with Div) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:border dark:border-gray-700">
                    
                    {/* Card Header */}
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Employees ({totalEmployees})</h2>
                        {/* Replaced Separator with hr */}
                        <hr className="mt-2 border-t border-gray-200 dark:border-gray-700" /> 
                    </div>
                    
                    {/* Card Content (Replaced CardContent with Div) */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            {/* TableHeader */}
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[50px]">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px] hidden sm:table-cell">Joined</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px] flex items-center justify-center gap-1">
                                        <Key className="h-4 w-4 text-gray-500" />
                                        Roles
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">Actions</th>
                                </tr>
                            </thead>
                            
                            {/* TableBody */}
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {employeeData.map((employee,index) => (
                                    <tr key={employee.id+index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted-foreground">#{employee.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{employee.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{employee.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground hidden sm:table-cell">
                                            {new Date(employee.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <RoleBadges roles={employee.roles} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                {/* Edit Button */}
                                                <button title="Edit" className={getButtonClasses('ghost', 'icon')}>
                                                    <Pencil className="h-4 w-4 text-indigo-500" />
                                                </button>
                                                {/* Delete Button */}
                                                <button title="Delete" className={getButtonClasses('ghost', 'icon')}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {/* Handle case where no employees are found */}
                                {employeeData.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                                            No employees found matching the criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* --- Pagination Footer --- */}
                    <div className="border-t">
                        {employees && (
                            <Pagination 
                                links={employees.links} 
                                total={employees.total} 
                                from={employees.from} 
                                to={employees.to} 
                            />
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}