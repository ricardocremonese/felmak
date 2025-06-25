
export type LeadStatus = "Novo Lead" | "Contato Realizado" | "Visita Agendada" | "Proposta Enviada" | "Negociação" | "Fechado (Ganho)" | "Fechado (Perdido)";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  propertyInterest: Property | null;
  notes: string;
  leadSource: string;
  assignedAgent: string;
  createdAt: string;
  lastContactDate: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state?: string;
  neighborhood?: string;
  zipCode?: string;
  propertyType?: "Apartamento" | "Casa" | "Comercial" | "Terreno" | "Rural";
  bedrooms: number;
  bathrooms: number;
  area?: number;
  parkingSpaces?: number;
  features?: string[];
  images: string[];
  owner?: string;
  sellingPrice?: number;
  status?: "Disponível" | "Vendido" | "Alugado";
  transactionType?: "Venda" | "Aluguel" | "Ambos";
  propertyCode?: string;
  // Additional properties
  type?: string;
  squareMeters?: number;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  properties: string[]; // Array of property IDs
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  partnerType: "Corretor" | "Imobiliária";
  commissionRate: number; // Standard commission percentage (usually 6%)
  specialization: string;
  regions: string[]; // Areas of operation
  neighborhoods: string[];
  zipCodes: string[];
  activeDeals: string[]; // Array of deal IDs
  totalSales: number;
  totalCommission: number;
  completedSales: Sale[];
  licenseNumber?: string; // CRECI for individual agents or CRECI-PJ for agencies
}

export interface Sale {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  date: string;
  commission: number; // Total commission amount
  partners: string[]; // Array of partner IDs
  commissionPerPartner: number; // Commission divided by number of partners
}

export interface KanbanColumn {
  id: string;
  title: LeadStatus;
  leadIds: string[];
}

export type EmployeeRole = "Corretor" | "Financeiro" | "Recepção" | "Jurídico" | "Locação" | "Vendas" | "Manutenção";

export interface Employee {
  id: string;
  fullName: string;
  role: EmployeeRole;
  cellPhone: string;
  personalEmail: string;
  creciNumber?: string; // Optional, only for real estate agents
  photoUrl: string;
  hireDate: string;
  supervisor: string;
  login: string; // Add login field for CRM access
  password: string; // Add password field for CRM access
}
