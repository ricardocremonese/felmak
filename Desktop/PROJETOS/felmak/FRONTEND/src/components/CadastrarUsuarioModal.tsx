import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";

type Props = {
  onSuccess?: () => void;
};

export const CadastrarUsuarioModal: React.FC<Props> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "E-mail e senha são obrigatórios" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          full_name: fullName || email
        }
      });

      if (error) throw error;

      // Criar perfil de admin automaticamente
      if (data.user) {
        await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName || data.user.email,
            role: 'admin',
            department: 'contabilidade'
          });
      }

      toast({
        title: "Usuário criado com sucesso!",
        description: `O usuário ${email} foi cadastrado e pode fazer login imediatamente.`,
      });

      setEmail("");
      setPassword("");
      setFullName("");
      setOpen(false);
      onSuccess?.();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-cyan-600 hover:bg-cyan-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Cadastrar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
          <DialogDescription>
            Crie uma nova conta de usuário. O usuário terá acesso completo ao sistema como administrador.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="usuario@felmak.com.br" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha *</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Mínimo 6 caracteres" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nome completo (opcional)</Label>
            <Input 
              id="full_name" 
              placeholder="Nome completo" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CadastrarUsuarioModal;
