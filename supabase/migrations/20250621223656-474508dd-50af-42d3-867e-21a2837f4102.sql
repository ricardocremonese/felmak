
-- Habilitar RLS na tabela ordens_servico se ainda não estiver habilitado
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir inserção de ordens de serviço (permitir para todos por enquanto)
CREATE POLICY "Permitir inserção de OS" 
  ON public.ordens_servico 
  FOR INSERT 
  WITH CHECK (true);

-- Criar política para permitir visualização de ordens de serviço
CREATE POLICY "Permitir visualização de OS" 
  ON public.ordens_servico 
  FOR SELECT 
  USING (true);

-- Criar política para permitir atualização de ordens de serviço
CREATE POLICY "Permitir atualização de OS" 
  ON public.ordens_servico 
  FOR UPDATE 
  USING (true);

-- Criar política para permitir exclusão de ordens de serviço
CREATE POLICY "Permitir exclusão de OS" 
  ON public.ordens_servico 
  FOR DELETE 
  USING (true);

-- Habilitar RLS e criar políticas para a tabela os_pecas também
ALTER TABLE public.os_pecas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir inserção de peças" 
  ON public.os_pecas 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir visualização de peças" 
  ON public.os_pecas 
  FOR SELECT 
  USING (true);

CREATE POLICY "Permitir atualização de peças" 
  ON public.os_pecas 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Permitir exclusão de peças" 
  ON public.os_pecas 
  FOR DELETE 
  USING (true);

-- Habilitar RLS e criar políticas para a tabela os_comunicacoes também
ALTER TABLE public.os_comunicacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir inserção de comunicações" 
  ON public.os_comunicacoes 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir visualização de comunicações" 
  ON public.os_comunicacoes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Permitir atualização de comunicações" 
  ON public.os_comunicacoes 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Permitir exclusão de comunicações" 
  ON public.os_comunicacoes 
  FOR DELETE 
  USING (true);
