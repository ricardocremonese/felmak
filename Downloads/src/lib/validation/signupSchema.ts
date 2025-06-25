
import * as z from "zod";

// Schema de validação
export const formSchema = z.object({
  fullName: z.string().min(3, { message: "Nome precisa ter pelo menos 3 caracteres" }),
  personType: z.enum(["fisica", "juridica"], {
    required_error: "Selecione o tipo de pessoa",
  }),
  document: z.string().refine(
    (val) => {
      // CPF: 11 dígitos numéricos
      // CNPJ: 14 dígitos numéricos
      return /^\d+$/.test(val) && (val.length === 11 || val.length === 14);
    },
    {
      message: "Documento inválido. CPF deve ter 11 dígitos e CNPJ 14 dígitos, apenas números.",
    }
  ),
  email: z.string().email({ message: "Email inválido" }),
  whatsapp: z.string().refine(
    (val) => /^\(\d{2}\)\s\d{5}-\d{4}$/.test(val),
    {
      message: "WhatsApp deve seguir o formato (00) 00000-0000",
    }
  ),
  password: z.string().min(6, { message: "Senha precisa ter pelo menos 6 caracteres" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

export type FormData = z.infer<typeof formSchema>;
