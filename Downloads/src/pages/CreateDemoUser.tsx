import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { createDemoUser, checkDemoUserExists, testDemoUserLogin, testDemoUserLoginDetailed, createDemoUserProfile, diagnoseDemoUser, checkProfilesTable } from '@/utils/createDemoUser';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const CreateDemoUser: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingDetailed, setIsTestingDetailed] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isCheckingTable, setIsCheckingTable] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [demoUserExists, setDemoUserExists] = useState(false);
  const [checking, setChecking] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkIfDemoUserExists();
  }, []);

  const checkIfDemoUserExists = async () => {
    setChecking(true);
    try {
      const result = await checkDemoUserExists();
      setDemoUserExists(result.exists);
    } catch (error) {
      console.error('Erro ao verificar usuário demo:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleCreateDemoUser = async () => {
    setIsCreating(true);
    setResult(null);
    
    try {
      const result = await createDemoUser();
      setResult(result);
      
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
        setDemoUserExists(true);
        
        // Testar o login automaticamente
        await testLogin();
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar usuário demo",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateProfile = async () => {
    setIsCreatingProfile(true);
    setResult(null);
    
    try {
      const result = await createDemoUserProfile();
      setResult(result);
      
      if (result.success) {
        toast({
          title: "Perfil Criado!",
          description: result.message,
        });
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar perfil",
        variant: "destructive",
      });
    } finally {
      setIsCreatingProfile(false);
    }
  };

  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    setResult(null);
    
    try {
      const result = await diagnoseDemoUser();
      setResult(result);
      
      if (result.success) {
        toast({
          title: "Diagnóstico Completo",
          description: result.message,
        });
      } else {
        toast({
          title: "Problemas Encontrados",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no diagnóstico:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado no diagnóstico",
        variant: "destructive",
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleCheckTable = async () => {
    setIsCheckingTable(true);
    setResult(null);
    
    try {
      const result = await checkProfilesTable();
      setResult(result);
      
      if (result.success) {
        toast({
          title: "Tabela OK",
          description: result.message,
        });
      } else {
        toast({
          title: "Problema na Tabela",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao verificar tabela:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao verificar tabela",
        variant: "destructive",
      });
    } finally {
      setIsCheckingTable(false);
    }
  };

  const testLogin = async () => {
    try {
      const result = await testDemoUserLogin();
      
      if (result.success) {
        toast({
          title: "Teste de Login Bem-sucedido!",
          description: "O usuário demo pode fazer login corretamente.",
        });
      } else {
        toast({
          title: "Teste de Login Falhou",
          description: result.message || "Erro no teste de login",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado no teste de login",
        variant: "destructive",
      });
    }
  };

  const handleTestLogin = async () => {
    setIsTesting(true);
    
    try {
      const result = await testDemoUserLogin();
      
      if (result.success) {
        toast({
          title: "Teste de Login Bem-sucedido!",
          description: "O usuário demo pode fazer login corretamente.",
        });
      } else {
        toast({
          title: "Teste de Login Falhou",
          description: result.message || "Erro no teste de login",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado no teste de login",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestLoginDetailed = async () => {
    setIsTestingDetailed(true);
    setResult(null);
    
    try {
      const result = await testDemoUserLoginDetailed();
      setResult(result);
      
      if (result.success) {
        toast({
          title: "Teste Detalhado Bem-sucedido!",
          description: "O usuário demo pode fazer login corretamente.",
        });
      } else {
        toast({
          title: "Teste Detalhado Falhou",
          description: result.message || "Erro no teste de login",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro no teste detalhado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado no teste detalhado",
        variant: "destructive",
      });
    } finally {
      setIsTestingDetailed(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verificando usuário de demonstração...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-center">Criar Usuário de Demonstração</CardTitle>
          <CardDescription className="text-center">
            Crie um usuário de demonstração para testar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Credenciais do Usuário Demo</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Email:</strong> demo@mydearcrm.com.br</p>
              <p><strong>Senha:</strong> teste12345</p>
              <p><strong>Nome:</strong> Usuário Demonstração</p>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              <strong>🔍 Diagnóstico:</strong> Se o login não está funcionando, use os botões de diagnóstico 
              para identificar exatamente onde está o problema.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={handleCreateDemoUser} 
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? "Criando..." : "Criar Usuário Demo"}
            </Button>
            
            <Button 
              onClick={handleCreateProfile} 
              disabled={isCreatingProfile}
              variant="secondary"
              className="w-full"
            >
              {isCreatingProfile ? "Criando..." : "Criar Perfil"}
            </Button>
            
            <Button 
              onClick={handleDiagnose} 
              disabled={isDiagnosing}
              variant="outline"
              className="w-full"
            >
              {isDiagnosing ? "Diagnosticando..." : "🔍 Diagnóstico Completo"}
            </Button>

            <Button 
              onClick={handleCheckTable} 
              disabled={isCheckingTable}
              variant="outline"
              className="w-full"
            >
              {isCheckingTable ? "Verificando..." : "📊 Verificar Tabela"}
            </Button>
            
            <Button 
              onClick={handleTestLogin} 
              disabled={isTesting}
              variant="outline"
              className="w-full"
            >
              {isTesting ? "Testando..." : "Testar Login"}
            </Button>

            <Button 
              onClick={handleTestLoginDetailed} 
              disabled={isTestingDetailed}
              variant="outline"
              className="w-full"
            >
              {isTestingDetailed ? "Testando..." : "Teste Detalhado"}
            </Button>
          </div>

          <Button 
            asChild
            variant="outline"
            className="w-full"
          >
            <Link to="/demo-setup">
              Ver Instruções de Configuração
            </Link>
          </Button>

          {result && (
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Resultado:</h4>
              <pre className="text-sm overflow-x-auto max-h-96 overflow-y-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            <p>Após resolver o problema, você pode fazer login em:</p>
            <a 
              href="https://mydearcrm2.vercel.app/login" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              https://mydearcrm2.vercel.app/login
            </a>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default CreateDemoUser; 