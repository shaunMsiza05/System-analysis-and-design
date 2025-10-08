-- Temporarily allow the development UUID to work with RLS policies
-- This allows the app to work without authentication during development

-- Drop existing policies for transactions
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;

-- Create new policies that allow the dev UUID
CREATE POLICY "Users can create their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Users can update their own transactions" 
ON public.transactions 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Users can delete their own transactions" 
ON public.transactions 
FOR DELETE 
USING (
  auth.uid() = user_id 
  OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
);

-- Do the same for expenses
DROP POLICY IF EXISTS "Users can create their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.expenses;

CREATE POLICY "Users can create their own expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Users can view their own expenses" 
ON public.expenses 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Users can update their own expenses" 
ON public.expenses 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Users can delete their own expenses" 
ON public.expenses 
FOR DELETE 
USING (
  auth.uid() = user_id 
  OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
);

-- Do the same for settings
DROP POLICY IF EXISTS "Users can create their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can view their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.settings;

CREATE POLICY "Users can create their own settings" 
ON public.settings 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Users can view their own settings" 
ON public.settings 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
);

CREATE POLICY "Users can update their own settings" 
ON public.settings 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR user_id = '00000000-0000-0000-0000-000000000000'::uuid
);