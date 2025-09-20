import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  children: React.ReactNode;
};

export const AuthGate: React.FC<Props> = ({ children }) => {
  const { toast } = useToast();
  const [initializing, setInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setIsAuthenticated(Boolean(data.session));
      setInitializing(false);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(Boolean(session));
    });
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Garantir que o usuário tenha perfil de admin
      if (data.user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!existingProfile) {
          // Criar perfil de admin para usuários sem perfil
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || data.user.email,
              role: 'admin',
              department: 'contabilidade'
            });
        } else if (existingProfile.role !== 'admin') {
          // Atualizar usuário existente para admin
          await supabase
            .from('profiles')
            .update({ 
              role: 'admin',
              department: 'contabilidade'
            })
            .eq('id', data.user.id);
        }
      }
      
      toast({ title: "Login efetuado" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      toast({ variant: "destructive", title: "Erro no login", description: message });
    } finally {
      setSubmitting(false);
    }
  };

  if (initializing) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Carregando…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Lado esquerdo com imagem de destaque */}
        <div className="hidden md:block relative">
          <img
            src="/lovable-uploads/logintela.png"
            alt="FELMAK"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Lado direito: formulário */}
        <div className="flex items-center justify-center px-6 py-12 md:py-0 bg-white">
          <div className="w-full max-w-sm">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 h-10 w-10 rounded bg-primary text-white flex items-center justify-center font-semibold">
                F
              </div>
              <h1 className="text-xl font-semibold">Acessar o sistema</h1>
              <p className="text-sm text-muted-foreground">Entre com seu e-mail e senha cadastrados</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Usuário ou Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox id="remember" />
                  <span>Lembrar-me</span>
                </label>
                <a href="#" className="text-sm text-primary hover:underline">Esqueceu a senha?</a>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Entrando…" : "Entrar"}
              </Button>

              <div className="text-center">
                <a href="/" className="text-xs text-muted-foreground hover:underline">← Voltar</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGate;


