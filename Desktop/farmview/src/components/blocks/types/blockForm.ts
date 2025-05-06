
import * as z from "zod";

export const formSchema = z.object({
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

export type FormValues = z.infer<typeof formSchema>;

export const products = [
  'Herbicida A',
  'Herbicida B',
  'Fertilizante X',
  'Fertilizante Y',
  'Pesticida Z',
];

export const colors = [
  { label: 'Verde', value: '#4CAF50' },
  { label: 'Amarelo', value: '#FFC107' },
  { label: 'Vermelho', value: '#F44336' },
  { label: 'Azul', value: '#2196F3' },
  { label: 'Laranja', value: '#FF9800' },
  { label: 'Roxo', value: '#9C27B0' },
  { label: 'Branco', value: '#FFFFFF' },
  { label: 'Rosa', value: '#E91E63' },
  { label: 'Turquesa', value: '#00BCD4' },
];
