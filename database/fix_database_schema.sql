-- =====================================================
-- Database Fix Script
-- Run this script to ensure your Supabase database is correctly configured
-- =====================================================

-- STEP 1: Verify and fix attendance table columns
-- Check if old columns exist and need to be removed

DO $$ 
BEGIN
    -- Drop old 'status' column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance' AND column_name = 'status'
    ) THEN
        ALTER TABLE attendance DROP COLUMN status;
        RAISE NOTICE 'Dropped old "status" column';
    END IF;

    -- Drop old 'reason' column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance' AND column_name = 'reason'
    ) THEN
        ALTER TABLE attendance DROP COLUMN reason;
        RAISE NOTICE 'Dropped old "reason" column';
    END IF;

    -- Ensure is_present column exists with correct type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance' AND column_name = 'is_present'
    ) THEN
        ALTER TABLE attendance ADD COLUMN is_present BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE 'Added "is_present" column';
    ELSE
        RAISE NOTICE '"is_present" column already exists';
    END IF;

    -- Ensure absence_reason column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance' AND column_name = 'absence_reason'
    ) THEN
        ALTER TABLE attendance ADD COLUMN absence_reason TEXT;
        RAISE NOTICE 'Added "absence_reason" column';
    ELSE
        RAISE NOTICE '"absence_reason" column already exists';
    END IF;

    -- Ensure is_paid_leave column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance' AND column_name = 'is_paid_leave'
    ) THEN
        ALTER TABLE attendance ADD COLUMN is_paid_leave BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added "is_paid_leave" column';
    ELSE
        RAISE NOTICE '"is_paid_leave" column already exists';
    END IF;

    -- Ensure updated_by column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance' AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE attendance ADD COLUMN updated_by UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Added "updated_by" column';
    ELSE
        RAISE NOTICE '"updated_by" column already exists';
    END IF;

    -- Ensure updated_at column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE attendance ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added "updated_at" column';
    ELSE
        RAISE NOTICE '"updated_at" column already exists';
    END IF;
END $$;

-- STEP 2: Update employees table department constraint
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_department_check;
ALTER TABLE employees ADD CONSTRAINT employees_department_check 
  CHECK (department IN ('Salesman', 'Mechanic', 'Housekeeping', 'Management'));

-- STEP 3: Update working_days table department constraint
ALTER TABLE working_days DROP CONSTRAINT IF EXISTS working_days_department_check;
ALTER TABLE working_days ADD CONSTRAINT working_days_department_check 
  CHECK (department IN ('Salesman', 'Mechanic', 'Housekeeping', 'Management'));

-- STEP 4: Ensure unique constraint exists on attendance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'attendance_employee_id_attendance_date_key'
    ) THEN
        ALTER TABLE attendance ADD CONSTRAINT attendance_employee_id_attendance_date_key 
            UNIQUE(employee_id, attendance_date);
        RAISE NOTICE 'Added unique constraint on employee_id and attendance_date';
    ELSE
        RAISE NOTICE 'Unique constraint already exists';
    END IF;
END $$;

-- STEP 5: Verify the attendance table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'attendance'
ORDER BY ordinal_position;

-- STEP 6: Show success message
SELECT 
    'Database schema fixed successfully!' as status,
    'Attendance table now uses: is_present (BOOLEAN), absence_reason (TEXT)' as message,
    'Management department has been added to constraints' as additional_info;
