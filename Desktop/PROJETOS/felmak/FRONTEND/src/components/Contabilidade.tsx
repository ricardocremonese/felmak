import { 
  FileText, 
  Download, 
  DollarSign, 
  Calculator,
  Receipt,
  TrendingUp,
  Users,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import { CadastrarAcessoModal } from './contabilidade/CadastrarAcessoModal';
import { CadastrarUsuarioModal } from './CadastrarUsuarioModal';

type ContabilidadeProps = Record<string, never>;

const Contabilidade: React.FC<ContabilidadeProps> = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  type Profile = {
    id: string;
    email?: string;
    full_name?: string;
    role?: string;
    department?: string;
  } | null;
  const [user, setUser] = useState<Profile>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Check if user has access to contabilidade
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser(profile);
          setIsAuthenticated(true);
        }
      }
    };
    
    checkUser();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Todos os usuários autenticados têm acesso completo
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        setUser(profile || {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || data.user.email,
          role: 'admin',
          department: 'contabilidade'
        });
        setIsAuthenticated(true);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${profile?.full_name || data.user.email}`,
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    setEmail('');
    setPassword('');
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do módulo de contabilidade.",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Contabilidade FELMAK</CardTitle>
            <CardDescription>
              Acesso restrito para Contador e Responsável Financeiro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contador@felmak.com.br"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contabilidade</h1>
          <p className="text-gray-600">Gestão Financeira e Fiscal - FELMAK</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{user?.full_name || user?.email}</span>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {user?.role === 'admin' ? 'Administrador' : 'Contabilidade'}
            </span>
          </div>
          <CadastrarUsuarioModal onSuccess={() => { /* podemos recarregar dados se necessário */ }} />
          <CadastrarAcessoModal onSuccess={() => { /* podemos recarregar dados se necessário */ }} />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="notas">Notas Fiscais</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="configuracoes">Config</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 45.231,89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notas Emitidas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">
                  +15 notas este mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">
                  +12% crescimento mensal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+18.2%</div>
                <p className="text-xs text-muted-foreground">
                  Crescimento anual
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Últimas Transações</CardTitle>
                <CardDescription>Movimentações financeiras recentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">OS #12345 - João Silva</p>
                      <p className="text-sm text-gray-600">Reparo Furadeira</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+R$ 150,00</p>
                      <p className="text-xs text-gray-500">Hoje, 14:30</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">OS #12344 - Maria Santos</p>
                      <p className="text-sm text-gray-600">Manutenção Serra</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+R$ 280,00</p>
                      <p className="text-xs text-gray-500">Ontem, 16:45</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Funcionalidades mais utilizadas</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col">
                  <Receipt className="h-6 w-6 mb-2" />
                  <span className="text-sm">Emitir NFe</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  <span className="text-sm">Exportar XML</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <Calculator className="h-6 w-6 mb-2" />
                  <span className="text-sm">Calcular Impostos</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col">
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Relatório Mensal</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notas Fiscais Tab */}
        <TabsContent value="notas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notas Fiscais</CardTitle>
              <CardDescription>Geração e gestão de documentos fiscais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-2">
                  <Button>
                    <Receipt className="w-4 h-4 mr-2" />
                    Nova NFe
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar XMLs
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Total: 127 notas emitidas este mês
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <p className="text-center text-gray-500">
                  Módulo de emissão de notas fiscais em desenvolvimento.
                  <br />
                  Integração com SEFAZ e sistema contábil.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financeiro Tab */}
        <TabsContent value="financeiro" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão Financeira</CardTitle>
              <CardDescription>Controle de receitas, despesas e fluxo de caixa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-gray-600">Receitas do Mês</p>
                  <p className="text-2xl font-bold text-green-600">R$ 45.231,89</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-gray-600">Despesas do Mês</p>
                  <p className="text-2xl font-bold text-red-600">R$ 12.543,21</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-sm text-gray-600">Lucro Líquido</p>
                  <p className="text-2xl font-bold text-blue-600">R$ 32.688,68</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-center text-gray-500">
                  Módulo financeiro em desenvolvimento.
                  <br />
                  Integração com contas bancárias e controle de fluxo de caixa.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatórios Tab */}
        <TabsContent value="relatorios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Contábeis</CardTitle>
              <CardDescription>Demonstrativos e exportações para contabilidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-32 flex flex-col justify-center">
                  <FileText className="h-8 w-8 mb-2" />
                  <span className="font-medium">DRE</span>
                  <span className="text-sm text-gray-600">Demonstrativo do Resultado</span>
                </Button>
                <Button variant="outline" className="h-32 flex flex-col justify-center">
                  <Calculator className="h-8 w-8 mb-2" />
                  <span className="font-medium">Balanço</span>
                  <span className="text-sm text-gray-600">Balanço Patrimonial</span>
                </Button>
                <Button variant="outline" className="h-32 flex flex-col justify-center">
                  <Download className="h-8 w-8 mb-2" />
                  <span className="font-medium">SPED</span>
                  <span className="text-sm text-gray-600">Arquivo SPED Fiscal</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Tab */}
        <TabsContent value="configuracoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Configurações do módulo contábil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Dados da Empresa</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>CNPJ:</strong> 12.345.678/0001-90</p>
                      <p><strong>Razão Social:</strong> FELMAK Ferramentas Elétricas LTDA</p>
                    </div>
                    <div>
                      <p><strong>Regime:</strong> Simples Nacional</p>
                      <p><strong>CNAE:</strong> 33.13-1-00</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Integração Contábil</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Configure a integração com seu sistema contábil preferido
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">Configurar API</Button>
                    <Button variant="outline" size="sm">Testar Conexão</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Contabilidade;