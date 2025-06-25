import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  onShowRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onShowRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${email}!`,
      });
      
      // Use navigate instead of window.location
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erro ao fazer login:", error.message);
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form w-full max-w-[400px] mx-auto bg-white rounded-2xl shadow p-8">
      <span className="block text-2xl font-semibold mb-6 text-[#524fa7]">Login</span>
      <form className="space-y-5" onSubmit={handleSubmit}>
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
            placeholder="Digite sua senha"
            required
            className="pl-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-[#524fa7]">
            <i className="uil uil-lock" />
          </span>
        </div>
        <div className="flex justify-between items-center text-xs mb-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-[#7e57c2]" />
            Lembrar-me
          </label>
          <a href="#" className="text-[#524fa7] hover:underline">Esqueceu a senha?</a>
        </div>
        <Button 
          type="submit" 
          className="w-full bg-[#7494ec] hover:bg-[#637ad3]"
          disabled={isLoading}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <div className="text-sm mt-6 text-center">
        Não é cadastrado?{" "}
        <button type="button" className="text-[#524fa7] font-medium hover:underline" onClick={onShowRegister}>
          Cadastrar agora
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
