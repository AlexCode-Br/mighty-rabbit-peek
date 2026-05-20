-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name');
  RETURN new;
END;
$$ LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create app_data table to store user settings and history automatically
CREATE TABLE public.app_data (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    history JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.app_data TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.app_data TO authenticated;
ALTER TABLE public.app_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_data_select" ON public.app_data FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "app_data_insert" ON public.app_data FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "app_data_update" ON public.app_data FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "app_data_delete" ON public.app_data FOR DELETE TO authenticated USING (auth.uid() = user_id);