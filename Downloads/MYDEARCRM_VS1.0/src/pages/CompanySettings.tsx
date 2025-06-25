import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building, Mail, Phone, MapPin, User, Calendar, Upload, Search, Edit, ImageIcon } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/;
const phoneRegex = /^\(\d{2}\) \d{4,5}\-\d{4}$/;
const cepRegex = /^\d{5}\-\d{3}$/;

const FormSchema = z.object({
  companyName: z.string().min(3, "Nome da empresa deve ter pelo menos 3 caracteres"),
  cnpj: z.string().regex(cnpjRegex, "CNPJ deve seguir o formato: XX.XXX.XXX/XXXX-XX"),
  phone: z.string().regex(phoneRegex, "Telefone deve seguir o formato: (XX) XXXXX-XXXX"),
  email: z.string().email("E-mail inválido"),
  cep: z.string().regex(cepRegex, "CEP deve seguir o formato: XXXXX-XXX"),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  addressNumber: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  responsibleName: z.string().min(3, "Nome do responsável deve ter pelo menos 3 caracteres"),
  companyLogo: z.any().optional()
});

type FormValues = z.infer<typeof FormSchema>;

const CompanySettings = () => {
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [registrationDate] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [logoUploading, setLogoUploading] = useState(false);

  const mockCompanyData = {
    companyName: "Imobiliária Exemplo",
    cnpj: "12.345.678/0001-90",
    phone: "(11) 99999-8888",
    email: "contato@imobiliariaexemplo.com.br",
    cep: "12345-678",
    address: "Avenida Paulista",
    addressNumber: "1000",
    complement: "Sala 123",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    responsibleName: "João Silva",
    registrationDate: "2023-01-15",
    logo: null
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      companyName: "",
      cnpj: "",
      phone: "",
      email: "",
      cep: "",
      address: "",
      addressNumber: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      responsibleName: "",
    },
  });

  React.useEffect(() => {
    if (!isEditing) {
      form.reset({
        companyName: mockCompanyData.companyName,
        cnpj: mockCompanyData.cnpj,
        phone: mockCompanyData.phone,
        email: mockCompanyData.email,
        cep: mockCompanyData.cep,
        address: mockCompanyData.address,
        addressNumber: mockCompanyData.addressNumber,
        complement: mockCompanyData.complement,
        neighborhood: mockCompanyData.neighborhood,
        city: mockCompanyData.city,
        state: mockCompanyData.state,
        responsibleName: mockCompanyData.responsibleName,
      });
    }
  }, [form, isEditing]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoUploading(true);
      
      form.setValue('companyLogo', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setTimeout(() => {
          setLogoUploading(false);
          toast({
            title: "Logo carregado",
            description: "A logo da empresa foi carregada com sucesso!",
          });
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const searchCEP = async () => {
    const cep = form.getValues('cep')?.replace('-', '');
    
    if (!cep || cep.length !== 8) {
      toast({
        title: "CEP inválido",
        description: "Por favor, informe um CEP válido com 8 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast({
          title: "CEP não encontrado",
          description: "O CEP informado não foi encontrado.",
          variant: "destructive",
        });
      } else {
        form.setValue('address', data.logradouro);
        form.setValue('neighborhood', data.bairro);
        form.setValue('city', data.localidade);
        form.setValue('state', data.uf);
        toast({
          title: "CEP encontrado",
          description: "Endereço preenchido com sucesso!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao buscar CEP",
        description: "Ocorreu um erro ao buscar o CEP. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: FormValues) => {
    setIsLoading(true);
    
    setTimeout(() => {
      console.log("Company data:", { ...data, registrationDate });
      toast({
        title: "Configurações salvas",
        description: "As configurações da empresa foram salvas com sucesso!",
      });
      setIsLoading(false);
      setIsEditing(false);
    }, 1500);
  };

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6 pt-16 md:p-8 md:pt-8 ml-0 lg:ml-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Configurações da Empresa</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              Voltar
            </Button>
            <Button 
              variant="default"
              className="bg-realEstate-blue hover:bg-realEstate-blue/90 flex items-center gap-2"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
              Editar Dados
            </Button>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Dados da Empresa</CardTitle>
            <CardDescription>
              Informações da sua imobiliária
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo Upload */}
                  <div className="col-span-full flex flex-col items-center justify-center mb-4">
                    <div className="mb-2 text-center">
                      <h3 className="text-lg font-medium">Logo da Empresa</h3>
                      <p className="text-sm text-gray-500">Faça upload de uma imagem para representar sua imobiliária</p>
                    </div>
                    
                    <div 
                      className={cn(
                        "w-48 h-48 rounded-lg bg-gray-100 border-2 flex items-center justify-center overflow-hidden mb-4 relative",
                        isEditing && !logoPreview ? "border-dashed border-gray-300 hover:border-realEstate-blue cursor-pointer" : "border-gray-200",
                        logoUploading && "opacity-50"
                      )}
                      onClick={() => {
                        if (isEditing) {
                          document.getElementById('logo-upload')?.click();
                        }
                      }}
                    >
                      {logoUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-10">
                          <div className="animate-spin w-8 h-8 border-4 border-realEstate-blue border-t-transparent rounded-full"></div>
                        </div>
                      )}
                      
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon className="h-16 w-16 mb-2" />
                          <span className="text-sm">Sem logo</span>
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <div>
                        <Label 
                          htmlFor="logo-upload" 
                          className="cursor-pointer bg-realEstate-blue text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-realEState-blue/90"
                        >
                          <Upload className="h-4 w-4" />
                          {logoPreview ? 'Alterar Logo' : 'Upload Logo'}
                        </Label>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Formatos recomendados: JPG, PNG. Tamanho máximo: 5MB
                        </p>
                      </div>
                    )}
                    <input 
                      id="logo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleLogoChange}
                      disabled={!isEditing || logoUploading}
                    />
                  </div>

                  {/* Company Name */}
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                              <Building className="h-4 w-4" />
                            </span>
                            <Input 
                              {...field} 
                              className="rounded-l-none" 
                              placeholder="Nome da sua imobiliária" 
                              readOnly={!isEditing}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CNPJ */}
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                              <Building className="h-4 w-4" />
                            </span>
                            <Input 
                              {...field} 
                              className="rounded-l-none" 
                              placeholder="XX.XXX.XXX/XXXX-XX"
                              maxLength={18}
                              onChange={(e) => {
                                const formatted = formatCNPJ(e.target.value);
                                field.onChange(formatted);
                              }}
                              readOnly={!isEditing}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                              <Phone className="h-4 w-4" />
                            </span>
                            <Input 
                              {...field} 
                              className="rounded-l-none" 
                              placeholder="(XX) XXXXX-XXXX"
                              maxLength={15}
                              onChange={(e) => {
                                const formatted = formatPhone(e.target.value);
                                field.onChange(formatted);
                              }}
                              readOnly={!isEditing}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                              <Mail className="h-4 w-4" />
                            </span>
                            <Input 
                              {...field} 
                              className="rounded-l-none" 
                              placeholder="email@empresa.com.br" 
                              type="email" 
                              readOnly={!isEditing}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* CEP with Search */}
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                              <MapPin className="h-4 w-4" />
                            </span>
                            <Input 
                              {...field} 
                              className={cn(
                                "rounded-l-none",
                                !isEditing ? "rounded-r-md" : "rounded-r-none"
                              )} 
                              placeholder="XXXXX-XXX" 
                              maxLength={9}
                              onChange={(e) => {
                                const formatted = formatCEP(e.target.value);
                                field.onChange(formatted);
                              }}
                              readOnly={!isEditing}
                            />
                            {isEditing && (
                              <Button 
                                type="button" 
                                className="rounded-l-none"
                                onClick={searchCEP}
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <span className="animate-spin">◌</span>
                                ) : (
                                  <Search className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                              <MapPin className="h-4 w-4" />
                            </span>
                            <Input 
                              {...field} 
                              className="rounded-l-none" 
                              placeholder="Rua, Avenida, etc." 
                              readOnly={!isEditing}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address Number */}
                  <FormField
                    control={form.control}
                    name="addressNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="123" 
                            readOnly={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Complement */}
                  <FormField
                    control={form.control}
                    name="complement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Sala, Andar, etc." 
                            readOnly={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Neighborhood */}
                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Nome do bairro" 
                            readOnly={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* City */}
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Nome da cidade" 
                            readOnly={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* State */}
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="UF" 
                            maxLength={2} 
                            readOnly={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Responsible Name */}
                  <FormField
                    control={form.control}
                    name="responsibleName"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <FormLabel>Nome do Responsável</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                              <User className="h-4 w-4" />
                            </span>
                            <Input 
                              {...field} 
                              className="rounded-l-none" 
                              placeholder="Nome completo do responsável" 
                              readOnly={!isEditing}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Registration Date (Read Only) */}
                  <div className="col-span-1 md:col-span-2">
                    <Label htmlFor="registrationDate">Data de Cadastro</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                        <Calendar className="h-4 w-4" />
                      </span>
                      <Input 
                        id="registrationDate" 
                        value={mockCompanyData.registrationDate ? 
                          new Date(mockCompanyData.registrationDate).toLocaleDateString('pt-BR') :
                          new Date(registrationDate).toLocaleDateString('pt-BR')
                        } 
                        readOnly 
                        className="rounded-l-none bg-gray-50" 
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end mt-6">
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          form.reset({
                            companyName: mockCompanyData.companyName,
                            cnpj: mockCompanyData.cnpj,
                            phone: mockCompanyData.phone,
                            email: mockCompanyData.email,
                            cep: mockCompanyData.cep,
                            address: mockCompanyData.address,
                            addressNumber: mockCompanyData.addressNumber,
                            complement: mockCompanyData.complement,
                            neighborhood: mockCompanyData.neighborhood,
                            city: mockCompanyData.city,
                            state: mockCompanyData.state,
                            responsibleName: mockCompanyData.responsibleName,
                          });
                          if (!mockCompanyData.logo) {
                            setLogoPreview(null);
                          }
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isLoading || logoUploading}
                        className="bg-realEstate-blue hover:bg-realEstate-blue/90"
                      >
                        {isLoading ? (
                          <>
                            <span className="animate-spin mr-2">◌</span>
                            Salvando...
                          </>
                        ) : (
                          "Salvar Configurações"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySettings;
