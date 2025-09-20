
-- Criar tabela para ordens de serviço
CREATE TABLE public.ordens_servico (
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
  autorizacao_orcamento DECIMAL(10,2),
  
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

-- Criar tabela para peças utilizadas na OS
CREATE TABLE public.os_pecas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  peca_nome VARCHAR(255) NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL,
  preco_total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para histórico de comunicações
CREATE TABLE public.os_comunicacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- whatsapp, email, ligacao, observacao
  mensagem TEXT NOT NULL,
  data_comunicacao TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_ordens_servico_numero ON public.ordens_servico(numero_os);
CREATE INDEX idx_ordens_servico_cliente_nome ON public.ordens_servico(cliente_nome);
CREATE INDEX idx_ordens_servico_status ON public.ordens_servico(status);
CREATE INDEX idx_ordens_servico_data_entrada ON public.ordens_servico(data_entrada);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ordens_servico_updated_at 
    BEFORE UPDATE ON public.ordens_servico 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para calcular valor total automaticamente
CREATE OR REPLACE FUNCTION calculate_valor_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.valor_total = COALESCE(NEW.valor_pecas, 0) + COALESCE(NEW.valor_mao_obra, 0);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_total_trigger 
    BEFORE INSERT OR UPDATE ON public.ordens_servico 
    FOR EACH ROW EXECUTE FUNCTION calculate_valor_total();
