
import { useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider } from './contexts/SettingsContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Farms from "./pages/Farms";
import Applications from "./pages/Applications";
import Map from "./pages/Map";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import DashboardFarm from "./pages/DashboardFarm";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <SettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/farms" element={<Farms />} />
                <Route path="/blocks" element={<Navigate to="/farms" replace />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/map" element={<Map />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/dashboard-farm" element={<DashboardFarm />} />
              </Route>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SettingsProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;
