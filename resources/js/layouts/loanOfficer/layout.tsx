// resources/js/layouts/loanOfficer/layout.tsx

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import React, { type PropsWithChildren } from 'react';

interface LoanOfficerLayoutProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

export default function LoanOfficerLayout({ children, breadcrumbs }: LoanOfficerLayoutProps) {
    // Note: Role check is primarily done via Laravel Middleware, but can be replicated here.
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="loan-officer-content-wrapper">
                {children}
            </div>
        </AppLayout>
    );
}