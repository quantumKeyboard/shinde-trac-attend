# Database Migration Guide - Add Sunday Tracking Columns

## Issue
When saving salary calculations, you get the error:
```
Could not find the 'sundays_absent' column of 'salary_calculations' in the schema cache
```

## Solution
The `salary_calculations` table is missing three columns that were added in the recent Sunday compensation feature:
- `sundays_in_month` - Total Sundays in the working month
- `sundays_worked` - Number of Sundays the employee worked
- `sundays_absent` - Number of Sundays the employee was absent

## How to Apply Migration

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy the contents of `database/migration_add_sunday_tracking_columns.sql`
5. Paste into the SQL editor
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push

# Or manually run the migration
supabase db execute --file database/migration_add_sunday_tracking_columns.sql
```

### Option 3: Copy-Paste SQL
Copy and paste this SQL directly into your Supabase SQL Editor:

```sql
-- Add new columns to salary_calculations table
ALTER TABLE salary_calculations 
ADD COLUMN IF NOT EXISTS sundays_in_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sundays_worked INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sundays_absent INTEGER DEFAULT 0;

-- Update existing records to set default values
UPDATE salary_calculations 
SET 
    sundays_in_month = 0,
    sundays_worked = 0,
    sundays_absent = 0
WHERE sundays_in_month IS NULL 
   OR sundays_worked IS NULL 
   OR sundays_absent IS NULL;

-- Add NOT NULL constraint
ALTER TABLE salary_calculations 
ALTER COLUMN sundays_in_month SET NOT NULL,
ALTER COLUMN sundays_worked SET NOT NULL,
ALTER COLUMN sundays_absent SET NOT NULL;
```

## Verification
After running the migration, verify the columns were added:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'salary_calculations' 
  AND column_name IN ('sundays_in_month', 'sundays_worked', 'sundays_absent');
```

You should see:
```
sundays_in_month  | integer | NO
sundays_worked    | integer | NO
sundays_absent    | integer | NO
```

## Test After Migration
1. Go to the Salary Calculation page in the desktop app
2. Select a month and employee
3. Click "Calculate Salary"
4. Click "Save Calculation"
5. Should save successfully without errors

## Rollback (if needed)
If you need to rollback this migration:

```sql
ALTER TABLE salary_calculations 
DROP COLUMN IF EXISTS sundays_in_month,
DROP COLUMN IF EXISTS sundays_worked,
DROP COLUMN IF EXISTS sundays_absent;
```

## Notes
- This migration is **safe to run** - it won't delete any existing data
- The `IF NOT EXISTS` clause prevents errors if columns already exist
- Default values are set to 0 for all existing records
- New records will automatically include these columns
