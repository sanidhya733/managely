-- Insert sample employees for testing
INSERT INTO public.employees (name, email, department, position, join_date) VALUES
('John Smith', 'john@company.com', 'Engineering', 'Frontend Developer', '2023-01-15'),
('Sarah Johnson', 'sarah@company.com', 'Design', 'UI/UX Designer', '2023-02-01'),
('Mike Wilson', 'mike@company.com', 'Marketing', 'Marketing Specialist', '2023-03-01')
ON CONFLICT (email) DO NOTHING;