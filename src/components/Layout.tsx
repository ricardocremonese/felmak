import React, { useState } from 'react';
import { BarChart3, Store, Package, Wrench, Calendar, Calculator, Menu, X, Home } from 'lucide-react';
import { useLocation } from 'react-router-dom';
interface LayoutProps {
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const menuItems = [{
    icon: BarChart3,
    label: 'Dashboard',
    path: '/'
  }, {
    icon: Store,
    label: 'Loja',
    path: '/loja'
  }, {
    icon: Package,
    label: 'Estoque',
    path: '/estoque'
  }, {
    icon: Wrench,
    label: 'Assistência Técnica',
    path: '/assistencia'
  }, {
    icon: Calendar,
    label: 'Locação',
    path: '/locacao'
  }, {
    icon: Calculator,
    label: 'Contabilidade',
    path: '/contabilidade'
  }];
  const isActivePath = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  return <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 
        felmak-gradient transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header with image */}
          <div className="flex items-center justify-between p-4 border-b border-blue-700">
            <img alt="Ferramentas Elétricas" src="/lovable-uploads/b2469a9b-f2af-4031-93df-e8d816f90603.png" className="w-full h-auto max-h-16 object-contain" />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white hover:bg-blue-700 p-1 rounded ml-2 flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = isActivePath(item.path);
            return <a key={item.path} href={item.path} className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                    ${isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white'}
                  `} onClick={() => setSidebarOpen(false)}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>;
          })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-blue-700">
            <div className="text-blue-200 text-xs text-center">
              <p>São Bernardo do Campo</p>
              <p>Há mais de 20 anos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {menuItems.find(item => isActivePath(item.path))?.label || 'FELMAK'}
              </h2>
            </div>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 overflow-auto bg-white">
          {children}
        </main>
      </div>
    </div>;
};
export default Layout;
