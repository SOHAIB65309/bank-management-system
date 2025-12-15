// resources/js/layouts/auth/auth-simple-layout.tsx

import { Link } from '@inertiajs/react';
import React from 'react';

// Defines the structure for the Auth Layout, providing a visual theme
export default function AuthLayoutTemplate({
    children,
    title,
    description,
}: {
    children: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            
            {/* -------------------- LEFT SIDE: LOGIN FORM -------------------- */}
            <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    
                    {/* Bank Logo / Branding */}
                    <div className="mb-8 flex items-center">
                        <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                            
                            <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 18.5L4.5 16v-4l7.5 3.5 7.5-3.5v4l-7.5 4.5zM12 11L4.5 7.5 12 4l7.5 3.5-7.5 3.5z" />
                        </svg>
                        <span className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">
                            BMS Portal
                        </span>
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{title}</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {description}
                    </p>

                    {/* Status Message (if available) */}
                    {/* NOTE: status rendering should ideally be moved out of the Form block in Login.tsx */}
                    {/* We'll handle it inside the original Login component. */}
                    
                    <div className="mt-8">
                        {/* FORM CONTAINER */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700">
                            {children}
                        </div>
                    </div>
                </div>
            </div>

            {/* -------------------- RIGHT SIDE: THEME VISUAL -------------------- */}
            <div className="relative hidden lg:block">
                {/* Security/Banking themed image or animated background */}
                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/5"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center p-12 text-white bg-gradient-to-br from-indigo-800 to-blue-900 dark:from-indigo-900 dark:to-gray-900 shadow-inner">
                    
                    <h3 className="text-4xl font-extrabold mb-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
                        Secure  Access
                    </h3>
                    <p className="text-lg mb-8 text-indigo-200 dark:text-gray-400 max-w-md text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
                        This portal is restricted to authorized bank users only. Your access is logged and monitored for compliance.
                    </p>
                    
                    {/* Animated Element: Rotating Cube/Vault Icon */}
                    <div className="w-32 h-32 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-xl animate-spin-slow">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                </div>
            </div>
        </div>
    );
}