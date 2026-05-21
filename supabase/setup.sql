-- Adicionar coluna de chat à tabela app_data para persistência
ALTER TABLE public.app_data 
ADD COLUMN IF NOT EXISTS chat_messages JSONB DEFAULT '[]'::jsonb;

-- Re-garantir permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.app_data TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.app_data TO service_role;