
-- Adicionar a coluna cliente_complemento que está faltando na tabela ordens_servico
ALTER TABLE public.ordens_servico 
ADD COLUMN cliente_complemento character varying;
