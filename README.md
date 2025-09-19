# Employee Management System

A comprehensive Employee Management System built with React, TypeScript, and Supabase.

## Features

- **Authentication System**: Secure login for admins and employees
- **Employee Management**: Add, view, and manage employee profiles
- **Attendance Tracking**: Mark and track employee attendance with various statuses
- **Task Management**: Create, assign, and track tasks
- **Reporting**: Generate comprehensive reports on attendance and task performance
- **Real-time Updates**: Live data synchronization with Supabase

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: React Context API
- **Build Tool**: Vite
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd employee-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update the `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the database migrations:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and run the SQL from `supabase/migrations/create_initial_schema.sql`

5. Start the development server:
```bash
npm run dev
```

## Database Schema

The system uses the following main tables:

- **employees**: Store employee information
- **attendance_records**: Track daily attendance
- **tasks**: Manage task assignments and status

## Demo Credentials

### Admin Access
- Email: `admin@company.com`
- Password: `password`

### Employee Access
- Email: `john@company.com` / Password: `password`
- Email: `sarah@company.com` / Password: `password`
- Email: `mike@company.com` / Password: `password`

## Features Overview

### For Administrators
- View all employees and their information
- Mark attendance for all employees
- Create and assign tasks
- Generate comprehensive reports
- View attendance statistics and trends

### For Employees
- View personal attendance history
- Track assigned tasks
- Update task status (accept/complete)
- View personal performance metrics

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── pages/              # Page components
└── types/              # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.