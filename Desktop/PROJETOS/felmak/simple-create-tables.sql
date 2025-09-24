-- Script simplificado para criar tabelas essenciais
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Criar tabela profiles (sem referência a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  department VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela ordens_servico
CREATE TABLE IF NOT EXISTS public.ordens_servico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_os SERIAL UNIQUE NOT NULL,
  
  -- Dados do cliente
  cliente_nome VARCHAR(255) NOT NULL,
  cliente_telefone VARCHAR(20) NOT NULL,
  cliente_email VARCHAR(255),
  cliente_cep VARCHAR(10),
  cliente_endereco VARCHAR(500),
  cliente_numero VARCHAR(20),
  cliente_bairro VARCHAR(100),
  cliente_cidade VARCHAR(100),
  cliente_estado VARCHAR(2),
  cliente_cpf_cnpj VARCHAR(20),
  
  -- Dados do equipamento
  equipamento_tipo VARCHAR(100) NOT NULL,
  equipamento_marca VARCHAR(50) NOT NULL,
  equipamento_modelo VARCHAR(100),
  equipamento_serie VARCHAR(100),
  equipamento_cor VARCHAR(50),
  acessorios_entregues TEXT,
  estado_fisico_entrega TEXT,
  foto_equipamento_url VARCHAR(500),
  
  -- Diagnóstico
  defeito_relatado TEXT NOT NULL,
  observacoes_tecnico TEXT,
  testes_realizados TEXT,
  urgencia BOOLEAN DEFAULT FALSE,
  autorizacao_orcamento BOOLEAN DEFAULT false,
  
  -- Valores
  valor_pecas DECIMAL(10,2) DEFAULT 0,
  valor_mao_obra DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) DEFAULT 0,
  
  -- Status e datas
  data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_prevista TIMESTAMP WITH TIME ZONE,
  data_entrega TIMESTAMP WITH TIME ZONE,
  tecnico_responsavel VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Em análise',
  
  -- Garantia
  prazo_garantia_dias INTEGER DEFAULT 90,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela para peças utilizadas na OS (sem chave estrangeira por enquanto)
CREATE TABLE IF NOT EXISTS public.os_pecas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID,
  peca_nome VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  preco_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela para histórico de comunicações (sem chave estrangeira por enquanto)
CREATE TABLE IF NOT EXISTS public.os_comunicacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID,
  tipo VARCHAR(50) NOT NULL, -- whatsapp, email, ligacao, observacao
  mensagem TEXT NOT NULL,
  data_comunicacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ordens_servico_numero ON public.ordens_servico(numero_os);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_cliente_nome ON public.ordens_servico(cliente_nome);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_status ON public.ordens_servico(status);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_data_entrada ON public.ordens_servico(data_entrada);

-- 6. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar função para calcular valor total
CREATE OR REPLACE FUNCTION public.calculate_valor_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.valor_total = COALESCE(NEW.valor_pecas, 0) + COALESCE(NEW.valor_mao_obra, 0);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Adicionar chaves estrangeiras após criação das tabelas
ALTER TABLE public.os_pecas 
ADD CONSTRAINT fk_os_pecas_os_id 
FOREIGN KEY (os_id) REFERENCES public.ordens_servico(id) ON DELETE CASCADE;

ALTER TABLE public.os_comunicacoes 
ADD CONSTRAINT fk_os_comunicacoes_os_id 
FOREIGN KEY (os_id) REFERENCES public.ordens_servico(id) ON DELETE CASCADE;

-- 9. Criar triggers
CREATE TRIGGER update_ordens_servico_updated_at 
  BEFORE UPDATE ON public.ordens_servico 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER calculate_total_trigger 
  BEFORE INSERT OR UPDATE ON public.ordens_servico 
  FOR EACH ROW EXECUTE FUNCTION public.calculate_valor_total();

-- 10. Configurar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_pecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_comunicacoes ENABLE ROW LEVEL SECURITY;

-- 11. Criar políticas RLS (permitir acesso total para todos os usuários autenticados)
CREATE POLICY "Allow all for profiles" ON public.profiles
  FOR ALL USING (true);

CREATE POLICY "Allow all for ordens_servico" ON public.ordens_servico
  FOR ALL USING (true);

CREATE POLICY "Allow all for os_pecas" ON public.os_pecas
  FOR ALL USING (true);

CREATE POLICY "Allow all for os_comunicacoes" ON public.os_comunicacoes
  FOR ALL USING (true);

-- 12. Inserir dados de exemplo
-- Inserir usuário de exemplo
INSERT INTO public.profiles (
  id, email, full_name, role, department
) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'admin@felmak.com.br', 'Administrador', 'admin', 'contabilidade')
ON CONFLICT (id) DO NOTHING;

-- Inserir ordens de serviço de exemplo
INSERT INTO public.ordens_servico (
  cliente_nome, cliente_telefone, cliente_email,
  equipamento_tipo, equipamento_marca, equipamento_modelo,
  defeito_relatado, status
) VALUES 
  ('João Silva', '(11) 99999-9999', 'joao@email.com', 'Notebook', 'Dell', 'Inspiron 15', 'Não liga', 'Em análise'),
  ('Maria Santos', '(11) 88888-8888', 'maria@email.com', 'Desktop', 'HP', 'Pavilion', 'Tela azul', 'Aguardando peças'),
  ('Pedro Costa', '(11) 77777-7777', 'pedro@email.com', 'Tablet', 'Samsung', 'Galaxy Tab', 'Touch não funciona', 'Pronto para entrega')
ON CONFLICT DO NOTHING;
