
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const logoSrc = "/lovable-uploads/f913621c-663e-4462-b654-0aa39b1f000b.png";

type Mode = "login" | "register";

const gradientOverlay =
  "before:absolute before:content-[''] before:left-[-75%] before:top-0 before:w-[250%] before:h-full before:bg-gradient-to-r before:from-[#45c7f3] before:via-[#7494ec] before:to-[#33C3F0] before:rounded-[150px] before:z-[-1] before:transition-all before:duration-700 before:ease-in-out";

export default function AnimatedAuth() {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);

  // Compartilhado login e cadastro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Apenas para cadastro
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  // Handlers
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!email || !password || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Digite a mesma senha nos dois campos.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        }
      });
      if (error) throw error;

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu e-mail para confirmar. Redirecionando para o login...",
      });
      setTimeout(() => {
        setMode("login");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro durante o cadastro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-[#e2e2e2] to-[#c9d6ff] font-[Poppins] relative overflow-hidden">
      <div
        className={`
          relative w-[850px] max-w-full h-[550px] mx-4 bg-white rounded-[30px] shadow-xl animated-gradient
          flex justify-center items-center transition-all duration-700
        `}
      >
        {/* Animated Toggle Panel Overlay */}
        <div
          className={`absolute top-0 left-0 w-full h-full pointer-events-none ${gradientOverlay} ${
            mode === "register"
              ? "before:left-1/2"
              : "before:left-[-75%]"
          } transition-all duration-700 z-0`}
        />

        {/* FORM - LOGIN */}
        <div
          className={`absolute right-0 w-1/2 h-full bg-white flex flex-col justify-center items-center p-8 
            transition-all duration-700 ease-in-out z-10
            ${mode === "login" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none translate-x-[50%]"}
          `}
        >
          <form className="w-full max-w-[320px] mx-auto" onSubmit={handleLogin}>
            <div className="logo-header mb-8">
              <img
                src={logoSrc}
                alt="MyDear CRM"
                className="mx-auto w-[180px] h-auto"
                draggable={false}
              />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-[#333]">Bem-vindo!</h2>
            <div className="mb-5">
              <Input
                type="email"
                placeholder="Email"
                className="bg-[#eee] border-none py-3 px-5 text-base rounded-lg w-full outline-none"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <Input
                type="password"
                placeholder="Senha"
                className="bg-[#eee] border-none py-3 px-5 text-base rounded-lg w-full outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="w-full text-right mb-6">
              <a href="#" className="text-xs text-[#333] hover:underline">
                Esqueceu sua senha?
              </a>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#7494ec] text-white text-base py-3 rounded-lg font-semibold shadow hover:scale-105 transition-transform"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>

        {/* FORM - REGISTER */}
        <div
          className={`absolute left-0 w-1/2 h-full bg-white flex flex-col justify-center items-center p-8
            transition-all duration-700 ease-in-out z-10
            ${mode === "register" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none -translate-x-[50%]"}
          `}
        >
          <form className="w-full max-w-[320px] mx-auto" onSubmit={handleRegister}>
            <div className="logo-header mb-8">
              <img
                src={logoSrc}
                alt="MyDear CRM"
                className="mx-auto w-[180px] h-auto"
                draggable={false}
              />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-[#333]">Criar Conta</h2>
            <div className="mb-5">
              <Input
                type="email"
                placeholder="Email"
                className="bg-[#eee] border-none py-3 px-5 text-base rounded-lg w-full outline-none"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <Input
                type="password"
                placeholder="Senha"
                className="bg-[#eee] border-none py-3 px-5 text-base rounded-lg w-full outline-none"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <Input
                type="password"
                placeholder="Confirme a senha"
                className="bg-[#eee] border-none py-3 px-5 text-base rounded-lg w-full outline-none"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#7494ec] text-white text-base py-3 rounded-lg font-semibold shadow hover:scale-105 transition-transform"
              disabled={loading}
            >
              {loading ? "Processando..." : "Cadastrar"}
            </Button>
          </form>
        </div>

        {/* TOGGLE PANEL  - left e right */}
        <div className="absolute w-full h-full flex z-20 pointer-events-none">
          {/* Toggle left (para cadastrar) */}
          <div className={`
            absolute left-0 top-0 w-1/2 h-full flex flex-col justify-center items-center text-white
            transition-all duration-700 ease-in-out px-8
            ${mode === "login" ? "z-20 opacity-100 pointer-events-auto" : "z-10 opacity-0 pointer-events-none -translate-x-[40%]"}
          `}>
            <h1 className="text-3xl font-bold mb-3 drop-shadow">Olá, Bem-vindo!</h1>
            <p className="mb-6 text-base font-medium drop-shadow">Não tem uma conta?</p>
            <button
              className="btn border-2 border-white bg-transparent w-[160px] h-[46px] rounded-lg font-semibold shadow-md transition hover:bg-white hover:text-[#7494ec] hover:scale-105"
              onClick={() => setMode("register")}
              type="button"
              tabIndex={0}
            >
              Cadastrar
            </button>
          </div>
          {/* Toggle right (para login) */}
          <div className={`
            absolute right-0 top-0 w-1/2 h-full flex flex-col justify-center items-center text-white
            transition-all duration-700 ease-in-out px-8
            ${mode === "register" ? "z-20 opacity-100 pointer-events-auto" : "z-10 opacity-0 pointer-events-none translate-x-[40%]"}
          `}>
            <h1 className="text-3xl font-bold mb-3 drop-shadow">Bem-vindo de volta!</h1>
            <p className="mb-6 text-base font-medium drop-shadow">Já tem uma conta?</p>
            <button
              className="btn border-2 border-white bg-transparent w-[160px] h-[46px] rounded-lg font-semibold shadow-md transition hover:bg-white hover:text-[#7494ec] hover:scale-105"
              onClick={() => setMode("login")}
              type="button"
              tabIndex={0}
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
