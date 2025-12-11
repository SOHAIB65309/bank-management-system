// resources/js/layouts/cashier/layout.tsx

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import React, { type PropsWithChildren } from 'react';

interface CashierLayoutProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

export default function CashierLayout({ children, breadcrumbs }: CashierLayoutProps) {
    // Note: Role check is primarily done via Laravel Middleware, but can be replicated here.
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="cashier-content-wrapper">
                {children}
            </div>
        </AppLayout>
    );
}