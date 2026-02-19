-- Rename EmployeeRole enum value from 'therapist' to 'member'
ALTER TYPE "EmployeeRole" RENAME VALUE 'therapist' TO 'member';

-- Update the default value for the role column
ALTER TABLE "Employee" ALTER COLUMN "role" SET DEFAULT 'member'::"EmployeeRole";
