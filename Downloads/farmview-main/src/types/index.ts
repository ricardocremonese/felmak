
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Farm {
  id: string;
  name: string;
  address: string;
  caneType: string;
  totalArea: number;
  plantedArea: number;
  latitude: number;
  longitude: number;
  clientId: string;
  localizacao?: string;
  cep?: string; // Added cep property as string type
  createdAt: string;
  userId: string | null;
}

export interface Block {
  id: string;
  nome_bloco: string;
  fazenda_id: string;
  area_acres: number;
  area_m2: number;
  produto_usado?: string;
  data_plantio?: string;
  data_aplicacao?: string;
  proxima_colheita?: string;
  proxima_aplicacao?: string;
  cor?: string;
  quantidade_litros?: number;
  valor_produto?: number;
  created_at?: string;
  updated_at?: string;
  data_colheita?: string;
  farm_name?: string;
  farms?: {
    name: string;
  };
}

export interface Application {
  id: string;
  blockId: string;
  farmId: string;
  productName: string;
  applicationDate: string;
  nextApplicationDate: string;
  litersApplied: number;
  productValue: number;
  createdAt: string;
}

export type Language = 'en' | 'pt-BR';
