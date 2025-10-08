-- Fix 1: Restrict profile visibility to only allow users to view their own profile
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Fix 2: Add DELETE policy to settings table
CREATE POLICY "Users can delete their own settings"
ON public.settings
FOR DELETE
USING (auth.uid() = user_id);