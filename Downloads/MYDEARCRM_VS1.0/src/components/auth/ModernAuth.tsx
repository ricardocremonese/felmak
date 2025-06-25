
import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import classNames from "clsx";

const logoSrc = "/lovable-uploads/cb301e2d-0c77-481e-9d9b-834b76c1fd89.png";
const AUTH_BG_GRADIENT = "bg-[linear-gradient(120deg,_#f4f6ff_0%,_#dde3fa_100%)]";

export default function ModernAuth() {
  const [isActive, setIsActive] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isActive) {
      // Login flow
      if (!email || !password) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        toast({
          title: "Login realizado com sucesso!"
        });
        // Redirect if needed
      } catch (error: any) {
        toast({
          title: "Erro no login",
          description: error.message || "Algo deu errado.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Registration flow
      if (!email || !password || !confirmPassword || !name) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: "Senhas não coincidem",
          description: "Por favor, verifique se as senhas são iguais.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            }
          }
        });
        
        if (error) throw error;
        
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu email para confirmação."
        });
      } catch (error: any) {
        toast({
          title: "Erro no cadastro",
          description: error.message || "Algo deu errado.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={classNames("min-h-screen w-full flex items-center justify-center", AUTH_BG_GRADIENT, "font-[Poppins] px-2 py-4")}>
      <div className={classNames("flex flex-col md:flex-row w-full max-w-3xl rounded-[28px] shadow-xl overflow-hidden bg-transparent", isActive ? "active" : "")}>
        {/* FORMULÁRIO */}
        <div className="relative flex-1 py-8 px-6 sm:px-8 bg-white">
          <div className="text-center mb-6">
            <img src={logoSrc} alt="MyDear CRM" className="h-12 w-auto mx-auto" />
          </div>

          {/* FORMULÁRIO LOGIN */}
          <form className={classNames("space-y-4 transition-all duration-700 ease-in-out", isActive ? "opacity-0 absolute inset-x-0 px-6 sm:px-8" : "opacity-100")} onSubmit={handleSubmit} autoComplete="off">
            <div className="relative">
              <Input 
                type="email" 
                placeholder="Email" 
                autoFocus 
                required 
                className="bg-[#eee] border-none py-3 px-4 text-base rounded-lg pr-11" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
              <span className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none">
                <Mail className="w-[22px] h-[22px] text-zinc-500" />
              </span>
            </div>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Senha" 
                required 
                className="bg-[#eee] border-none py-3 px-4 text-base rounded-lg pr-11" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
              <span className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none">
                <Lock className="w-[22px] h-[22px] text-zinc-500" />
              </span>
              <button 
                type="button" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                onClick={toggleShowPassword}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Esqueci senha */}
            <div className="text-right text-xs mb-2">
              <a href="#" className="text-[#333] hover:underline">Esqueceu a senha?</a>
            </div>
            <Button type="submit" className="w-full text-base font-semibold bg-[#7494ec] hover:bg-[#637ad3] shadow rounded-lg transition-transform" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          {/* FORMULÁRIO CADASTRO */}
          <form className={classNames("space-y-4 transition-all duration-700 ease-in-out", !isActive ? "opacity-0 absolute inset-x-0 px-6 sm:px-8" : "opacity-100")} onSubmit={handleSubmit} autoComplete="off">
            <div className="relative">
              <Input 
                type="text" 
                placeholder="Nome completo" 
                required 
                className="bg-[#eee] border-none py-3 px-4 text-base rounded-lg pr-11" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
              <span className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none">
                <User className="w-[22px] h-[22px] text-zinc-500" />
              </span>
            </div>
            <div className="relative">
              <Input 
                type="email" 
                placeholder="Email" 
                required 
                className="bg-[#eee] border-none py-3 px-4 text-base rounded-lg pr-11" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
              <span className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none">
                <Mail className="w-[22px] h-[22px] text-zinc-500" />
              </span>
            </div>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Senha" 
                required 
                className="bg-[#eee] border-none py-3 px-4 text-base rounded-lg pr-11" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
              <span className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none">
                <Lock className="w-[22px] h-[22px] text-zinc-500" />
              </span>
              <button 
                type="button" 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
                onClick={toggleShowPassword}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Confirmar senha" 
                required 
                className="bg-[#eee] border-none py-3 px-4 text-base rounded-lg pr-11" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
              />
              <span className="absolute right-7 top-1/2 -translate-y-1/2 pointer-events-none">
                <Lock className="w-[22px] h-[22px] text-zinc-500" />
              </span>
            </div>
            <Button type="submit" className="w-full text-base font-semibold bg-[#637ad3] hover:bg-[#7494ec] shadow rounded-lg transition-transform" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
        </div>

        {/* PAINEL LATERAL AZUL */}
        <div className="relative flex-1 flex items-center justify-center bg-[#7494ec] text-white py-6 px-10" style={{
            borderTopRightRadius: '28px',
            borderBottomRightRadius: '28px',
            clipPath: "ellipse(95% 100% at 100% 50%)"
          }}>
          {/* PAINEL ESQUERDO (CADASTRO) */}
          <div className={classNames("absolute inset-0 flex flex-col justify-center items-center px-10 transition-all duration-700 ease-in-out", isActive ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0")}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">Olá, Bem-vindo!</h1>
            <p className="mb-4 text-base font-medium text-center">Não tem uma conta?</p>
            <Button type="button" variant="outline" className="mt-2 w-40 border-white text-white hover:bg-white hover:text-[#7494ec] hover:border-[#7494ec] font-semibold transition-all" onClick={() => setIsActive(true)}>
              Cadastrar
            </Button>
          </div>

          {/* PAINEL DIREITO (LOGIN) */}
          <div className={classNames("absolute inset-0 flex flex-col justify-center items-center px-10 transition-all duration-700 ease-in-out", !isActive ? "opacity-0 -translate-x-full" : "opacity-100 translate-x-0")}>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">Bem-vindo de volta!</h1>
            <p className="mb-4 text-base font-medium text-center">Já tem uma conta?</p>
            <Button type="button" variant="outline" className="mt-2 w-40 border-white text-white hover:bg-white hover:text-[#7494ec] hover:border-[#7494ec] font-semibold transition-all" onClick={() => setIsActive(false)}>
              Entrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
