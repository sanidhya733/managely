/*
  # Initial Employee Management System Schema

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `department` (text)
      - `position` (text)
      - `join_date` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `attendance_records`
      - `id` (uuid, primary key)
      - `employee_id` (uuid, foreign key)
      - `date` (date)
      - `status` (text, check constraint)
      - `notes` (text, optional)
      - `created_at` (timestamp)
    
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `assigned_to` (uuid, foreign key)
      - `assigned_by` (uuid, foreign key)
      - `status` (text, check constraint)
      - `created_date` (date)
      - `due_date` (date)
      - `completed_date` (date, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Admin users can manage all data
    - Employees can view their own data and update task status
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  department text NOT NULL,
  position text NOT NULL,
  join_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'overtime', 'halfday')),
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  assigned_to uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed')),
  created_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  completed_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for employees table
CREATE POLICY "Employees can read all employee data"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage employees"
  ON employees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE id = auth.uid() 
      AND email LIKE '%admin%'
    )
  );

-- Create policies for attendance_records table
CREATE POLICY "Users can read all attendance records"
  ON attendance_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage attendance records"
  ON attendance_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE id = auth.uid() 
      AND email LIKE '%admin%'
    )
  );

CREATE POLICY "Employees can read their own attendance"
  ON attendance_records
  FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

-- Create policies for tasks table
CREATE POLICY "Users can read all tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage all tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees 
      WHERE id = auth.uid() 
      AND email LIKE '%admin%'
    )
  );

CREATE POLICY "Employees can update their assigned tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance_records(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_by ON tasks(assigned_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Insert sample data
INSERT INTO employees (id, name, email, department, position, join_date) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Admin User', 'admin@company.com', 'Management', 'System Administrator', '2023-01-01'),
  ('550e8400-e29b-41d4-a716-446655440001', 'John Smith', 'john@company.com', 'Engineering', 'Frontend Developer', '2023-01-15'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sarah Johnson', 'sarah@company.com', 'Design', 'UI/UX Designer', '2023-02-01'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Mike Wilson', 'mike@company.com', 'Marketing', 'Marketing Specialist', '2023-03-01')
ON CONFLICT (email) DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (title, description, assigned_to, assigned_by, status, created_date, due_date) VALUES
  ('Update User Dashboard', 'Implement new features for the user dashboard including analytics widgets', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'accepted', '2024-01-10', '2024-01-20'),
  ('Design System Documentation', 'Create comprehensive documentation for the design system components', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'completed', '2024-01-05', '2024-01-15'),
  ('Marketing Campaign Analysis', 'Analyze the performance of Q4 marketing campaigns and prepare report', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'pending', '2024-01-12', '2024-01-25')
ON CONFLICT DO NOTHING;