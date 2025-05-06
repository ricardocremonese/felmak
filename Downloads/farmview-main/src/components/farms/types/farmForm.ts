
import * as z from "zod";
import { FormValues } from "../../blocks/types/blockForm";

export interface FarmFormData {
  name: string;
  address: string;
  cane_type: string;
  total_area: string;
  planted_area: string;
  latitude: string;
  longitude: string;
  client_id: string;
  localizacao: string;
  cep: string;
}

export const formSchema = z.object({
  // Farm fields
  name: z.string().min(1, "Nome da fazenda é obrigatório"),
  address: z.string().optional(),
  cane_type: z.string().optional(),
  total_area: z.number().min(0.01, "Área total deve ser maior que 0"),
  planted_area: z.number().min(0.01, "Área plantada deve ser maior que 0"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  client_id: z.string().optional(),
  localizacao: z.string().optional(),
  cep: z.string().optional(),
  
  // Block fields
  nome_bloco: z.string().min(1, "Nome do bloco é obrigatório"),
  area_acres: z.number().min(0.01, "Área deve ser maior que 0"),
  area_m2: z.number().min(0.01, "Área deve ser maior que 0"),
  produto_usado: z.string().min(1, "Produto é obrigatório"),
  quantidade_litros: z.number().min(0.01, "Quantidade deve ser maior que 0"),
  valor_produto: z.number().min(0.01, "Valor deve ser maior que 0"),
  data_plantio: z.string().min(1, "Data de plantio é obrigatória"),
  data_aplicacao: z.string().min(1, "Data de aplicação é obrigatória"),
  data_colheita: z.string().optional(),
  proxima_colheita: z.string().optional(),
  proxima_aplicacao: z.string().optional(),
  cor: z.string().min(1, "Cor é obrigatória"),
});

export interface CreateFarmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFarmCreated: () => void;
}

export interface EditFarmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FarmFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onSave: () => void;
  isSubmitting: boolean;
}

export interface FarmFormFieldsProps {
  formData: FarmFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onLocationSelect: (location: string, lat: string, lon: string) => void;
  onZipCodeSelect: (location: string, lat: string, lon: string, cep: string) => void;
}

export type BlockFormFields = {
  nome_bloco: string;
  area_acres: number;
  area_m2: number;
  produto_usado: string;
  quantidade_litros: number;
  valor_produto: number;
  data_plantio: string;
  data_aplicacao: string;
  data_colheita?: string;
  proxima_colheita?: string;
  proxima_aplicacao?: string;
  cor: string;
};
