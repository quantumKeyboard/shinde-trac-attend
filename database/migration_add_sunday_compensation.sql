-- =====================================================
-- Migration Script: Add Sunday Compensation Feature
-- Run this script on existing Supabase databases to add Sunday work tracking
-- =====================================================

-- STEP 1: Add is_sunday_work column to attendance table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance' AND column_name = 'is_sunday_work'
    ) THEN
        ALTER TABLE attendance ADD COLUMN is_sunday_work BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added "is_sunday_work" column to attendance table';
    ELSE
        RAISE NOTICE '"is_sunday_work" column already exists';
    END IF;
END $$;

-- STEP 2: Create index for Sunday work queries
CREATE INDEX IF NOT EXISTS idx_attendance_is_sunday_work ON attendance(is_sunday_work);

-- STEP 3: Add Sunday compensation columns to salary_calculations table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'salary_calculations' AND column_name = 'sunday_compensation_days'
    ) THEN
        ALTER TABLE salary_calculations ADD COLUMN sunday_compensation_days INTEGER DEFAULT 0;
        RAISE NOTICE 'Added "sunday_compensation_days" column';
    ELSE
        RAISE NOTICE '"sunday_compensation_days" column already exists';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'salary_calculations' AND column_name = 'sunday_overtime_days'
    ) THEN
        ALTER TABLE salary_calculations ADD COLUMN sunday_overtime_days INTEGER DEFAULT 0;
        RAISE NOTICE 'Added "sunday_overtime_days" column';
    ELSE
        RAISE NOTICE '"sunday_overtime_days" column already exists';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'salary_calculations' AND column_name = 'overtime_amount'
    ) THEN
        ALTER TABLE salary_calculations ADD COLUMN overtime_amount DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE 'Added "overtime_amount" column';
    ELSE
        RAISE NOTICE '"overtime_amount" column already exists';
    END IF;
END $$;

-- STEP 4: Verify the changes
SELECT 
    'Migration completed successfully!' as status,
    'Sunday compensation feature has been added' as message,
    'Attendance table now tracks is_sunday_work' as attendance_update,
    'Salary calculations now track compensation and overtime' as salary_update;

-- STEP 5: Show updated attendance table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'attendance'
ORDER BY ordinal_position;
