import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  onSuccess?: () => void;
};

export const CadastrarAcessoModal: React.FC<Props> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"contador" | "financeiro">("contador");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ variant: "destructive", title: "E-mail é obrigatório" });
      return;
    }
    setIsSubmitting(true);
    try {
      // Buscar profile por e-mail
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, department")
        .eq("email", email)
        .single();

      if (profileError || !profile) {
        toast({
          variant: "destructive",
          title: "Usuário não encontrado",
          description: "Peça para o usuário realizar o cadastro/login no sistema primeiro.",
        });
        return;
      }

      // Atualizar profile: definir departamento contabilidade e opcionalmente nome
      const updatePayload: Record<string, unknown> = { department: "contabilidade" };
      if (fullName && fullName.trim().length > 0) {
        updatePayload.full_name = fullName.trim();
      }
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", profile.id);
      if (updateProfileError) {
        toast({ variant: "destructive", title: "Erro ao atualizar perfil", description: updateProfileError.message });
        return;
      }

      // Upsert permissões contabilidade
      const { error: upsertPermError } = await supabase
        .from("contabilidade_permissoes")
        .upsert({ user_id: profile.id, role });
      if (upsertPermError) {
        toast({ variant: "destructive", title: "Erro ao definir permissões", description: upsertPermError.message });
        return;
      }

      toast({ title: "Acesso liberado", description: "Usuário atualizado com sucesso." });
      setOpen(false);
      setEmail("");
      setFullName("");
      setRole("contador");
      onSuccess?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      toast({ variant: "destructive", title: "Erro ao liberar acesso", description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Cadastrar acesso</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Cadastrar acesso à Contabilidade</DialogTitle>
          <DialogDescription>
            Informe os dados do usuário. O acesso será liberado automaticamente após salvar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail do usuário</Label>
            <Input id="email" type="email" placeholder="usuario@felmak.com.br" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nome completo (opcional)</Label>
            <Input id="full_name" placeholder="Nome completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Papel na contabilidade</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "contador" | "financeiro") }>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contador">Contador</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CadastrarAcessoModal;


