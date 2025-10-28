-- Migration Script: Add Management Department
-- Run this script on existing Supabase databases to add the Management department

-- Step 1: Update employees table constraint
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_department_check;
ALTER TABLE employees ADD CONSTRAINT employees_department_check 
  CHECK (department IN ('Salesman', 'Mechanic', 'Housekeeping', 'Management'));

-- Step 2: Update working_days table constraint
ALTER TABLE working_days DROP CONSTRAINT IF EXISTS working_days_department_check;
ALTER TABLE working_days ADD CONSTRAINT working_days_department_check 
  CHECK (department IN ('Salesman', 'Mechanic', 'Housekeeping', 'Management'));

-- Verify the changes
SELECT 
  'Migration completed successfully!' as status,
  'Management department has been added' as message;

-- You can now:
-- 1. Add employees with department = 'Management'
-- 2. Configure working days for Management department
-- 3. Mark attendance for Management employees
