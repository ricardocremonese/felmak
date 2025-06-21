
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  FileText, 
  Printer, 
  MessageCircle, 
  Camera,
  Save,
  Eye,
  Edit,
  Filter
} from 'lucide-react';
import NovaOSForm from './assistencia/NovaOSForm';
import ConsultaOS from './assistencia/ConsultaOS';
import { useToast } from '@/hooks/use-toast';

const AssistenciaTecnica = () => {
  const [activeTab, setActiveTab] = useState('nova-os');
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assistência Técnica</h1>
          <p className="text-gray-600">Gerenciamento de Ordens de Serviço</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setActiveTab('nova-os')}
            className="bg-felmak-blue hover:bg-felmak-blue-dark"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova OS
          </Button>
          <Button 
            variant="outline"
            onClick={() => setActiveTab('consulta')}
          >
            <Search className="w-4 h-4 mr-2" />
            Consultar OS
          </Button>
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nova-os">Nova Ordem de Serviço</TabsTrigger>
          <TabsTrigger value="consulta">Consultar/Editar OS</TabsTrigger>
        </TabsList>

        <TabsContent value="nova-os" className="space-y-6">
          <NovaOSForm />
        </TabsContent>

        <TabsContent value="consulta" className="space-y-6">
          <ConsultaOS />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssistenciaTecnica;
