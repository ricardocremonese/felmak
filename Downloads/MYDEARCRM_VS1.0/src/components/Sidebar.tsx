
import React, { useState } from "react";
import { Home, Users, House, Calendar, FileText, DollarSign, Eye, Menu, X, Building, UserPlus, Shield, Rocket, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  className
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return <>
      <button onClick={toggleMobileSidebar} className="lg:hidden fixed top-4 left-4 z-30 bg-white p-2 rounded-md shadow-md">
        <Menu className="h-6 w-6 text-realEstate-darkGray" />
      </button>

      {isMobileOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={toggleMobileSidebar} />}

      <aside className={cn("fixed top-0 left-0 h-full bg-white z-50 transition-all duration-300 shadow-xl flex flex-col", isCollapsed ? "w-20" : "w-64", isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0", className)}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center justify-center">
            {isCollapsed ? <img src="/lovable-uploads/de09eb36-aec8-4470-ad20-b73f7384abf9.png" alt="MyDear CRM Logo" className="h-10 w-10 object-contain" /> : <img src="/lovable-uploads/de09eb36-aec8-4470-ad20-b73f7384abf9.png" alt="MyDear CRM Logo" className="h-16 w-auto object-contain" />}
          </div>
          <div className="flex">
            <button onClick={toggleSidebar} className="hidden lg:block">
              {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </button>
            <button onClick={toggleMobileSidebar} className="lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="mb-6">
            <h2 className={cn("text-sm font-semibold text-gray-500 mb-2", isCollapsed && "text-center text-xs")}>
              {isCollapsed ? "GEREN" : "Gerenciamento"}
            </h2>
            <ul className="space-y-2">
              <SidebarItem icon={Home} text="Painel Principal" isCollapsed={isCollapsed} isActive={location.pathname === "/dashboard"} to="/dashboard" />
              <SidebarItem icon={Users} text="Gestão de Leads" isCollapsed={isCollapsed} isActive={location.pathname === "/crm"} to="/crm" />
              <SidebarItem icon={House} text="Gerenciar Proprietários" isCollapsed={isCollapsed} isActive={location.pathname === "/property-owners"} to="/property-owners" />
              <SidebarItem icon={Users} text="Gerenciar Parceiros" isCollapsed={isCollapsed} isActive={location.pathname === "/partners"} to="/partners" />
              <SidebarItem icon={Building} text="Cadastrar Imóveis" isCollapsed={isCollapsed} isActive={location.pathname === "/register-property"} to="/register-property" />
              <SidebarItem icon={WhatsAppIcon} text="WhatsApp" isCollapsed={isCollapsed} isActive={location.pathname === "/whatsapp"} to="/whatsapp" />
              <SidebarItem icon={Rocket} text="Marketing" isCollapsed={isCollapsed} isActive={location.pathname.startsWith("/marketing")} to="/marketing" />
              <SidebarItem icon={Shield} text="Administração" isCollapsed={isCollapsed} isActive={location.pathname === "/administration" || location.pathname === "/employee-management"} to="/administration" />
            </ul>
          </div>

          <div className="mb-6">
            <h2 className={cn("text-sm font-semibold text-gray-500 mb-2", isCollapsed && "text-center text-xs")}>
              {isCollapsed ? "FUNC" : "Funções Principais"}
            </h2>
            <ul className="space-y-2">
              <SidebarItem icon={Calendar} text="Agendar Visitas" isCollapsed={isCollapsed} isActive={location.pathname === "/schedule-visit"} to="/schedule-visit" />
              <SidebarItem icon={FileText} text="Gerar PDFs" isCollapsed={isCollapsed} isActive={location.pathname === "/generate-pdf"} to="/generate-pdf" />
              <SidebarItem icon={DollarSign} text="Comissões" isCollapsed={isCollapsed} to="#" />
              <SidebarItem icon={Eye} text="Ver Imóveis" isCollapsed={isCollapsed} isActive={location.pathname === "/view-properties"} to="/view-properties" />
            </ul>
          </div>

          <div className="mt-auto">
            <button onClick={handleLogout} className={cn("w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors", isCollapsed ? "justify-center" : "justify-start")}>
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">Sair</span>}
            </button>
          </div>
        </nav>
      </aside>
    </>;
};

const WhatsAppIcon: React.FC<{
  className?: string;
}> = ({
  className = "h-5 w-5"
}) => <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>;

interface SidebarItemProps {
  icon: React.ElementType | React.FC<{
    className?: string;
  }>;
  text: string;
  isCollapsed: boolean;
  isActive?: boolean;
  to: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  text,
  isCollapsed,
  isActive = false,
  to
}) => {
  return <li>
      <Link to={to} className={cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-realEstate-blue/10 text-realEstate-blue" : "text-gray-700 hover:bg-gray-100", isCollapsed ? "justify-center" : "space-x-3")}>
        <Icon className="h-5 w-5" />
        {!isCollapsed && <span>{text}</span>}
      </Link>
    </li>;
};

export default Sidebar;
