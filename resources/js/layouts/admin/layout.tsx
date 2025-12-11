// resources/js/layouts/admin/layout.tsx

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import React, { type PropsWithChildren } from 'react';

interface AdminLayoutProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

// This layout can enforce admin-specific UI elements or checks if needed
export default function AdminLayout({ children, breadcrumbs }: AdminLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user.roles.some(role => role.name === 'admin');

    if (!isAdmin) {
        return <div className="p-8 text-red-600">ERROR: Unauthorized Access to Admin Area.</div>;
    }

    // Wrap the content in the standard App Layout
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="admin-content-wrapper">
                {children}
            </div>
        </AppLayout>
    );
}