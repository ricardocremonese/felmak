
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Copy, Globe } from "lucide-react";
import { properties } from "@/data/mockData";

// Form validation schema
const websiteFormSchema = z.object({
  fullName: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  age: z.string().regex(/^\d+$/, { message: "Idade deve ser um número" }),
  whatsapp: z.string().min(10, { message: "Número de WhatsApp inválido" }),
  email: z.string().email({ message: "E-mail inválido" }),
  bio: z.string().min(10, { message: "Biografia deve ter pelo menos 10 caracteres" }),
});

type WebsiteFormValues = z.infer<typeof websiteFormSchema>;

const AgentWebsites = () => {
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [generatedURL, setGeneratedURL] = useState<string | null>(null);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const form = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteFormSchema),
    defaultValues: {
      fullName: "",
      age: "",
      whatsapp: "",
      email: "",
      bio: "",
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties((prev) => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const onSubmit = (data: WebsiteFormValues) => {
    // In a real application, this would save the data to a database
    // and generate a real URL. For now, we'll just simulate it.
    
    // Generate a unique ID based on agent name and timestamp
    const uniqueId = data.fullName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-6);
    
    // Create a simulated URL
    const url = `https://mydear-crm.vercel.app/agentes/${uniqueId}`;
    setGeneratedURL(url);
    
    toast({
      title: "Site gerado com sucesso!",
      description: "O link para compartilhamento está disponível abaixo.",
    });
  };

  const copyToClipboard = () => {
    if (generatedURL) {
      navigator.clipboard.writeText(generatedURL);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-realEstate-blue mb-2">Sites de Corretores</h1>
          <p className="text-gray-600">
            Crie um site personalizado para divulgar seu trabalho e imóveis
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Form */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Corretor</CardTitle>
              <CardDescription>
                Preencha os dados para gerar seu site personalizado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Photo upload */}
                  <div className="space-y-2">
                    <Label htmlFor="photo">Foto de Perfil</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-gray-500 text-xs text-center px-2">Nenhuma foto selecionada</span>
                        )}
                      </div>
                      <Input 
                        id="photo" 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="João da Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idade</FormLabel>
                        <FormControl>
                          <Input placeholder="35" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input placeholder="11999999999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="joao@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biografia</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Conte um pouco sobre sua experiência como corretor..."
                            className="resize-none min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <h3 className="text-base font-medium mb-3">Selecione os imóveis para exibir</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-2 border rounded-md">
                      {properties.map((property) => (
                        <div 
                          key={property.id}
                          className={`p-2 border rounded flex items-center gap-2 cursor-pointer transition-colors ${
                            selectedProperties.includes(property.id)
                              ? "bg-realEstate-blue/10 border-realEstate-blue"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => togglePropertySelection(property.id)}
                        >
                          <input 
                            type="checkbox"
                            checked={selectedProperties.includes(property.id)}
                            onChange={() => {}}
                            className="h-4 w-4 text-realEstate-blue"
                          />
                          <div className="text-sm">
                            <p className="font-medium">{property.title}</p>
                            <p className="text-gray-500 text-xs">{property.address}, {property.city}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Gerar Site
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Right column - Preview and Share */}
          <div className="space-y-6">
            {/* Website Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Pré-visualização</CardTitle>
                <CardDescription>
                  Veja como o seu site ficará
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 overflow-auto border rounded-md bg-gray-50">
                {photoPreview || form.watch("fullName") ? (
                  <div className="p-4">
                    <div className="flex flex-col items-center mb-6 p-4 bg-white rounded-lg shadow-sm">
                      {photoPreview && (
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-realEstate-blue">
                          <img 
                            src={photoPreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}
                      <h2 className="text-2xl font-bold text-center">
                        {form.watch("fullName") || "Nome do Corretor"}
                      </h2>
                      {form.watch("age") && (
                        <p className="text-gray-600">{form.watch("age")} anos</p>
                      )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                      <h3 className="text-lg font-semibold mb-2">Sobre mim</h3>
                      <p className="text-gray-700">
                        {form.watch("bio") || "Sua biografia aparecerá aqui..."}
                      </p>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                      <h3 className="text-lg font-semibold mb-2">Contato</h3>
                      <div className="space-y-2">
                        {form.watch("whatsapp") && (
                          <p className="flex items-center gap-2">
                            <span className="bg-green-500 text-white p-1 rounded">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                            </span>
                            {form.watch("whatsapp")}
                          </p>
                        )}
                        {form.watch("email") && (
                          <p className="flex items-center gap-2">
                            <span className="bg-blue-500 text-white p-1 rounded">@</span>
                            {form.watch("email")}
                          </p>
                        )}
                      </div>
                    </div>

                    {selectedProperties.length > 0 && (
                      <div className="bg-white rounded-lg shadow-sm p-4">
                        <h3 className="text-lg font-semibold mb-4">Meus Imóveis</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {properties
                            .filter(property => selectedProperties.includes(property.id))
                            .map(property => (
                              <div key={property.id} className="border rounded-md p-3">
                                <div className="aspect-video bg-gray-200 rounded mb-2 overflow-hidden">
                                  {property.images && property.images.length > 0 ? (
                                    <img
                                      src={property.images[0]}
                                      alt={property.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-gray-400 text-sm">Sem imagem</span>
                                    </div>
                                  )}
                                </div>
                                <h4 className="font-medium">{property.title}</h4>
                                <p className="text-sm text-gray-600">{property.address}, {property.city}</p>
                                <p className="text-realEstate-blue font-bold">
                                  {new Intl.NumberFormat('pt-BR', { 
                                    style: 'currency', 
                                    currency: 'BRL' 
                                  }).format(property.price)}
                                </p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <p>Preencha o formulário para visualizar o site</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sharing section */}
            {generatedURL && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5" />
                    Link do Site
                  </CardTitle>
                  <CardDescription>
                    Compartilhe seu site com seus clientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-gray-100 rounded-md font-mono text-sm break-all">
                    {generatedURL}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={copyToClipboard} className="w-full">
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Link
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentWebsites;
