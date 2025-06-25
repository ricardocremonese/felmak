
import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import KanbanBoard from "../components/KanbanBoard";
import AddLeadModal from "../components/AddLeadModal";
import EditLeadModal from "../components/EditLeadModal";
import { Lead, KanbanColumn, LeadStatus } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, User } from "lucide-react";

const Index = () => {
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Define the kanban columns
  const columns: KanbanColumn[] = [
    { id: "1", title: "Novo Lead", leadIds: [] },
    { id: "2", title: "Contato Realizado", leadIds: [] },
    { id: "3", title: "Visita Agendada", leadIds: [] },
    { id: "4", title: "Proposta Enviada", leadIds: [] },
    { id: "5", title: "Negociação", leadIds: [] },
    { id: "6", title: "Fechado (Ganho)", leadIds: [] },
    { id: "7", title: "Fechado (Perdido)", leadIds: [] },
  ];

  // Fetch leads from Supabase
  const { data: leadsData, isLoading, refetch } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          property_interest:properties(*)
        `);

      if (error) throw error;

      return data?.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        status: lead.status as LeadStatus,
        propertyInterest: lead.property_interest && typeof lead.property_interest === 'object' ? {
          id: lead.property_interest.id,
          title: lead.property_interest.title,
          description: lead.property_interest.description || "",
          price: lead.property_interest.price,
          address: lead.property_interest.address,
          city: lead.property_interest.city,
          state: lead.property_interest.state || "",
          neighborhood: lead.property_interest.neighborhood || "",
          zipCode: lead.property_interest.zip_code || "",
          propertyType: lead.property_interest.type as any,
          bedrooms: lead.property_interest.bedrooms || 0,
          bathrooms: lead.property_interest.bathrooms || 0,
          area: lead.property_interest.area || 0,
          parkingSpaces: lead.property_interest.parking_spaces || 0,
          features: [],
          images: lead.property_interest.images || [],
          status: "Disponível" as any,
          transactionType: "Venda" as any,
        } : null,
        notes: lead.notes || "",
        leadSource: lead.lead_source || "",
        assignedAgent: lead.assigned_agent || "",
        createdAt: lead.created_at || new Date().toISOString(),
        lastContactDate: lead.last_contact_date || new Date().toISOString()
      })) || [];
    }
  });

  useEffect(() => {
    if (leadsData) {
      setLeads(leadsData);
    }
  }, [leadsData]);

  // Filter leads based on search term
  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  // Update columns with lead IDs based on their status
  const columnsWithLeads = columns.map(column => ({
    ...column,
    leadIds: filteredLeads.filter(lead => lead.status === column.title).map(lead => lead.id)
  }));

  const handleAddLead = async (newLead: Lead) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          status: newLead.status,
          notes: newLead.notes,
          lead_source: newLead.leadSource,
          assigned_agent: newLead.assignedAgent,
          property_interest_id: newLead.propertyInterest?.id || null,
        }])
        .select()
        .single();

      if (error) throw error;

      // Refetch leads to update the list
      await refetch();

      toast({
        title: "Lead adicionado",
        description: "Novo lead foi adicionado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao adicionar lead:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o lead",
        variant: "destructive",
      });
    }
  };

  const handleEditLead = async (updatedLead: Lead) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({
          name: updatedLead.name,
          email: updatedLead.email,
          phone: updatedLead.phone,
          status: updatedLead.status,
          notes: updatedLead.notes,
          lead_source: updatedLead.leadSource,
          assigned_agent: updatedLead.assignedAgent,
          property_interest_id: updatedLead.propertyInterest?.id || null,
          last_contact_date: new Date().toISOString(),
        })
        .eq('id', updatedLead.id);

      if (error) throw error;

      // Refetch leads to update the list
      await refetch();

      toast({
        title: "Lead atualizado",
        description: "Lead foi atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o lead",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (!confirm(`Tem certeza que deseja excluir o lead ${lead.name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', lead.id);

      if (error) throw error;

      // Refetch leads to update the list
      await refetch();

      toast({
        title: "Lead excluído",
        description: "Lead foi excluído com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao excluir lead:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o lead",
        variant: "destructive",
      });
    }
  };

  const handleLeadStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          status: newStatus,
          last_contact_date: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) throw error;

      // Update local state
      setLeads(leads.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: newStatus, lastContactDate: new Date().toISOString() }
          : lead
      ));

      toast({
        title: "Status atualizado",
        description: "Status do lead foi atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao atualizar status do lead:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do lead",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditLeadModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      <main className="flex-1 ml-0 lg:ml-64 p-4 md:p-8 bg-gray-100">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gestão de Leads</h1>
          <p className="text-gray-600 mt-1">Gerencie seus leads através do quadro Kanban</p>
        </div>
        
        {/* Botões Centralizados */}
        <div className="mb-6 flex flex-wrap justify-center gap-4">
          <Button
            onClick={() => setIsAddLeadModalOpen(true)}
            className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 px-6 py-3 font-medium shadow-md"
          >
            <Plus className="h-4 w-4" />
            Adicionar Novo Lead
          </Button>
          
          <Button
            onClick={() => {
              if (leads.length === 0) {
                toast({
                  title: "Nenhum lead",
                  description: "Adicione um lead primeiro para poder editar",
                  variant: "destructive",
                });
                return;
              }
              // Para demonstração, vou abrir o modal de edição com o primeiro lead
              // Em uma implementação real, você poderia ter uma lista de seleção
              openEditModal(leads[0]);
            }}
            variant="outline"
            className="flex items-center gap-2 px-6 py-3 font-medium border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-md"
            disabled={leads.length === 0}
          >
            <Edit className="h-4 w-4" />
            Editar Lead
          </Button>
          
          <Button
            onClick={() => {
              if (leads.length === 0) {
                toast({
                  title: "Nenhum lead",
                  description: "Não há leads para excluir",
                  variant: "destructive",
                });
                return;
              }
              // Para demonstração, vou excluir o primeiro lead
              // Em uma implementação real, você poderia ter uma lista de seleção
              handleDeleteLead(leads[0]);
            }}
            variant="destructive"
            className="flex items-center gap-2 px-6 py-3 font-medium bg-red-600 hover:bg-red-700 text-white shadow-md"
            disabled={leads.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Excluir Lead
          </Button>
        </div>

        {/* Campo de Busca */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar leads por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 shadow-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">Carregando leads...</div>
          </div>
        ) : (
          <KanbanBoard 
            columns={columnsWithLeads}
            leads={filteredLeads} 
            onAddLead={() => setIsAddLeadModalOpen(true)}
            onMoveCard={handleLeadStatusChange}
            onEditLead={openEditModal}
            onDeleteLead={handleDeleteLead}
          />
        )}

        <AddLeadModal
          isOpen={isAddLeadModalOpen}
          onClose={() => setIsAddLeadModalOpen(false)}
          onAddLead={handleAddLead}
        />

        {selectedLead && (
          <EditLeadModal
            isOpen={isEditLeadModalOpen}
            onClose={() => {
              setIsEditLeadModalOpen(false);
              setSelectedLead(null);
            }}
            onEditLead={handleEditLead}
            lead={selectedLead}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
