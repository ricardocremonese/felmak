import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ModernLogin from "./pages/ModernLogin";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import PropertyOwners from "./pages/PropertyOwners";
import Partners from "./pages/Partners";
import RegisterProperty from "./pages/RegisterProperty";
import ScheduleVisit from "./pages/ScheduleVisit";
import GeneratePDF from "./pages/GeneratePDF";
import ViewProperties from "./pages/ViewProperties";
import WhatsAppCRM from "./pages/WhatsAppCRM";
import AgentWebsites from "./pages/AgentWebsites";
import SocialMediaContent from "./pages/SocialMediaContent";
import Administration from "./pages/Administration";
import EmployeeManagement from "./pages/EmployeeManagement";
import CompanySettings from "./pages/CompanySettings";
import AdminReports from "./pages/AdminReports";
import SystemConfig from "./pages/SystemConfig";
import NotFound from "./pages/NotFound";
import Marketing from "./pages/Marketing";
import Ads from "./pages/Ads";
import EmailMarketing from "./pages/EmailMarketing";
import CreateDemoUser from "./pages/CreateDemoUser";
import DemoSetup from "./pages/DemoSetup";

const queryClient = new QueryClient();

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<ModernLogin />} />
                <Route path="/create-demo-user" element={<CreateDemoUser />} />
                <Route path="/demo-setup" element={<DemoSetup />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/crm" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/property-owners" element={<ProtectedRoute><PropertyOwners /></ProtectedRoute>} />
                <Route path="/partners" element={<ProtectedRoute><Partners /></ProtectedRoute>} />
                <Route path="/register-property" element={<ProtectedRoute><RegisterProperty /></ProtectedRoute>} />
                <Route path="/schedule-visit" element={<ProtectedRoute><ScheduleVisit /></ProtectedRoute>} />
                <Route path="/generate-pdf" element={<ProtectedRoute><GeneratePDF /></ProtectedRoute>} />
                <Route path="/view-properties" element={<ProtectedRoute><ViewProperties /></ProtectedRoute>} />
                <Route path="/whatsapp" element={<ProtectedRoute><WhatsAppCRM /></ProtectedRoute>} />
                <Route path="/agent-websites" element={<ProtectedRoute><AgentWebsites /></ProtectedRoute>} />
                <Route path="/marketing" element={<ProtectedRoute><Marketing /></ProtectedRoute>} />
                <Route path="/marketing/social-media" element={<ProtectedRoute><SocialMediaContent /></ProtectedRoute>} />
                <Route path="/marketing/email" element={<ProtectedRoute><EmailMarketing /></ProtectedRoute>} />
                <Route path="/marketing/ads" element={<ProtectedRoute><Ads /></ProtectedRoute>} />
                <Route path="/administration" element={<ProtectedRoute><Administration /></ProtectedRoute>} />
                <Route path="/employee-management" element={<ProtectedRoute><EmployeeManagement /></ProtectedRoute>} />
                <Route path="/company-settings" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
                <Route path="/admin-reports" element={<ProtectedRoute><AdminReports /></ProtectedRoute>} />
                <Route path="/system-config" element={<ProtectedRoute><SystemConfig /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
