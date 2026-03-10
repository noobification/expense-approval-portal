# Expense Approval Portal

A premium, high-performance web application for tracking project expenses, managing document approvals, and visualizing budget variances with a sleek, Apple-style aesthetic.

## 🚀 Features

- **Premium Authentication**: Integrated with Supabase Auth for secure, glassmorphic login experiences.
- **Dynamic Dashboard**: Interactive SVG-based "Budget vs Actual" charts with smooth animations.
- **Project Approval Workflow**: Detailed line-item tracking with parent-child relationships and drag-and-drop organization.
- **Document Manager**: Full support for uploading and deleting project documents (Invoices, Receipts, etc.) while retaining original filenames.
- **Admin Controls**: Robust administrative permissions for status updates and project oversight.
- **Mobile Responsive**: Fully optimized for a seamless experience on all device sizes.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, SWR.
- **Backend**: Node.js, Express.js, Multer (Memory Storage).
- **Database**: Supabase (PostgreSQL) with Drizzle ORM.
- **Storage**: Supabase Storage for project documents.
- **Authentication**: Supabase Auth.

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- A Supabase Project (URL and Anon Key)

### Installation

1. Clone the repository and navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables. Create a `.env` file in the root with:
   ```dotenv
   DATABASE_URL=your_supabase_connection_string
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ADMIN_USER_ID=your_admin_user_uuid
   ```

### Running the Application

1. Start the backend server:
   ```bash
   npm run server
   ```
2. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## 📂 Project Structure

- `/src/pages`: Main application views (Dashboard, Approvals, Finance).
- `/src/context`: Authentication and global state management.
- `/src/db`: Database schema and Drizzle ORM configuration.
- `/server/index.ts`: Express API server and file upload logic using Supabase Storage.
- `supabase_setup.sql`: Database schema setup script for Supabase.

## 🛡️ Administrative Access

Administrative features are restricted to the user ID specified by `ADMIN_USER_ID` in the `.env` file. Admins can approve line items and modify statuses that are otherwise locked for standard users.
