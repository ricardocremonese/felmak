
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Lead, LeadStatus, Property } from "../types";
import { supabase } from "@/integrations/supabase/client";

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditLead: (lead: Lead) => void;
  lead: Lead;
}

const EditLeadModal: React.FC<EditLeadModalProps> = ({ isOpen, onClose, onEditLead, lead }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<LeadStatus>("Novo Lead");
  const [propertyInterest, setPropertyInterest] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [assignedAgentId, setAssignedAgentId] = useState<string>("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const statusOptions: LeadStatus[] = [
    "Novo Lead", 
    "Contato Realizado", 
    "Visita Agendada", 
    "Proposta Enviada", 
    "Negociação", 
    "Fechado (Ganho)", 
    "Fechado (Perdido)"
  ];

  const leadSourceOptions = [
    "Website", 
    "Indicação", 
    "WhatsApp", 
    "Instagram", 
    "Facebook", 
    "LinkedIn", 
    "Ligação Telefônica", 
    "Visita Presencial", 
    "Outro"
  ];

  // Initialize form with lead data when modal opens
  useEffect(() => {
    if (isOpen && lead) {
      setName(lead.name);
      setEmail(lead.email);
      setPhone(lead.phone);
      setStatus(lead.status);
      setPropertyInterest(lead.propertyInterest?.id || "");
      setNotes(lead.notes);
      setLeadSource(lead.leadSource);
      fetchProperties();
      fetchAgents();
    }
  }, [isOpen, lead]);

  const validatePropertyType = (type: string | null): "Apartamento" | "Casa" | "Comercial" | "Terreno" | "Rural" | undefined => {
    if (!type) return undefined;
    
    switch (type.toLowerCase()) {
      case "apartamento":
        return "Apartamento";
      case "casa":
        return "Casa";
      case "comercial":
        return "Comercial";
      case "terreno":
        return "Terreno";
      case "rural":
        return "Rural";
      default:
        return undefined;
    }
  };

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*');

      if (error) throw error;

      if (data) {
        const mappedProperties: Property[] = data.map(property => ({
          id: property.id,
          title: property.title,
          description: property.description || "",
          price: property.price,
          address: property.address,
          city: property.city,
          state: property.state || "",
          neighborhood: property.neighborhood || "",
          zipCode: property.zip_code || "",
          propertyType: validatePropertyType(property.type),
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          area: property.area || undefined,
          parkingSpaces: property.parking_spaces || undefined,
          features: [],
          images: property.images || [],
          status: "Disponível",
          transactionType: "Venda",
        }));
        
        setProperties(mappedProperties);
      }
    } catch (error) {
      console.error("Erro ao buscar propriedades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name')
        .eq('role', 'Corretor');

      if (error) throw error;

      if (data && data.length > 0) {
        const agentsList = data.map(agent => ({ 
          id: agent.id, 
          name: agent.full_name 
        }));
        setAgents(agentsList);
        
        // Find the current agent
        const currentAgent = agentsList.find(agent => agent.name === lead.assignedAgent);
        if (currentAgent) {
          setAssignedAgentId(currentAgent.id);
        }
      } else {
        const defaultAgents = [
          { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Jane Doe' },
          { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Mark Smith' },
          { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Sarah Johnson' }
        ];
        setAgents(defaultAgents);
        
        const currentAgent = defaultAgents.find(agent => agent.name === lead.assignedAgent);
        if (currentAgent) {
          setAssignedAgentId(currentAgent.id);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar agentes:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedProperty = propertyInterest 
      ? properties.find(p => p.id === propertyInterest) || null 
      : null;

    const selectedAgent = agents.find(a => a.id === assignedAgentId);
    
    const updatedLead: Lead = {
      ...lead,
      name,
      email,
      phone,
      status,
      propertyInterest: selectedProperty,
      notes,
      leadSource,
      assignedAgent: selectedAgent?.name || "Não atribuído",
      lastContactDate: new Date().toISOString()
    };

    onEditLead(updatedLead);
    onClose();
  };

  const handleWhatsAppShare = () => {
    const propertyInfo = lead.propertyInterest 
      ? `\nInteresse: ${lead.propertyInterest.title} - R$ ${lead.propertyInterest.price.toLocaleString('pt-BR')}` 
      : '';
    
    const message = `Informações do Lead:\nNome: ${name}\nEmail: ${email}\nTelefone: ${phone}${propertyInfo}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Editar Lead</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-realEstate-blue"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-realEstate-blue"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-realEstate-blue"
                required
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-realEstate-blue"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="propertyInterest" className="block text-sm font-medium text-gray-700 mb-1">
                Interesse em Imóvel
              </label>
              <select
                id="propertyInterest"
                value={propertyInterest}
                onChange={(e) => setPropertyInterest(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-realEstate-blue"
              >
                <option value="">Nenhum</option>
                {isLoading ? (
                  <option disabled>Carregando propriedades...</option>
                ) : (
                  properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.city} - R$ {property.price.toLocaleString('pt-BR')}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="leadSource" className="block text-sm font-medium text-gray-700 mb-1">
                Origem do Lead
              </label>
              <select
                id="leadSource"
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-realEstate-blue"
              >
                <option value="">Selecionar Origem</option>
                {leadSourceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="assignedAgent" className="block text-sm font-medium text-gray-700 mb-1">
                Agente Designado
              </label>
              <select
                id="assignedAgent"
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-realEstate-blue"
              >
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-realEstate-blue"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12.043 21.806h-.004a9.866 9.866 0 01-5.032-1.378l-.36-.214-3.742.982.999-3.648-.236-.374a9.87 9.87 0 01-1.511-5.26c.003-5.45 4.437-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.884 9.884z"/>
              </svg>
              Compartilhar WhatsApp
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-realEstate-blue text-white rounded-md hover:bg-blue-700"
              >
                Atualizar Lead
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadModal;
