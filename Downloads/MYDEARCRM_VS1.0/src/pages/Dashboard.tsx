import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Clock, Calendar, Users, DollarSign, ArrowRight, Home, FileText, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const leadsByStatusData = [
  { name: "Novo Lead", value: 12, color: "#3b82f6" },
  { name: "Contato Realizado", value: 8, color: "#6366f1" },
  { name: "Visita Agendada", value: 6, color: "#a855f7" },
  { name: "Proposta Enviada", value: 4, color: "#eab308" },
  { name: "Negociação", value: 3, color: "#f97316" },
  { name: "Fechado (Ganho)", value: 5, color: "#22c55e" },
  { name: "Perdido", value: 2, color: "#ef4444" },
];

const leadsMonthlyData = [
  { name: "Jan", leads: 18 },
  { name: "Fev", leads: 22 },
  { name: "Mar", leads: 25 },
  { name: "Abr", leads: 30 },
  { name: "Mai", leads: 28 },
  { name: "Jun", leads: 35 },
  { name: "Jul", leads: 40 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [nextVisit, setNextVisit] = useState<string>("Carregando...");

  const { data: leads, isLoading: isLoadingLeads } = useQuery({
    queryKey: ['leads-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: upcomingVisit } = useQuery({
    queryKey: ['upcoming-visit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          lead:leads(name),
          property:properties(title)
        `)
        .order('schedule_date', { ascending: true })
        .limit(1);
      
      if (error) throw error;
      return data[0];
    }
  });

  const getStatValue = (metricName: string) => {
    switch (metricName) {
      case 'total_leads':
        return isLoadingLeads ? "..." : leads?.toString() || "0";
      case 'converted_leads':
        return "5"; // Hardcoded for now
      case 'total_scheduled_visits':
        return "12"; // Hardcoded for now
      default:
        return "0";
    }
  };

  useEffect(() => {
    if (upcomingVisit) {
      const visitDate = new Date(upcomingVisit.schedule_date);
      const formattedDate = visitDate.toLocaleDateString('pt-BR');
      const formattedTime = visitDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setNextVisit(`Hoje, ${formattedTime}`);
    } else {
      setNextVisit("Nenhuma visita agendada");
    }
  }, [upcomingVisit]);
  
  const goToLeadsManagement = () => {
    navigate("/crm");
    toast({
      title: "Redirecionando",
      description: "Acessando a gestão de leads",
    });
  };

  const goToRegisterProperty = () => {
    navigate("/register-property");
    toast({
      title: "Redirecionando",
      description: "Acessando o cadastro de imóveis",
    });
  };
  
  const generateDashboardReport = async () => {
    toast({
      title: "Gerando relatório",
      description: "Preparando o PDF do painel principal...",
    });

    try {
      const html2canvas = await import('html2canvas').then(mod => mod.default);
      const jsPDFModule = await import('jspdf');
      
      if (dashboardRef.current) {
        const canvas = await html2canvas(dashboardRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        
        const jsPDF = jsPDFModule.default;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        const date = new Date().toLocaleDateString('pt-BR');
        pdf.save(`relatorio-painel-principal-${date}.pdf`);
        
        toast({
          title: "Relatório gerado com sucesso",
          description: "O PDF do painel principal foi criado e baixado",
        });
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Não foi possível criar o PDF do painel principal",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 ml-0 lg:ml-64 flex flex-col overflow-y-auto bg-white">
        {/* Banner temporário de acesso direto */}
        <div className="bg-yellow-50 border-b border-yellow-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-800 text-sm font-medium">🔓 Acesso Direto Temporário</span>
              <span className="text-yellow-600 text-xs">Autenticação desabilitada para testes</span>
            </div>
            <button 
              onClick={() => window.open('/login', '_blank')}
              className="text-yellow-700 hover:text-yellow-900 text-xs underline"
            >
              Ir para Login
            </button>
          </div>
        </div>

        <header className="bg-white p-4 border-b shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Painel Principal</h1>
          <p className="text-gray-500">Visão geral dos seus leads e estatísticas</p>
        </header>
        
        <div className="p-4 md:p-6 space-y-6 bg-white" ref={dashboardRef}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickStatCard 
              title="Leads Totais" 
              value={getStatValue('total_leads')} 
              icon={Users} 
              trend="+12% este mês" 
              bgColor="bg-blue-50" 
              iconColor="text-blue-500" 
            />
            <QuickStatCard 
              title="Leads Convertidos" 
              value={getStatValue('converted_leads')} 
              icon={DollarSign} 
              trend="+2 este mês" 
              bgColor="bg-green-50" 
              iconColor="text-green-500" 
            />
            <QuickStatCard 
              title="Agendamentos" 
              value={getStatValue('total_scheduled_visits')} 
              icon={Calendar} 
              trend={`Próximo: ${nextVisit}`} 
              bgColor="bg-purple-50" 
              iconColor="text-purple-500" 
            />
            <QuickStatCard 
              title="Tempo Médio de Conversão" 
              value="15 dias" 
              icon={Clock} 
              trend="-2 dias vs. último mês" 
              bgColor="bg-amber-50" 
              iconColor="text-amber-500" 
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Leads por Status</h2>
                <button 
                  className="text-sm text-blue-600 flex items-center hover:underline"
                  onClick={goToLeadsManagement}
                >
                  Ver Gestão de Leads <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadsByStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {leadsByStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} leads`, 'Quantidade']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Leads por Mês</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={leadsMonthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} leads`, 'Quantidade']} />
                    <Bar dataKey="leads" fill="#3b82f6" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ActionCard 
                title="Gestão de Leads" 
                description="Acesse o quadro Kanban para gerenciar seus leads"
                icon={Users}
                onClick={goToLeadsManagement}
              />
              <ActionCard 
                title="Cadastrar Imóvel" 
                description="Adicione novos imóveis ao seu portfólio"
                icon={Building}
                onClick={goToRegisterProperty}
              />
              <ActionCard 
                title="Gerar Relatório" 
                description="Crie relatórios detalhados de performance"
                icon={FileText}
                onClick={generateDashboardReport}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

interface QuickStatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  bgColor: string;
  iconColor: string;
}

const QuickStatCard: React.FC<QuickStatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  bgColor, 
  iconColor 
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center mb-2">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <h3 className="ml-2 text-gray-500 text-sm">{title}</h3>
      </div>
      <div className="mt-1">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{trend}</p>
      </div>
    </div>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ 
  title, 
  description, 
  icon: Icon,
  onClick 
}) => {
  return (
    <button 
      className="flex items-start p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
      onClick={onClick}
    >
      <div className="p-2 rounded-lg bg-blue-50 mr-3">
        <Icon className="h-5 w-5 text-blue-500" />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </button>
  );
};

export default Dashboard;
