import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
// Import corrected types including Role
import { type NavItem, type SharedData, type Role } from '@/types'; 
import { Link, usePage } from '@inertiajs/react';
// Import Clock icon, which was missing/incorrectly used before
import { Banknote, BookOpen, Folder, LayoutGrid, User, Users, Landmark, FileText, Settings, Key, Clock } from 'lucide-react'; 
import AppLogo from './app-logo';
import React, { useMemo } from 'react';

// Define the role checks using TypeScript (accessing the Role[] array correctly)
const useUserRoles = () => {
    const { auth } = usePage<SharedData>().props;
    // Explicitly cast to Role[] as defined in resources/js/types/index.d.ts
    const roles: Role[] = auth.user.roles || []; 
    
    return {
        // The .some() method now works correctly on the Role[] array
        isAdmin: roles.some(role => role.name === 'admin'),
        isCashier: roles.some(role => role.name === 'cashier'),
        isLoanOfficer: roles.some(role => role.name === 'loan_officer'),
    };
};

// Define all potential navigation items
const allNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid, roles: ['admin', 'cashier', 'loan_officer'] },
    
    // --- Admin Management ---
    { title: 'Employee Mgmt', href: '/admin/employees', icon: Users, roles: ['admin'] },
    { title: 'Access Control', href: '/admin/roles', icon: Key, roles: ['admin'] },

    // --- Customer Management ---
    { title: 'Customer Records', href: '/customers', icon: User, roles: ['admin', 'cashier'] },
    
    // --- Account & Transaction Management ---
    { title: 'Accounts & Balance', href: '/accounts', icon: Landmark, roles: ['admin', 'cashier'] },
    { title: 'Transactions', href: '/transactions', icon: Banknote, roles: ['admin', 'cashier'] },

    // --- Loan Management ---
    { title: 'Loan Applications', href: '/loans/applications', icon: FileText, roles: ['admin', 'loan_officer'] },
    // FIXED: Using the imported Clock component instead of the string 'Clock'
    { title: 'EMI Tracking', href: '/loans/emis', icon: Clock, roles: ['admin', 'loan_officer'] }, 
];

// FIXED: Added the required 'roles' property to align with NavItem interface
const footerNavItems: NavItem[] = [
    { title: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'cashier', 'loan_officer'] },
    { title: 'Repository', href: 'https://github.com/laravel/react-starter-kit', icon: Folder, roles: ['admin', 'cashier', 'loan_officer'] },
    { title: 'Documentation', href: 'https://laravel.com/docs/starter-kits#react', icon: BookOpen, roles: ['admin', 'cashier', 'loan_officer'] },
];

export function AppSidebar() {
    const { isAdmin, isCashier, isLoanOfficer } = useUserRoles();

    // Filter navigation items based on user's roles
    const mainNavItems = useMemo(() => {
        return allNavItems.filter(item => {
            // If roles property is missing or empty, assume public/default access
            if (!item.roles || item.roles.length === 0) return true; 
            
            // Check if the user possesses any of the required roles for this item
            return item.roles.some(role => {
                if (role === 'admin' && isAdmin) return true;
                if (role === 'cashier' && isCashier) return true;
                if (role === 'loan_officer' && isLoanOfficer) return true;
                return false;
            });
        });
    }, [isAdmin, isCashier, isLoanOfficer]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                {/* Placeholder for your App Logo component */}
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Use the dynamically filtered navigation items */}
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}