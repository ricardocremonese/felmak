
import React from 'react';
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

const Dashboard = () => {
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

  const recentOrders = [
    {
      id: "OS-2024-001",
      cliente: "João Silva",
      equipamento: "Furadeira DeWalt DCD771",
      status: "Em Análise",
      data: "2024-01-15",
      valor: "R$ 85,00"
    },
    {
      id: "OS-2024-002", 
      cliente: "Maria Santos",
      equipamento: "Esmerilhadeira Bosch GWS 850",
      status: "Aguardando Peça",
      data: "2024-01-14",
      valor: "R$ 120,00"
    },
    {
      id: "OS-2024-003",
      cliente: "Pedro Costa",
      equipamento: "Martelete Makita HR2470",
      status: "Finalizado",
      data: "2024-01-13",
      valor: "R$ 200,00"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Análise': return 'bg-blue-100 text-blue-800';
      case 'Aguardando Peça': return 'bg-yellow-100 text-yellow-800';
      case 'Autorizado': return 'bg-green-100 text-green-800';
      case 'Finalizado': return 'bg-gray-100 text-gray-800';
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
                    <td className="py-3 px-2 font-medium text-felmak-blue">{order.id}</td>
                    <td className="py-3 px-2">{order.cliente}</td>
                    <td className="py-3 px-2">{order.equipamento}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-2">{new Date(order.data).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-2 font-medium">{order.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
