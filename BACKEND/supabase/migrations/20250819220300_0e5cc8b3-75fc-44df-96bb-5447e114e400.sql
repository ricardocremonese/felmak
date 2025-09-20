-- Drop trigger first, then functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Add missing fields to ordens_servico table
ALTER TABLE public.ordens_servico 
ADD COLUMN IF NOT EXISTS cliente_cpf_cnpj TEXT,
ADD COLUMN IF NOT EXISTS cliente_numero TEXT,
ADD COLUMN IF NOT EXISTS equipamento_cor TEXT,
ADD COLUMN IF NOT EXISTS acessorios_entregues TEXT,
ADD COLUMN IF NOT EXISTS estado_fisico_entrega TEXT,
ADD COLUMN IF NOT EXISTS observacoes_tecnico TEXT,
ADD COLUMN IF NOT EXISTS testes_realizados TEXT,
ADD COLUMN IF NOT EXISTS valor_mao_obra DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS autorizacao_orcamento BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS data_prevista TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS data_entrega TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS prazo_garantia_dias INTEGER DEFAULT 90;

-- Recreate functions with correct search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN NEW.email = 'admin@felmak.com.br' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();