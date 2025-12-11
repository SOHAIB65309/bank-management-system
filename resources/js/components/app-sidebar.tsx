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
import { Banknote, BookOpen, Folder, LayoutGrid, User, Users, Landmark, FileText, Settings, Key, Clock, ArrowRight, DollarSign } from 'lucide-react'; // Added ArrowRight, DollarSign for customer links
import AppLogo from './app-logo';
import React, { useMemo } from 'react';

// Define the role checks using TypeScript (accessing the Role[] array correctly)
const useUserRoles = () => {
    const { auth } = usePage<SharedData>().props;
    // Explicitly cast to Role[] as defined in resources/js/types/index.d.ts
    const roles: Role[] = auth.user.roles || []; 
    
    const isAdmin = roles.some(role => role.name === 'admin');
    const isCashier = roles.some(role => role.name === 'cashier');
    const isLoanOfficer = roles.some(role => role.name === 'loan_officer');

    return {
        isAdmin,
        isCashier,
        isLoanOfficer,
        // NEW: Check if the user is a Customer (no employee roles assigned)
        isCustomer: !isAdmin && !isCashier && !isLoanOfficer && roles.length === 0,
        isEmployee: isAdmin || isCashier || isLoanOfficer,
    };
};

// Define Employee Navigation Items
const employeeNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid, roles: ['admin', 'cashier', 'loan_officer'] },
    
    // --- Admin Management ---
    { title: 'Employee Mgmt', href: '/admin/employees', icon: Users, roles: ['admin'] },
    { title: 'Access Control', href: '/admin/roles', icon: Key, roles: ['admin'] },

    // --- Customer Management ---
    { title: 'Customer Records', href: '/customers', icon: User, roles: ['admin', 'cashier'] },
    
    // --- Account & Transaction Management ---
    { title: 'Accounts & Balance', href: '/accounts', icon: Landmark, roles: ['admin', 'cashier'] },
    { title: 'Teller Transactions', href: '/transactions', icon: Banknote, roles: ['admin', 'cashier'] },

    // --- Loan Management ---
    { title: 'Loan Applications', href: '/loans/applications', icon: FileText, roles: ['admin', 'loan_officer'] },
    { title: 'EMI Tracking', href: '/loans/emis', icon: Clock, roles: ['admin', 'loan_officer'] }, 
];

// Define Customer Navigation Items (Minimal and Self-Service)
const customerNavItems: NavItem[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid, roles: ['customer'] },
    { title: 'Fund Transfer', href: '/customer/transfer', icon: ArrowRight, roles: ['customer'] }, // NEW ROUTE
    { title: 'Loan Application', href: '/customer/loans/apply', icon: FileText, roles: ['customer'] }, 
    { title: 'EMI Payments', href: '/customer/emis', icon: DollarSign, roles: ['customer'] }, // NEW ROUTE
];


// FIXED: Added the required 'roles' property to align with NavItem interface
const footerNavItems: NavItem[] = [
    { title: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'cashier', 'loan_officer', 'customer'] },
    { title: 'Documentation', href: 'https://laravel.com/docs/starter-kits#react', icon: BookOpen, roles: ['admin', 'cashier', 'loan_officer', 'customer'] },
];

export function AppSidebar() {
    const { isAdmin, isCashier, isLoanOfficer, isCustomer, isEmployee } = useUserRoles();

    // Determine the navigation set and filter them
    const activeNavSet = isCustomer ? customerNavItems : employeeNavItems;

    const mainNavItems = useMemo(() => {
        if (isCustomer) {
            // Customers see all links defined in customerNavItems
            return customerNavItems;
        }

        // Employees see filtered links based on their roles
        return employeeNavItems.filter(item => {
            if (!item.roles || item.roles.length === 0) return true; 
            
            return item.roles.some(role => {
                if (role === 'admin' && isAdmin) return true;
                if (role === 'cashier' && isCashier) return true;
                if (role === 'loan_officer' && isLoanOfficer) return true;
                return false;
            });
        });
    }, [isCustomer, isAdmin, isCashier, isLoanOfficer]);

    // Determine if the sidebar should be hidden (for general customers)
    if (isCustomer) {
        // If the user is a customer, we don't display the full sidebar in the AppLayout 
        // because we are relying on CustomerLayout to provide a minimal interface.
        // We render a minimal, uncollapsible sidebar only for display consistency.
    }


    return (
        <Sidebar collapsible={isEmployee ? "icon" : false} variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
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