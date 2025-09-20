
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthGate } from "@/components/auth/AuthGate";
import Dashboard from "./components/Dashboard";
import Loja from "./components/Loja";
import Estoque from "./components/Estoque";
import AssistenciaTecnica from "./components/AssistenciaTecnica";
import Contabilidade from "./components/Contabilidade";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthGate>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/loja" element={<Loja />} />
              <Route path="/estoque" element={<Estoque />} />
              <Route path="/assistencia" element={<AssistenciaTecnica />} />
              <Route path="/locacao" element={<div className="p-8 text-center text-gray-600">Módulo de Locação em desenvolvimento...</div>} />
              <Route path="/contabilidade" element={<Contabilidade />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthGate>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
