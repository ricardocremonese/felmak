import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // TEMPORÁRIO: Permitir acesso direto sem autenticação
        console.log('🔓 Acesso direto habilitado temporariamente');
        setIsLoading(false);
        return;

        // CÓDIGO ORIGINAL (comentado temporariamente):
        /*
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          navigate('/login');
          return;
        }
        
        setIsLoading(false);
        */
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // TEMPORÁRIO: Não redirecionar para login
        setIsLoading(false);
        // navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#524fa7]"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 