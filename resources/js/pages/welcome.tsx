// resources/js/Pages/Welcome.tsx

import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';

// --- Interfaces ---

interface WelcomeProps {
    canRegister?: boolean;
}

interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
    delay: string;
}

// --- Helper Components ---

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => (
    <div
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-500 transform hover:-translate-y-1 opacity-0 animate-fade-in-up border border-gray-100 dark:border-gray-700"
        style={{ animationDelay: delay }}
    >
        <div className="text-3xl text-indigo-600 dark:text-indigo-400 mb-3">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
    </div>
);


// --- Main Component ---

const Welcome: React.FC<WelcomeProps> = ({ canRegister = true }) => {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Bank Management System" />
            
            {/* Main Container - Dark mode classes are present for theme support */}
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center p-4 sm:p-8">

                {/* -------------------- HEADER / NAVIGATION -------------------- */}
                <header className="w-full max-w-7xl pt-4 pb-10 flex justify-end">
                    <nav className="flex items-center space-x-4">
                        {auth.user ? (
                            <Link href={dashboard()} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href={login()} className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                                    Employee Login
                                </Link>
                                {canRegister && (
                                    <Link href={register()} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition">
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                {/* -------------------- HERO SECTION -------------------- */}
                <main className="w-full max-w-7xl flex flex-col items-center text-center py-10 lg:py-20">
                    
                    {/* Title and Description */}
                    <div className="opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
                            Modern Banking Simplified 🚀
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
                            The **Bank Management System** automates core banking operations such as customer registration, account handling, and loan processing. Built with **Object-Oriented Analysis and Design (OOAD)** principles for reliability and scalability.
                        </p>
                    </div>

                    {/* Primary CTA */}
                    <Link
                        href={login()}
                        className="px-8 py-3 text-lg font-bold text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105 opacity-0 animate-fade-in-up"
                        style={{ animationDelay: '300ms' }}
                    >
                        Access Employee Portal
                    </Link>

                    {/* System Overview Image Placeholder */}
                    <div className="mt-16 w-full max-w-5xl opacity-0 animate-fade-in" style={{ animationDelay: '500ms' }}>
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border-2 border-indigo-100 dark:border-indigo-900">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">System Modules Overview</h2>
                            <div className="flex justify-around items-center text-gray-500 dark:text-gray-400 text-sm">
                                
                                <p>Customer Management ➡️ Account Management ➡️ Transaction Management ➡️ Loan Management ➡️ Admin Management</p>
                            </div>
                        </div>
                    </div>

                </main>
                
                {/* -------------------- FEATURES SECTION -------------------- */}
                <section className="w-full max-w-7xl py-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10 text-center">Key Features & Modular Design</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        
                        <FeatureCard
                            icon="👤"
                            title="Customer & KYC"
                            description="Handle customer registration, profile updates, and KYC verification."
                            delay="700ms"
                        />
                        <FeatureCard
                            icon="💳"
                            title="Account Lifecycle"
                            description="Create Savings/Current accounts and manage balance updates and account closure."
                            delay="800ms"
                        />
                        <FeatureCard
                            icon="💸"
                            title="Transaction Handling"
                            description="Perform quick Deposit, Withdrawal, and Fund Transfer operations with history tracking."
                            delay="900ms"
                        />
                        <FeatureCard
                            icon="📈"
                            title="Loan Processing"
                            description="Manage loan applications, approvals, and automated EMI tracking schedules."
                            delay="1000ms"
                        />
                    </div>
                </section>

                {/* -------------------- FOOTER -------------------- */}
                <footer className="w-full max-w-7xl border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} Bank Management System. All rights reserved.
                </footer>
            </div>
        </>
    );
};

export default Welcome;

// REMINDER: Ensure custom animations (animate-fade-in, animate-fade-in-up)
// are defined in your Tailwind configuration for the visual effects to work.