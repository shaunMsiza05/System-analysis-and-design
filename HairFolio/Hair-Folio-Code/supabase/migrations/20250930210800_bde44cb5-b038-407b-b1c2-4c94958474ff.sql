-- Remove foreign key constraints that require authentication
-- This allows development without auth

-- Remove foreign key from transactions
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

-- Remove foreign key from expenses
ALTER TABLE public.expenses 
DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;

-- Remove foreign key from settings
ALTER TABLE public.settings 
DROP CONSTRAINT IF EXISTS settings_user_id_fkey;