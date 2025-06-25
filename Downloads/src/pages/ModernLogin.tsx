import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import './ModernLogin.css';

const ModernLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao MyDear CRM",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) throw error;

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar o cadastro.",
      });

      setIsActive(false);
    } catch (error: any) {
      toast({
        title: "Erro ao fazer cadastro",
        description: error.message || "Ocorreu um erro ao criar sua conta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`container${isActive ? ' active' : ''}`}>
      <div className="form-box login">
        <form onSubmit={handleLogin}>
          <div className="logo-header">
            <img 
              src="/lovable-uploads/53d085a6-b570-4f97-b913-ce5a65b555aa.png" 
              alt="MyDear CRM" 
              className="logo"
            />
          </div>
          <div className="input-box">
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              required 
              disabled={isLoading}
            />
            <i className='bx bxs-envelope'></i>
          </div>
          <div className="input-box">
            <input 
              type="password" 
              name="password"
              placeholder="Senha" 
              required 
              disabled={isLoading}
            />
            <i className='bx bxs-lock-alt'></i>
          </div>
          <div className="forgot-link">
            <a href="#">Esqueceu a senha?</a>
          </div>
          <button 
            type="submit" 
            className="btn"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>

      <div className="form-box register">
        <form onSubmit={handleRegister}>
          <div className="logo-header">
            <img 
              src="/lovable-uploads/53d085a6-b570-4f97-b913-ce5a65b555aa.png" 
              alt="MyDear CRM"
              className="logo" 
            />
          </div>
          <div className="input-box">
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              required 
              disabled={isLoading}
            />
            <i className='bx bxs-envelope'></i>
          </div>
          <div className="input-box">
            <input 
              type="password" 
              name="password"
              placeholder="Senha" 
              required 
              disabled={isLoading}
            />
            <i className='bx bxs-lock-alt'></i>
          </div>
          <button 
            type="submit" 
            className="btn"
            disabled={isLoading}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>

      <div className="toggle-box">
        <div className="toggle-panel toggle-left">
          <h1>Olá, Bem-vindo!</h1>
          <p>Não tem uma conta?</p>
          <button 
            className="btn" 
            onClick={() => setIsActive(true)}
            disabled={isLoading}
          >
            Cadastrar
          </button>
        </div>

        <div className="toggle-panel toggle-right">
          <h1>Bem-vindo de volta!</h1>
          <p>Já tem uma conta?</p>
          <button 
            className="btn" 
            onClick={() => setIsActive(false)}
            disabled={isLoading}
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernLogin; 