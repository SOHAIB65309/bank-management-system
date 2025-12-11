import { InertiaLinkProps } from '@inertiajs/react';
    import { LucideIcon } from 'lucide-react';

    export interface Auth {
        user: User;
    }

    export interface Role {
        id: number;
        name: 'admin' | 'cashier' | 'loan_officer'; // Define literal types for roles
    }

    export interface BreadcrumbItem {
        title: string;
        href: string;
    }

    export interface NavGroup {
        title: string;
        items: NavItem[];
    }

    export interface NavItem {
        title: string;
        href: NonNullable<InertiaLinkProps['href']>;
        icon?: LucideIcon | string; // Allow string for custom icons or placeholders
        roles: ('admin' | 'cashier' | 'loan_officer')[] ; // Correct array of literal strings
        isActive?: boolean;
    }

    export interface SharedData {
        name: string;
        quote: { message: string; author: string };
        auth: Auth;
        sidebarOpen: boolean;
        [key: string]: unknown;
    }

    export interface User {
        id: number;
        name: string;
        email: string;
        avatar?: string;
        email_verified_at: string | null;
        roles: Role[]; 
        two_factor_enabled?: boolean;
        created_at: string;
        updated_at: string;
        [key: string]: unknown; // This allows for additional properties...
    }