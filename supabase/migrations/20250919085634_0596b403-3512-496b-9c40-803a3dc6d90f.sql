-- Insert sample employees for testing (without user_id since they haven't signed up yet)
INSERT INTO public.employees (user_id, name, email, department, position, join_date) VALUES
(null, 'John Smith', 'john@company.com', 'Engineering', 'Frontend Developer', '2023-01-15'),
(null, 'Sarah Johnson', 'sarah@company.com', 'Design', 'UI/UX Designer', '2023-02-01'),
(null, 'Mike Wilson', 'mike@company.com', 'Marketing', 'Marketing Specialist', '2023-03-01')
ON CONFLICT (email) DO NOTHING;

-- Insert sample attendance records for existing employees
INSERT INTO public.attendance_records (employee_id, date, status) 
SELECT 
  e.id, 
  CURRENT_DATE - (generate_series % 15),
  (ARRAY['present', 'absent', 'overtime', 'halfday'])[1 + (generate_series % 4)]
FROM public.employees e, generate_series(1, 10)
ON CONFLICT (employee_id, date) DO NOTHING;