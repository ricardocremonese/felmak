import React, { useEffect, useState } from 'react';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  Package,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
// Tipo simplificado para ordens de serviço
type OrdemServico = {
  id: string;
  numero_os: number | null;
  cliente_nome: string;
  cliente_telefone: string | null;
  cliente_email: string | null;
  equipamento_tipo: string;
  equipamento_marca: string | null;
  equipamento_modelo: string | null;
  defeito_relatado: string;
  status: string | null;
  valor_total: number | null;
  data_entrada: string | null;
  created_at: string;
};

const Dashboard = () => {
  const [recentOrders, setRecentOrders] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Dados mockados para demonstração
  const statsData = [
    {
      title: "Equipamentos em Assistência",
      value: "24",
      icon: Wrench,
      color: "bg-felmak-blue",
      trend: "+12%"
    },
    {
      title: "Aguardando Peças",
      value: "8",
      icon: Clock,
      color: "bg-felmak-warning",
      trend: "-5%"
    },
    {
      title: "Finalizados (Semana)",
      value: "15",
      icon: CheckCircle,
      color: "bg-felmak-success",
      trend: "+22%"
    },
    {
      title: "Receita do Mês",
      value: "R$ 12.450",
      icon: DollarSign,
      color: "bg-felmak-orange",
      trend: "+18%"
    }
  ];

  const osStatusData = [
    { name: 'Em Análise', value: 6, color: '#3b82f6' },
    { name: 'Aguardando Peça', value: 8, color: '#f59e0b' },
    { name: 'Autorizado', value: 5, color: '#10b981' },
    { name: 'Finalizado', value: 15, color: '#6b7280' }
  ];

  const weeklyData = [
    { day: 'Seg', os: 4, vendas: 12 },
    { day: 'Ter', os: 6, vendas: 8 },
    { day: 'Qua', os: 8, vendas: 15 },
    { day: 'Qui', os: 5, vendas: 10 },
    { day: 'Sex', os: 7, vendas: 18 },
    { day: 'Sáb', os: 3, vendas: 6 }
  ];

  const fetchRecentOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ordens_servico')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setRecentOrders(data || []);
    } catch (error) {
      console.error('Erro ao buscar ordens recentes:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as ordens de serviço recentes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const gerarNumeroOS = (numeroOS: number, dataEntrada: string | null): string => {
    if (!dataEntrada) return 'Aguardando...';
    
    const ano = new Date(dataEntrada).getFullYear();
    const ano2Digitos = ano.toString().slice(-2);
    return `OS${ano2Digitos}-${numeroOS.toString().padStart(4, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em análise': return 'bg-blue-100 text-blue-800';
      case 'Aguardando peça': return 'bg-yellow-100 text-yellow-800';
      case 'Aguardando autorização': return 'bg-orange-100 text-orange-800';
      case 'Em conserto': return 'bg-purple-100 text-purple-800';
      case 'Finalizado': return 'bg-green-100 text-green-800';
      case 'Entregue': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="felmak-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {stat.trend}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de OS por Status */}
        <Card className="felmak-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wrench className="w-5 h-5 text-felmak-blue" />
              <span>OS por Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={osStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {osStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {osStatusData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico Semanal */}
        <Card className="felmak-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="w-5 h-5 text-felmak-blue" />
              <span>Movimento Semanal</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="os" name="Ordens de Serviço" fill="#1e40af" />
                <Bar dataKey="vendas" name="Vendas" fill="#ea580c" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Últimas Ordens de Serviço */}
      <Card className="felmak-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-felmak-blue" />
            <span>Últimas Ordens de Serviço</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-felmak-blue mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando ordens de serviço...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma ordem de serviço encontrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-600">OS</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Cliente</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Equipamento</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Data</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-600">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium text-felmak-blue">
                        {gerarNumeroOS(order.numero_os, order.data_entrada)}
                      </td>
                      <td className="py-3 px-2">{order.cliente_nome}</td>
                      <td className="py-3 px-2">
                        <div>
                          <span className="font-medium">{order.equipamento_marca}</span>
                          {order.equipamento_modelo && (
                            <>
                              <br />
                              <span className="text-sm text-gray-500">{order.equipamento_modelo}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status || 'Em análise')}`}>
                          {order.status || 'Em análise'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </td>
                      <td className="py-3 px-2 font-medium">
                        R$ {(order.valor_total || 0).toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
