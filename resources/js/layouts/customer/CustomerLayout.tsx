import AppLayout from '@/layouts/app-layout';
import { type SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import React, { type PropsWithChildren } from 'react';

interface CustomerLayoutProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

export default function CustomerLayout({ children, breadcrumbs }: CustomerLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    
    // Check if the user is *not* an employee (e.g., they are a basic customer)
    // We assume a customer user might be someone without an employee role.
    const isEmployee = auth.user.roles.length > 0;
    
    // Safety check: if an employee somehow lands here, they should use the Admin/Cashier layout
    if (isEmployee) {
        return <div className="p-8 text-red-600">Access Error: Employees should use the standard Dashboard.</div>;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer Portal" />
            <div className="customer-portal-wrapper p-6 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-100px)]">
                <header className="mb-8 border-b pb-4 dark:border-gray-700">
                    <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Welcome, {auth.user.name}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your secure banking dashboard.</p>
                </header>
                {children}
            </div>
        </AppLayout>
    );
}