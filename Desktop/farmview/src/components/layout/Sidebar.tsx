
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Home,
  Droplets,
  Map,
  FileText,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

const Sidebar = ({ open = true, setOpen }: SidebarProps) => {
  const { t } = useTranslation();

  const navItems = [
    {
      path: '/',
      label: t('menu.dashboard'),
      icon: LayoutDashboard,
    },
    {
      path: '/clients',
      label: t('menu.clients'),
      icon: Users,
    },
    {
      path: '/farms',
      label: t('menu.farms'),
      icon: Home,
    },
    {
      path: '/applications',
      label: t('menu.applications'),
      icon: Droplets,
    },
    {
      path: '/map',
      label: t('menu.map'),
      icon: Map,
    },
    {
      path: '/reports',
      label: t('menu.reports'),
      icon: FileText,
    },
    {
      path: '/settings',
      label: t('menu.settings'),
      icon: Settings,
    },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border bg-background",
        !open && "-translate-x-full",
        "transition-transform duration-300 ease-in-out"
      )}
    >
      <nav className="flex flex-col px-2 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "group flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary hover:text-foreground",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground"
              )
            }
            onClick={() => setOpen?.(false)}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
