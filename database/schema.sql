-- Shinde Tractors Employee Attendance System
-- Database Schema for Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. EMPLOYEES TABLE
-- =====================================================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated: EMP001, EMP002, etc.
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL CHECK (department IN ('Salesman', 'Mechanic', 'Housekeeping', 'Management')),
    monthly_salary DECIMAL(10, 2) NOT NULL CHECK (monthly_salary > 0),
    contact_number VARCHAR(15),
    date_of_joining DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Index for faster searches
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);

-- =====================================================
-- 2. WORKING DAYS TABLE
-- =====================================================
CREATE TABLE working_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2024),
    department VARCHAR(50) NOT NULL CHECK (department IN ('Salesman', 'Mechanic', 'Housekeeping', 'Management')),
    total_working_days INTEGER NOT NULL CHECK (total_working_days BETWEEN 1 AND 31),
    working_dates DATE[] NOT NULL, -- Array of actual working dates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(month, year, department)
);

-- Index for faster queries
CREATE INDEX idx_working_days_month_year ON working_days(month, year);
CREATE INDEX idx_working_days_department ON working_days(department);

-- =====================================================
-- 3. ATTENDANCE TABLE
-- =====================================================
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    is_present BOOLEAN NOT NULL DEFAULT true,
    is_paid_leave BOOLEAN DEFAULT false, -- true if absent but paid
    is_sunday_work BOOLEAN DEFAULT false, -- true if working on Sunday (compensation/overtime)
    absence_reason TEXT,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    marked_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(employee_id, attendance_date)
);

-- Indexes for faster queries
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_is_present ON attendance(is_present);
CREATE INDEX idx_attendance_is_sunday_work ON attendance(is_sunday_work);
CREATE INDEX idx_attendance_month_year ON attendance(EXTRACT(MONTH FROM attendance_date), EXTRACT(YEAR FROM attendance_date));

-- =====================================================
-- 4. SALARY CALCULATIONS TABLE
-- =====================================================
CREATE TABLE salary_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2024),
    monthly_salary DECIMAL(10, 2) NOT NULL,
    total_working_days INTEGER NOT NULL,
    days_present INTEGER NOT NULL,
    days_absent_unpaid INTEGER NOT NULL,
    days_absent_paid INTEGER NOT NULL,
    sundays_in_month INTEGER NOT NULL DEFAULT 0, -- Total Sundays in the working month
    sundays_worked INTEGER NOT NULL DEFAULT 0, -- Number of Sundays employee worked
    sundays_absent INTEGER NOT NULL DEFAULT 0, -- Number of Sundays employee was absent (paid holiday)
    sunday_compensation_days INTEGER DEFAULT 0, -- Sundays worked to compensate absences
    sunday_overtime_days INTEGER DEFAULT 0, -- Sundays worked as overtime (no absences)
    per_day_rate DECIMAL(10, 2) NOT NULL,
    deduction_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    overtime_amount DECIMAL(10, 2) DEFAULT 0, -- Payment for Sunday overtime
    payable_salary DECIMAL(10, 2) NOT NULL,
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculated_by UUID REFERENCES auth.users(id),
    is_finalized BOOLEAN DEFAULT false,
    finalized_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(employee_id, month, year)
);

-- Indexes
CREATE INDEX idx_salary_calc_employee ON salary_calculations(employee_id);
CREATE INDEX idx_salary_calc_month_year ON salary_calculations(month, year);
CREATE INDEX idx_salary_calc_finalized ON salary_calculations(is_finalized);

-- =====================================================
-- 5. AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL, -- e.g., 'MARK_ATTENDANCE', 'EDIT_EMPLOYEE', 'CALCULATE_SALARY'
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for audit queries
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- =====================================================
-- 6. SYSTEM SETTINGS TABLE
-- =====================================================
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
    ('company_name', 'Shinde Tractors', 'Company name for reports'),
    ('auto_backup_enabled', 'true', 'Enable automatic weekly backups'),
    ('session_timeout_minutes', '30', 'Auto-logout after inactivity'),
    ('max_past_attendance_edit_days', '3', 'Maximum days in past to edit attendance'),
    ('current_employee_number', '0', 'Last generated employee number');

-- =====================================================
-- 7. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to auto-generate employee ID
CREATE OR REPLACE FUNCTION generate_employee_id()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    -- Get and increment the current employee number
    UPDATE system_settings 
    SET setting_value = (setting_value::INTEGER + 1)::TEXT
    WHERE setting_key = 'current_employee_number'
    RETURNING setting_value::INTEGER INTO next_num;
    
    -- Generate employee ID with leading zeros (EMP001, EMP002, etc.)
    NEW.employee_id := 'EMP' || LPAD(next_num::TEXT, 3, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate employee ID on insert
CREATE TRIGGER trigger_generate_employee_id
    BEFORE INSERT ON employees
    FOR EACH ROW
    WHEN (NEW.employee_id IS NULL OR NEW.employee_id = '')
    EXECUTE FUNCTION generate_employee_id();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at on all tables
CREATE TRIGGER trigger_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_working_days_updated_at BEFORE UPDATE ON working_days
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to validate attendance date (cannot be future)
CREATE OR REPLACE FUNCTION validate_attendance_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.attendance_date > CURRENT_DATE THEN
        RAISE EXCEPTION 'Cannot mark attendance for future dates';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate attendance date
CREATE TRIGGER trigger_validate_attendance_date
    BEFORE INSERT OR UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION validate_attendance_date();

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Allow authenticated users to read/write all data
-- (In production, you might want more granular policies)

CREATE POLICY "Allow authenticated users full access to employees"
    ON employees FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to working_days"
    ON working_days FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to attendance"
    ON attendance FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to salary_calculations"
    ON salary_calculations FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read audit_logs"
    ON audit_logs FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert audit_logs"
    ON audit_logs FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to system_settings"
    ON system_settings FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- =====================================================
-- 9. USEFUL VIEWS
-- =====================================================

-- View: Active employees with attendance summary
CREATE OR REPLACE VIEW v_employee_attendance_summary AS
SELECT 
    e.id,
    e.employee_id,
    e.full_name,
    e.department,
    e.monthly_salary,
    e.status,
    COUNT(CASE WHEN a.is_present = true THEN 1 END) as total_present,
    COUNT(CASE WHEN a.is_present = false AND a.is_paid_leave = false THEN 1 END) as total_absent_unpaid,
    COUNT(CASE WHEN a.is_present = false AND a.is_paid_leave = true THEN 1 END) as total_absent_paid,
    COUNT(a.id) as total_records
FROM employees e
LEFT JOIN attendance a ON e.id = a.employee_id
WHERE e.status = 'Active'
GROUP BY e.id, e.employee_id, e.full_name, e.department, e.monthly_salary, e.status;

-- View: Monthly attendance statistics
CREATE OR REPLACE VIEW v_monthly_attendance_stats AS
SELECT 
    EXTRACT(YEAR FROM a.attendance_date)::INTEGER as year,
    EXTRACT(MONTH FROM a.attendance_date)::INTEGER as month,
    e.department,
    COUNT(DISTINCT e.id) as total_employees,
    COUNT(CASE WHEN a.is_present = true THEN 1 END) as total_present_count,
    COUNT(CASE WHEN a.is_present = false THEN 1 END) as total_absent_count,
    COUNT(CASE WHEN a.is_present = false AND a.is_paid_leave = false THEN 1 END) as unpaid_absent_count,
    COUNT(CASE WHEN a.is_present = false AND a.is_paid_leave = true THEN 1 END) as paid_absent_count
FROM employees e
LEFT JOIN attendance a ON e.id = a.employee_id
WHERE e.status = 'Active'
GROUP BY year, month, e.department;

-- =====================================================
-- COMPLETED: Database schema is ready!
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
