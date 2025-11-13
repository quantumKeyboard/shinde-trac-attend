-- Migration: Add Sunday tracking columns to salary_calculations table
-- Date: 2024-10-30
-- Purpose: Add columns to track Sunday work, absence, and compensation

-- Add new columns to salary_calculations table
ALTER TABLE salary_calculations 
ADD COLUMN IF NOT EXISTS sundays_in_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sundays_worked INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sundays_absent INTEGER DEFAULT 0;

-- Add comments to explain the columns
COMMENT ON COLUMN salary_calculations.sundays_in_month IS 'Total number of Sundays in the working month';
COMMENT ON COLUMN salary_calculations.sundays_worked IS 'Number of Sundays the employee worked (for compensation/overtime)';
COMMENT ON COLUMN salary_calculations.sundays_absent IS 'Number of Sundays the employee was absent (paid holiday by default)';

-- Update existing records to set default values
UPDATE salary_calculations 
SET 
    sundays_in_month = 0,
    sundays_worked = 0,
    sundays_absent = 0
WHERE sundays_in_month IS NULL 
   OR sundays_worked IS NULL 
   OR sundays_absent IS NULL;

-- Add NOT NULL constraint after setting default values
ALTER TABLE salary_calculations 
ALTER COLUMN sundays_in_month SET NOT NULL,
ALTER COLUMN sundays_worked SET NOT NULL,
ALTER COLUMN sundays_absent SET NOT NULL;

-- Migration completed successfully
