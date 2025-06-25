
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface RegisterFormProps {
  onShowLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onShowLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Erro",
        description: "Você precisa aceitar os termos de uso.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar sua conta.",
      });

      // Show login form after successful registration
      onShowLogin();
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error.message);
      toast({
        title: "Erro ao cadastrar",
        description: error.message || "Ocorreu um erro ao criar sua conta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form w-full max-w-[400px] mx-auto bg-white rounded-2xl shadow p-8">
      <span className="block text-2xl font-semibold mb-6 text-[#524fa7]">Cadastro</span>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="relative">
          <Input
            type="text"
            placeholder="Nome completo"
            required
            className="pl-12"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#524fa7]">
            <i className="uil uil-user" />
          </span>
        </div>
        <div className="relative">
          <Input
            type="email"
            placeholder="Digite seu email"
            required
            className="pl-12"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#524fa7]">
            <i className="uil uil-envelope" />
          </span>
        </div>
        <div className="relative">
          <Input
            type="password"
            placeholder="Crie uma senha"
            required
            className="pl-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#524fa7]">
            <i className="uil uil-lock" />
          </span>
        </div>
        <div className="relative">
          <Input
            type="password"
            placeholder="Confirme a senha"
            required
            className="pl-12"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#524fa7]">
            <i className="uil uil-lock" />
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs mb-2">
          <input 
            type="checkbox" 
            className="accent-[#7e57c2]" 
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          Aceito os termos de uso
        </div>
        <Button 
          type="submit" 
          className="w-full bg-[#7494ec] hover:bg-[#637ad3]"
          disabled={isLoading}
        >
          {isLoading ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>
      <div className="text-sm mt-6 text-center">
        Já possui cadastro?{" "}
        <button type="button" className="text-[#524fa7] font-medium hover:underline" onClick={onShowLogin}>
          Entrar
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
