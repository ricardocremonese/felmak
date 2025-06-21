
-- Atualizar a função para gerar o novo formato de número da OS
CREATE OR REPLACE FUNCTION public.gerar_proximo_numero_os()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  ano_atual INTEGER;
  ano_2_digitos TEXT;
  proximo_numero INTEGER;
  numero_os TEXT;
BEGIN
  -- Obter o ano atual
  ano_atual := EXTRACT(YEAR FROM NOW())::INTEGER;
  
  -- Obter últimos 2 dígitos do ano
  ano_2_digitos := RIGHT(ano_atual::TEXT, 2);
  
  -- Verificar se existe registro para o ano atual
  IF NOT EXISTS (SELECT 1 FROM public.os_numeracao WHERE ano = ano_atual) THEN
    INSERT INTO public.os_numeracao (ultimo_numero, ano) VALUES (0, ano_atual);
  END IF;
  
  -- Incrementar o número e obter o próximo
  UPDATE public.os_numeracao 
  SET ultimo_numero = ultimo_numero + 1, updated_at = NOW()
  WHERE ano = ano_atual
  RETURNING ultimo_numero INTO proximo_numero;
  
  -- Formatar número da OS no novo formato (exemplo: OS25-0001)
  numero_os := 'OS' || ano_2_digitos || '-' || LPAD(proximo_numero::TEXT, 4, '0');
  
  RETURN numero_os;
END;
$$;
