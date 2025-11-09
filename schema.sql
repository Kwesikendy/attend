-- Create members table
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT
);

-- Create services table
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  service_date DATE NOT NULL,
  UNIQUE(service_date)
);

-- Create attendance_records table
CREATE TABLE attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  service_date DATE NOT NULL
);

-- Enable Row Level Security (RLS) on members table
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON members
FOR ALL USING (auth.role() = 'authenticated');

-- Enable Row Level Security (RLS) on services table
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON services
FOR ALL USING (auth.role() = 'authenticated');

-- Enable Row Level Security (RLS) on attendance_records table
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON attendance_records
FOR ALL USING (auth.role() = 'authenticated');
