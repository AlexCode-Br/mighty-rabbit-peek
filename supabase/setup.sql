-- Adicionar coluna de chat se não existir
ALTER TABLE public.app_data 
ADD COLUMN IF NOT EXISTS chat_messages JSONB DEFAULT '[]'::jsonb;

-- Garantir que as permissões continuem corretas
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.app_data TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.app_data TO service_role;