-- Insert an admin user into auth.users (this would normally be done through signup)
-- Note: This is for testing purposes. In production, admins should register through the signup flow

-- Insert sample admin profile (you'll need to create this user through the signup flow)
-- This is just the profile structure - the actual auth.user record needs to be created via Supabase Auth

-- Insert sample employees for testing
INSERT INTO public.employees (user_id, name, email, department, position, join_date) VALUES
(null, 'John Smith', 'john@company.com', 'Engineering', 'Frontend Developer', '2023-01-15'),
(null, 'Sarah Johnson', 'sarah@company.com', 'Design', 'UI/UX Designer', '2023-02-01'),
(null, 'Mike Wilson', 'mike@company.com', 'Marketing', 'Marketing Specialist', '2023-03-01')
ON CONFLICT (email) DO NOTHING;

-- Insert sample attendance records
INSERT INTO public.attendance_records (employee_id, date, status) 
SELECT 
  e.id, 
  CURRENT_DATE - (random() * 30)::int,
  (ARRAY['present', 'absent', 'overtime', 'halfday'])[1 + (random() * 3)::int]
FROM public.employees e, generate_series(1, 5) s
ON CONFLICT (employee_id, date) DO NOTHING;

-- Insert sample tasks
INSERT INTO public.tasks (title, description, assigned_to, assigned_by, status, due_date)
SELECT 
  'Sample Task ' || generate_series,
  'This is a sample task description for testing purposes',
  e.id,
  '00000000-0000-0000-0000-000000000000', -- placeholder admin ID
  (ARRAY['pending', 'accepted', 'completed'])[1 + (random() * 2)::int],
  CURRENT_DATE + (random() * 14)::int
FROM public.employees e, generate_series(1, 3)
ON CONFLICT DO NOTHING;