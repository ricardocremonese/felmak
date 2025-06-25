import { Lead, Property, Owner, Partner, KanbanColumn, LeadStatus } from "../types";

// Mock Properties
export const properties: Property[] = [
  {
    id: "prop1",
    title: "Apartamento Moderno no Centro",
    address: "Rua Principal, 123, Apto 4B",
    city: "São Paulo",
    price: 750000,
    bedrooms: 2,
    bathrooms: 2,
    squareMeters: 95,
    description: "Apartamento deslumbrante com vista para a cidade, cozinha moderna e banheiros reformados.",
    images: ["/placeholder.svg", "/placeholder.svg"],
    type: "Apartment",
    owner: "owner1"
  },
  {
    id: "prop2",
    title: "Casa Familiar Espaçosa",
    address: "Avenida dos Carvalhos, 456",
    city: "Rio de Janeiro",
    price: 1250000,
    bedrooms: 4,
    bathrooms: 3,
    squareMeters: 220,
    description: "Linda casa familiar com grande quintal, cozinha renovada e quartos espaçosos.",
    images: ["/placeholder.svg", "/placeholder.svg"],
    type: "House",
    owner: "owner2"
  },
  {
    id: "prop3",
    title: "Escritório no Centro",
    address: "Praça Comercial, 789, Sala 300",
    city: "Curitiba",
    price: 850000,
    bedrooms: 0,
    bathrooms: 2,
    squareMeters: 150,
    description: "Escritório em localização privilegiada com comodidades modernas e salas de conferência.",
    images: ["/placeholder.svg", "/placeholder.svg"],
    type: "Commercial",
    owner: "owner3"
  },
  {
    id: "prop4",
    title: "Apartamento na Praia",
    address: "Avenida Oceânica, 101, Unidade 7",
    city: "Salvador",
    price: 950000,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 120,
    description: "Espetacular apartamento à beira-mar com vistas panorâmicas do oceano e comodidades de resort.",
    images: ["/placeholder.svg", "/placeholder.svg"],
    type: "Apartment",
    owner: "owner2"
  },
  {
    id: "prop5",
    title: "Terreno para Desenvolvimento",
    address: "Estrada Rural, 5",
    city: "Belo Horizonte",
    price: 500000,
    bedrooms: 0,
    bathrooms: 0,
    squareMeters: 10000,
    description: "Terreno para desenvolvimento com serviços disponíveis na entrada da propriedade.",
    images: ["/placeholder.svg", "/placeholder.svg"],
    type: "Land",
    owner: "owner1"
  }
];

// Mock Owners (normally these contact details would be protected)
export const owners: Owner[] = [
  {
    id: "owner1",
    name: "João Silva",
    email: "joao.silva@exemplo.com",
    phone: "(11) 98765-4321",
    properties: ["prop1", "prop5"]
  },
  {
    id: "owner2",
    name: "Maria Garcia",
    email: "maria.garcia@exemplo.com",
    phone: "(21) 99876-5432",
    properties: ["prop2", "prop4"]
  },
  {
    id: "owner3",
    name: "Roberto Souza",
    email: "roberto.souza@exemplo.com",
    phone: "(41) 97654-3210",
    properties: ["prop3"]
  }
];

// Mock Partners
export const partnersData: Partner[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 99999-1111",
    partnerType: "Corretor",
    commissionRate: 6,
    specialization: "Imóveis de Luxo",
    regions: ["Zona Sul", "Zona Oeste"],
    neighborhoods: ["Jardins", "Itaim", "Moema"],
    zipCodes: ["01000-000", "01100-000"],
    activeDeals: ["deal1", "deal2"],
    totalSales: 8,
    totalCommission: 480000,
    completedSales: []
  },
  {
    id: "2",
    name: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    phone: "(11) 99999-2222",
    partnerType: "Corretor",
    commissionRate: 6,
    specialization: "Imóveis Comerciais",
    regions: ["Centro", "Zona Norte"],
    neighborhoods: ["Bela Vista", "Consolação", "República"],
    zipCodes: ["01310-000", "01301-000"],
    activeDeals: ["deal3"],
    totalSales: 5,
    totalCommission: 320000,
    completedSales: []
  }
];

// Mock Leads
export const leads: Lead[] = [
  {
    id: "lead1",
    name: "Emma Thompson",
    email: "emma.thompson@exemplo.com",
    phone: "(11) 91111-2222",
    status: "Visita Agendada",
    propertyInterest: properties[0],
    notes: "Interessada em apartamentos modernos com vista para a cidade. Possui pré-aprovação de financiamento.",
    leadSource: "Website",
    assignedAgent: "Jane Doe",
    createdAt: "2023-05-10T14:30:00Z",
    lastContactDate: "2023-05-15T10:00:00Z"
  },
  {
    id: "lead2",
    name: "David Wilson",
    email: "david.wilson@exemplo.com",
    phone: "(21) 93333-4444",
    status: "Novo Lead",
    propertyInterest: properties[1],
    notes: "Procurando uma casa familiar em um bom distrito escolar. Orçamento até R$1,5M.",
    leadSource: "Indicação",
    assignedAgent: "Jane Doe",
    createdAt: "2023-05-12T09:15:00Z",
    lastContactDate: "2023-05-12T09:15:00Z"
  },
  {
    id: "lead3",
    name: "Carlos Rodriguez",
    email: "carlos.rodriguez@exemplo.com",
    phone: "(41) 95555-6666",
    status: "Proposta Enviada",
    propertyInterest: properties[2],
    notes: "Interessado em espaço para escritório para startup em crescimento. Precisa de espaço para 15 funcionários.",
    leadSource: "LinkedIn",
    assignedAgent: "Mark Smith",
    createdAt: "2023-05-01T11:45:00Z",
    lastContactDate: "2023-05-14T13:20:00Z"
  },
  {
    id: "lead4",
    name: "Sophia Lee",
    email: "sophia.lee@exemplo.com",
    phone: "(11) 97777-8888",
    status: "Negociação",
    propertyInterest: properties[3],
    notes: "Muito interessada em propriedade à beira-mar. Fez oferta inicial abaixo do preço pedido.",
    leadSource: "Instagram",
    assignedAgent: "Mark Smith",
    createdAt: "2023-04-28T16:00:00Z",
    lastContactDate: "2023-05-16T15:30:00Z"
  },
  {
    id: "lead5",
    name: "James Brown",
    email: "james.brown@exemplo.com",
    phone: "(21) 99999-0000",
    status: "Contato Realizado",
    propertyInterest: properties[4],
    notes: "Desenvolvedor procurando terreno para novo projeto residencial. Precisa de informações de zoneamento.",
    leadSource: "WhatsApp",
    assignedAgent: "Jane Doe",
    createdAt: "2023-05-14T10:30:00Z",
    lastContactDate: "2023-05-15T09:45:00Z"
  },
  {
    id: "lead6",
    name: "Olivia Martinez",
    email: "olivia.martinez@exemplo.com",
    phone: "(11) 98765-4321",
    status: "Fechado (Ganho)",
    propertyInterest: properties[0],
    notes: "Comprou propriedade com sucesso com 15% de entrada. Fechamento marcado para 15 de junho.",
    leadSource: "Facebook",
    assignedAgent: "Mark Smith",
    createdAt: "2023-03-22T13:15:00Z",
    lastContactDate: "2023-05-10T11:00:00Z"
  },
  {
    id: "lead7",
    name: "William Taylor",
    email: "william.taylor@exemplo.com",
    phone: "(21) 98765-4321",
    status: "Fechado (Perdido)",
    propertyInterest: properties[1],
    notes: "Decidiu comprar com outra agência. Acompanhar em 6 meses para oportunidades futuras.",
    leadSource: "Website",
    assignedAgent: "Jane Doe",
    createdAt: "2023-04-05T09:30:00Z",
    lastContactDate: "2023-05-08T14:15:00Z"
  }
];

// Define the Kanban columns and assign leads to them
export const kanbanColumns: KanbanColumn[] = [
  {
    id: "col1",
    title: "Novo Lead",
    leadIds: leads.filter(lead => lead.status === "Novo Lead").map(lead => lead.id)
  },
  {
    id: "col2",
    title: "Contato Realizado",
    leadIds: leads.filter(lead => lead.status === "Contato Realizado").map(lead => lead.id)
  },
  {
    id: "col3",
    title: "Visita Agendada",
    leadIds: leads.filter(lead => lead.status === "Visita Agendada").map(lead => lead.id)
  },
  {
    id: "col4",
    title: "Proposta Enviada",
    leadIds: leads.filter(lead => lead.status === "Proposta Enviada").map(lead => lead.id)
  },
  {
    id: "col5",
    title: "Negociação",
    leadIds: leads.filter(lead => lead.status === "Negociação").map(lead => lead.id)
  },
  {
    id: "col6",
    title: "Fechado (Ganho)",
    leadIds: leads.filter(lead => lead.status === "Fechado (Ganho)").map(lead => lead.id)
  },
  {
    id: "col7",
    title: "Fechado (Perdido)",
    leadIds: leads.filter(lead => lead.status === "Fechado (Perdido)").map(lead => lead.id)
  }
];

// Helper function to get column color
export const getColumnColor = (columnTitle: LeadStatus): string => {
  switch (columnTitle) {
    case "Novo Lead":
      return "bg-blue-100 border-blue-200";
    case "Contato Realizado":
      return "bg-indigo-100 border-indigo-200";
    case "Visita Agendada":
      return "bg-purple-100 border-purple-200";
    case "Proposta Enviada":
      return "bg-yellow-100 border-yellow-200";
    case "Negociação":
      return "bg-orange-100 border-orange-200";
    case "Fechado (Ganho)":
      return "bg-green-100 border-green-200";
    case "Fechado (Perdido)":
      return "bg-red-100 border-red-200";
    default:
      return "bg-gray-100 border-gray-200";
  }
};

// Helper function to get lead status badge color
export const getStatusColor = (status: LeadStatus): string => {
  switch (status) {
    case "Novo Lead":
      return "bg-blue-100 text-blue-800";
    case "Contato Realizado":
      return "bg-indigo-100 text-indigo-800";
    case "Visita Agendada":
      return "bg-purple-100 text-purple-800";
    case "Proposta Enviada":
      return "bg-yellow-100 text-yellow-800";
    case "Negociação":
      return "bg-orange-100 text-orange-800";
    case "Fechado (Ganho)":
      return "bg-green-100 text-green-800";
    case "Fechado (Perdido)":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
