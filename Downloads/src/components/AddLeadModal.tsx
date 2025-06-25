
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Lead, LeadStatus, Property } from "../types";
import { supabase } from "@/integrations/supabase/client";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Lead) => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onAddLead }) => {
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

  // Fetch properties from Supabase when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProperties();
      fetchAgents();
      resetForm();
    }
  }, [isOpen]);

  // Helper function to convert string propertyType to valid enum type
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
          features: [], // Default empty array since this field doesn't exist in Supabase
          images: property.images || [],
          status: "Disponível", // Default status since this field doesn't exist in Supabase
          transactionType: "Venda", // Default transaction type since this field doesn't exist in Supabase
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
        setAgents(data.map(agent => ({ 
          id: agent.id, 
          name: agent.full_name 
        })));
        // Set default agent to first one
        setAssignedAgentId(data[0].id);
      } else {
        // If no agents found in database, create some default ones
        setAgents([
          { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Jane Doe' },
          { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Mark Smith' },
          { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Sarah Johnson' }
        ]);
        setAssignedAgentId('550e8400-e29b-41d4-a716-446655440000');
      }
    } catch (error) {
      console.error("Erro ao buscar agentes:", error);
      // Default fallback
      setAgents([
        { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Jane Doe' },
        { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Mark Smith' },
        { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Sarah Johnson' }
      ]);
      setAssignedAgentId('550e8400-e29b-41d4-a716-446655440000');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedProperty = propertyInterest 
      ? properties.find(p => p.id === propertyInterest) || null 
      : null;

    const selectedAgent = agents.find(a => a.id === assignedAgentId);
    
    const newLead: Lead = {
      id: `lead${Date.now()}`, // Temporary ID, will be replaced by Supabase
      name,
      email,
      phone,
      status,
      propertyInterest: selectedProperty,
      notes,
      leadSource,
      assignedAgent: selectedAgent?.name || "Não atribuído",
      createdAt: new Date().toISOString(),
      lastContactDate: new Date().toISOString()
    };

    onAddLead(newLead);
    onClose();
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setStatus("Novo Lead");
    setPropertyInterest("");
    setNotes("");
    setLeadSource("");
    // Set default agent ID if available
    if (agents.length > 0) {
      setAssignedAgentId(agents[0].id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Adicionar Novo Lead</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="grid gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome *
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
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-realEState-blue"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-realEState-blue"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-realEState-blue"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-realEState-blue"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-realEState-blue"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-realEState-blue"
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
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-realEState-blue"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
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
              Adicionar Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;
