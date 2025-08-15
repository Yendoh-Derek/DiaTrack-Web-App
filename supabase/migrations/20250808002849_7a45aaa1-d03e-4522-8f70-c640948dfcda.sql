-- Fix security warnings - update function search paths

-- Update get_current_user_role function with proper search path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public, auth;

-- Update handle_new_user function with proper search path  
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'display_name',
    new.email
  );
  RETURN new;
END;
$$;