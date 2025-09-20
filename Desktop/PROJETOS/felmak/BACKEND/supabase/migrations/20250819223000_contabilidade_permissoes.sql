-- Contabilidade: permissões por usuário
-- Cria enum de papéis, tabela de permissões, RLS e políticas

-- 1) Enum de papéis de contabilidade
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contabilidade_role') THEN
    CREATE TYPE public.contabilidade_role AS ENUM ('contador', 'financeiro');
  END IF;
END $$;

-- 2) Tabela de permissões de contabilidade
CREATE TABLE IF NOT EXISTS public.contabilidade_permissoes (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.contabilidade_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Habilita RLS
ALTER TABLE public.contabilidade_permissoes ENABLE ROW LEVEL SECURITY;

-- 4) Trigger para updated_at (reutiliza public.update_updated_at_column já existente)
DROP TRIGGER IF EXISTS update_contabilidade_permissoes_updated_at ON public.contabilidade_permissoes;
CREATE TRIGGER update_contabilidade_permissoes_updated_at
BEFORE UPDATE ON public.contabilidade_permissoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Função para verificar se usuário corrente é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  );
$$;

-- 6) Políticas RLS
-- SELECT: próprio registro ou admin
DROP POLICY IF EXISTS "contab_select_own_or_admin" ON public.contabilidade_permissoes;
CREATE POLICY "contab_select_own_or_admin"
ON public.contabilidade_permissoes
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

-- INSERT: próprio registro ou admin
DROP POLICY IF EXISTS "contab_insert_self_or_admin" ON public.contabilidade_permissoes;
CREATE POLICY "contab_insert_self_or_admin"
ON public.contabilidade_permissoes
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- UPDATE: próprio registro ou admin
DROP POLICY IF EXISTS "contab_update_self_or_admin" ON public.contabilidade_permissoes;
CREATE POLICY "contab_update_self_or_admin"
ON public.contabilidade_permissoes
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- DELETE: apenas admin
DROP POLICY IF EXISTS "contab_delete_admin_only" ON public.contabilidade_permissoes;
CREATE POLICY "contab_delete_admin_only"
ON public.contabilidade_permissoes
FOR DELETE
TO authenticated
USING (public.is_admin());


