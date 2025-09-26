-- Alterações na tabela ordens_servico para implementar as novas funcionalidades da assistência

-- Adicionar novos campos
ALTER TABLE ordens_servico 
ADD COLUMN IF NOT EXISTS acompanha_acessorios BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS acessorios_descricao TEXT,
ADD COLUMN IF NOT EXISTS assinatura_cliente TEXT,
ADD COLUMN IF NOT EXISTS equipamento_funciona_defeito BOOLEAN,
ADD COLUMN IF NOT EXISTS avaliacao_total BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pecas_orcamento TEXT,
ADD COLUMN IF NOT EXISTS aplicar_taxa_orcamento BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS valor_taxa_orcamento DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS codigo_item TEXT,
ADD COLUMN IF NOT EXISTS valor_antecipado DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tem_valor_antecipado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS data_ultima_alteracao_status TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS aceita_clausulas BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS observacoes_tecnico_antes TEXT,
ADD COLUMN IF NOT EXISTS observacoes_tecnico_depois TEXT;

-- Atualizar o campo data_ultima_alteracao_status quando o status for alterado
CREATE OR REPLACE FUNCTION update_data_alteracao_status()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.data_ultima_alteracao_status = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar automaticamente a data de alteração do status
DROP TRIGGER IF EXISTS trigger_update_data_alteracao_status ON ordens_servico;
CREATE TRIGGER trigger_update_data_alteracao_status
    BEFORE UPDATE ON ordens_servico
    FOR EACH ROW
    EXECUTE FUNCTION update_data_alteracao_status();

-- Comentários para documentar os novos campos
COMMENT ON COLUMN ordens_servico.acompanha_acessorios IS 'Indica se o equipamento acompanha acessórios (Sim/Não)';
COMMENT ON COLUMN ordens_servico.acessorios_descricao IS 'Descrição dos acessórios que acompanham o equipamento';
COMMENT ON COLUMN ordens_servico.assinatura_cliente IS 'Assinatura digital do cliente';
COMMENT ON COLUMN ordens_servico.equipamento_funciona_defeito IS 'Indica se o equipamento funciona com o defeito (Sim/Não)';
COMMENT ON COLUMN ordens_servico.avaliacao_total IS 'Indica se será feita avaliação total (Sim/Não)';
COMMENT ON COLUMN ordens_servico.pecas_orcamento IS 'Peças que serão orçadas na avaliação total';
COMMENT ON COLUMN ordens_servico.aplicar_taxa_orcamento IS 'Indica se será aplicada taxa de orçamento (Sim/Não)';
COMMENT ON COLUMN ordens_servico.valor_taxa_orcamento IS 'Valor da taxa de orçamento';
COMMENT ON COLUMN ordens_servico.codigo_item IS 'Código interno do item (não visível para cliente)';
COMMENT ON COLUMN ordens_servico.valor_antecipado IS 'Valor antecipado pelo cliente';
COMMENT ON COLUMN ordens_servico.tem_valor_antecipado IS 'Indica se há valor antecipado (Sim/Não)';
COMMENT ON COLUMN ordens_servico.data_ultima_alteracao_status IS 'Data da última alteração do status';
COMMENT ON COLUMN ordens_servico.aceita_clausulas IS 'Indica se o cliente aceita as cláusulas contratuais';
COMMENT ON COLUMN ordens_servico.observacoes_tecnico_antes IS 'Observações do técnico antes da entrada da máquina';
COMMENT ON COLUMN ordens_servico.observacoes_tecnico_depois IS 'Observações do técnico depois da entrada da máquina';
