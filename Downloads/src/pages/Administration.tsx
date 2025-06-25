
import React from "react";
import { Link } from "react-router-dom";
import { Shield, Users, Briefcase, Building, Settings, UserPlus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Administration = () => {
  const adminModules = [
    {
      title: "Cadastro de Funcionários",
      description: "Gerencie funcionários, corretores e outros membros da equipe",
      icon: UserPlus,
      link: "/employee-management",
      color: "bg-blue-100"
    },
    {
      title: "Configurações da Empresa",
      description: "Ajuste configurações gerais da imobiliária",
      icon: Building,
      link: "/company-settings",
      color: "bg-green-100"
    },
    {
      title: "Permissões e Acessos",
      description: "Configure níveis de acesso e permissões",
      icon: Shield,
      link: "#",
      color: "bg-purple-100"
    },
    {
      title: "Relatórios Administrativos",
      description: "Visualize relatórios de desempenho e financeiros",
      icon: Briefcase,
      link: "/admin-reports",
      color: "bg-amber-100"
    },
    {
      title: "Configurações do Sistema",
      description: "Ajuste preferências e configurações do sistema",
      icon: Settings,
      link: "/system-config",
      color: "bg-red-100"
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6 pt-16 md:p-8 md:pt-8 ml-0 lg:ml-64">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Administração</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminModules.map((module, index) => (
            <Link to={module.link} key={index} className="transition hover:scale-105">
              <Card className="h-full border-2 hover:border-realEstate-blue hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-2`}>
                    <module.icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <CardTitle className="text-xl">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-blue-600">Acessar {module.title}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Administration;
