🏦 Bank Management System (OOAD Project)

A comprehensive, modular banking software solution designed to automate core banking operations. This project applies Object-Oriented Analysis and Design (OOAD) principles to ensure scalability, security, and data integrity.

The system features a Role-Based Access Control (RBAC) architecture, separating functionalities for Admins, Cashiers, Loan Officers, and a self-service Customer Portal.

🚀 Key Features

🔐 Security & Architecture

Role-Based Access Control (RBAC): Middleware-protected routes ensuring strictly separated access for Admins, Cashiers, Loan Officers, and Customers.

Atomic Transactions: All financial operations (Transfers, Loan Disbursements, EMI Payments) are wrapped in Database Transactions to prevent data inconsistency.

Secure Authentication: Powered by Laravel Fortify with dedicated flows for Employee and Customer login.

👥 User Roles & Modules

1. 👨‍💼 Admin

Employee Management: Create and manage staff accounts.

Role Assignment: Dynamically assign roles (Cashier, Loan Officer) to users.

System Dashboard: View high-level metrics (Total Assets, Total Employees, Pending Loans).

2. 💵 Cashier (Teller)

Customer Management: Register new customers (KYC), update profiles, and manage linked accounts.

Account Operations: Open Savings, Current, or Fixed Deposit accounts.

Teller Services: Process cash Deposits, Withdrawals, and Internal Transfers with account lookup validation.

3. 📋 Loan Officer

Loan Lifecycle: Review and process loan applications.

Approval & Disbursement: Automated fund disbursement to the customer's account upon approval.

EMI Tracking: View generated amortization schedules and track payment status (Pending/Paid/Late).

Manual Collections: Process cash payments for EMIs.

4. 🏠 Customer Portal (Self-Service)

Self-Registration: Public registration form for new clients.

Dashboard: View total holdings, active accounts, and recent transaction history.

Fund Transfer: Transfer money to other accounts securely.

Loan Services: Apply for loans online and pay EMIs directly from linked savings accounts.

🛠️ Technology Stack

Backend: Laravel 11 (PHP 8.2+)

Frontend: React (TypeScript/TSX)

Glue: Inertia.js (Monolithic SPA feel)

Styling: Tailwind CSS

Database: MySQL

Icons: Lucide React

⚙️ Installation & Setup

Follow these steps to set up the project locally.

Prerequisites

PHP >= 8.2

Composer

Node.js & NPM

MySQL

Steps

Clone the Repository

git clone [https://github.com/SOHAIB65309/bank-management-system.git](https://github.com/SOHAIB65309/bank-management-system.git)
cd bank-management-system


Install Backend Dependencies

composer install


Install Frontend Dependencies

npm install


Environment Setup

Copy .env.example to .env.

Configure your MySQL database credentials in .env.

cp .env.example .env
php artisan key:generate


Database Migration & Seeding (Crucial)

This command creates the tables and populates the system with required Roles and Default Users.

php artisan migrate:fresh --seed


Run the Application

Open two terminals:

# Terminal 1 (Backend)
php artisan serve


# Terminal 2 (Frontend)
npm run dev


🔑 Default Credentials

Use the following credentials to test the different roles in the system. Password for all users is: 12345678.

Role

Email

Capabilities

Admin

admin@bank.com

Full system access, Employee creation.

Cashier

cashier@bank.com

Transactions, Customer KYC, Accounts.

Loan Officer

loan.officer@bank.com

Loan Approvals, EMI tracking.

Customer

alice@test.com

Customer Portal access.

Customer

bob@test.com

Customer Portal access.

📂 Project Structure

app/Models: Contains Eloquent models (User, Customer, Account, Loan, Transaction, Emi).

app/Http/Controllers: Backend logic (AdminController, LoanController, TransactionController, CustomerPortalController).

resources/js/Pages: React views organized by module (Admin, Customer, Transaction, LoanOfficer).

routes/web.php: Route definitions using role middleware for security.

👥 Contributors

Muneeza Fayyaz (Customer Management & Documentation)

Dua (Account & Transaction Management)

Sohaib Anjum (Loan Management & Database Design)

Muhammad Shahid (Admin Management & Security)

📄 License

This project is open-sourced software licensed under the MIT license.