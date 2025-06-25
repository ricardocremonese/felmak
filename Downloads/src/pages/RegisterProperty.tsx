import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { 
  Building, 
  MapPin, 
  DollarSign, 
  Home, 
  Users,
  Ruler,
  FileText,
  Camera,
  HashIcon,
  BedDouble,
  Car,
  Check,
  X
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import EditPropertyDialog from "@/components/EditPropertyDialog";
import BasicInfoSection from "@/components/register-property/BasicInfoSection";

const propertyFormSchema = z.object({
  propertyCode: z.string(),
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
  type: z.string(),
  address: z.string().min(5, "O endereço deve ter pelo menos 5 caracteres"),
  number: z.string().min(1, "O número é obrigatório"),
  complement: z.string().optional(),
  floor: z.string().optional(),
  neighborhood: z.string().min(2, "O bairro deve ter pelo menos 2 caracteres"),
  city: z.string().min(2, "A cidade deve ter pelo menos 2 caracteres"),
  state: z.string().min(2, "O estado deve ter pelo menos 2 caracteres"),
  zipCode: z.string().min(8, "O CEP deve ter pelo menos 8 caracteres"),
  price: z.string().min(1, "O preço é obrigatório"),
  bedrooms: z.string(),
  bathrooms: z.string(),
  squareMeters: z.string(),
  description: z.string().min(20, "A descrição deve ter pelo menos 20 caracteres"),
  assignedPartner: z.string(),
  suites: z.string(),
  parkingSpaces: z.string(),
  hasCondominium: z.enum(["sim", "nao"]),
  iptuValue: z.string().optional(),
  condominiumValue: z.string().optional(),
  landArea: z.string().optional(),
  builtArea: z.string().optional(),
});

interface AddressFromCEP {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
}

const generatePropertyCode = (city: string, type: string): string => {
  const cityPrefix = city.substring(0, 2).toUpperCase();
  
  const typeMap: Record<string, string> = {
    "Apartment": "APT",
    "House": "CSA",
    "Commercial": "COM",
    "Land": "TER"
  };
  const typePrefix = typeMap[type] || type.substring(0, 3).toUpperCase();
  
  const randomNum = Math.floor(Math.random() * 900) + 100;
  
  return `${cityPrefix}-${typePrefix}-${randomNum}`;
};

const RegisterProperty = () => {
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPropertyId, setCurrentPropertyId] = useState<number | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string>("");

  const MAX_IMAGES = 40;

  const form = useForm<z.infer<typeof propertyFormSchema>>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      propertyCode: "",
      title: "",
      type: "Apartment",
      address: "",
      number: "",
      complement: "",
      floor: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
      price: "",
      bedrooms: "1",
      bathrooms: "1",
      squareMeters: "",
      description: "",
      assignedPartner: "",
      suites: "0",
      parkingSpaces: "0",
      hasCondominium: "nao",
      iptuValue: "",
      condominiumValue: "",
      landArea: "",
      builtArea: "",
    }
  });

  const watchedCity = form.watch("city");
  const watchedType = form.watch("type");

  useEffect(() => {
    if (!editMode && watchedCity && watchedType) {
      const newCode = generatePropertyCode(watchedCity, watchedType);
      setGeneratedCode(newCode);
      form.setValue("propertyCode", newCode);
    }
  }, [watchedCity, watchedType, editMode, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const selectedFiles = Array.from(e.target.files);

    const newImagesCount = images.length + selectedFiles.length;
    if (newImagesCount > MAX_IMAGES) {
      toast({
        title: "Limite de fotos excedido!",
        description: `O máximo permitido é ${MAX_IMAGES} fotos por imóvel.`,
        variant: "destructive",
      });
      // Adiciona apenas o número de arquivos restantes até o limite
      const availableSlots = MAX_IMAGES - images.length;
      if (availableSlots <= 0) return;
      const filesToAdd = selectedFiles.slice(0, availableSlots);
      setImages(prev => [...prev, ...filesToAdd]);
      const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
      return;
    }

    setImages(prev => [...prev, ...selectedFiles]);
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const fetchAddressFromCEP = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      return;
    }

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);
      const data = await response.json();
      
      if (response.ok) {
        form.setValue('address', data.street || '');
        form.setValue('neighborhood', data.neighborhood || '');
        form.setValue('city', data.city || '');
        form.setValue('state', data.state || '');
        
        toast({
          title: "CEP encontrado",
          description: "Endereço preenchido automaticamente."
        });
      } else {
        toast({
          title: "Erro ao buscar CEP",
          description: data.message || "CEP não encontrado",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching CEP:", error);
      toast({
        title: "Erro ao buscar CEP",
        description: "Ocorreu um erro ao buscar o CEP. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleCepBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value;
    if (cep && cep.length >= 8) {
      fetchAddressFromCEP(cep);
    }
  };

  const handlePropertySelect = (property: any) => {
    setEditMode(true);
    setCurrentPropertyId(property.id);
    
    form.reset({
      propertyCode: property.propertyCode || "",
      title: property.title,
      type: "Apartment",
      address: property.address.split(',')[0].trim(),
      number: property.address.split(',')[1]?.trim() || "",
      complement: "",
      floor: "",
      neighborhood: "Centro",
      city: property.city,
      state: "SP",
      zipCode: "01001-000",
      price: "500000",
      bedrooms: "2",
      bathrooms: "1",
      squareMeters: "80",
      description: "Imóvel muito bem localizado, próximo a todos os serviços essenciais, com excelente acabamento e vista privilegiada.",
      assignedPartner: "partner1",
      landArea: "",
      builtArea: "",
    });
    
    setImages([]);
    setPreviewImages([]);
  };

  const onSubmit = (values: z.infer<typeof propertyFormSchema>) => {
    console.log("Form submitted:", values);
    console.log("Images:", images);
    console.log("Edit mode:", editMode, "Property ID:", currentPropertyId);

    if (editMode) {
      toast({
        title: "Imóvel atualizado com sucesso!",
        description: "As alterações foram salvas."
      });
    } else {
      toast({
        title: "Imóvel cadastrado com sucesso!",
        description: `O imóvel foi cadastrado com o código ${values.propertyCode} e está pronto para ser listado.`
      });
    }

    form.reset();
    setImages([]);
    setPreviewImages([]);
    setEditMode(false);
    setCurrentPropertyId(null);
    setGeneratedCode("");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 pt-24 md:pl-72 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-realEstate-blue mr-3" />
              <h1 className="text-2xl font-bold text-gray-800">
                {editMode ? 'Editar Imóvel' : 'Cadastrar Imóvel'}
              </h1>
            </div>
            <EditPropertyDialog onPropertySelect={handlePropertySelect} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <BasicInfoSection form={form} />

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Localização
                  </h2>
                  
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ex: 12345-678" 
                            {...field} 
                            onBlur={handleCepBlur}
                            disabled={isLoadingCep}
                          />
                        </FormControl>
                        {isLoadingCep && <p className="text-xs text-gray-500">Buscando CEP...</p>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Rua das Flores" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="complement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Complemento</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Bloco A" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="floor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Andar</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Centro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: São Paulo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: SP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                    <Ruler className="h-5 w-5 mr-2" />
                    Detalhes do Imóvel
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Ex: 500000" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quartos</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6].map(num => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Banheiros</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map(num => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="suites"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <BedDouble className="w-4 h-4" />
                            Suítes
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min={0}
                              placeholder="Ex: 1"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="parkingSpaces"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Car className="w-4 h-4" />
                            Vagas
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min={0}
                              placeholder="Ex: 2"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hasCondominium"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Condomínio completo?
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-4 mt-2">
                              <label className="flex items-center gap-1 text-sm cursor-pointer">
                                <input
                                  type="radio"
                                  value="sim"
                                  checked={field.value === "sim"}
                                  onChange={() => field.onChange("sim")}
                                  className="accent-green-500"
                                />
                                <span className="flex items-center gap-1 text-green-600">
                                  <Check className="w-4 h-4" /> Sim
                                </span>
                              </label>
                              <label className="flex items-center gap-1 text-sm cursor-pointer">
                                <input
                                  type="radio"
                                  value="nao"
                                  checked={field.value === "nao"}
                                  onChange={() => field.onChange("nao")}
                                  className="accent-red-500"
                                />
                                <span className="flex items-center gap-1 text-red-500">
                                  <X className="w-4 h-4" /> Não
                                </span>
                              </label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="iptuValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor do IPTU (opcional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="Ex: 1200"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="condominiumValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor do Condomínio (opcional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              placeholder="Ex: 800"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="squareMeters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área (m²)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Ex: 100" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o imóvel com detalhes..." 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Fotos do Imóvel
                  </h2>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="property-images"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={images.length >= MAX_IMAGES}
                    />
                    <label
                      htmlFor="property-images"
                      className={`cursor-pointer flex flex-col items-center justify-center ${images.length >= MAX_IMAGES ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <Camera className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        Clique para adicionar fotos do imóvel
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Formatos aceitos: JPG, PNG, GIF (Máximo 10MB cada) <br />
                        {`Selecionadas: ${images.length} / ${MAX_IMAGES}`}
                      </p>
                    </label>
                  </div>

                  {previewImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {previewImages.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="h-24 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Corretor Responsável
                  </h2>
                  
                  <FormField
                    control={form.control}
                    name="assignedPartner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parceiro Responsável</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o parceiro responsável" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="partner1">João Silva (Corretor)</SelectItem>
                            <SelectItem value="partner2">Maria Oliveira (Corretora)</SelectItem>
                            <SelectItem value="partner3">Imobiliária Central</SelectItem>
                            <SelectItem value="partner4">Imóveis Premium</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-4">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => {
                      form.reset();
                      setEditMode(false);
                      setCurrentPropertyId(null);
                      setImages([]);
                      setPreviewImages([]);
                      setGeneratedCode("");
                    }}
                  >
                    {editMode ? 'Cancelar' : 'Limpar'}
                  </Button>
                  <Button type="submit" className="bg-realEstate-blue hover:bg-realE Estate-blue/90">
                    {editMode ? 'Salvar Alterações' : 'Cadastrar Imóvel'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterProperty;
