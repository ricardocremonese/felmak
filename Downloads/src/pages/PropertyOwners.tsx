
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { User, Phone, Mail, Building, DollarSign } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Owner } from "@/types";

// Form schema for property owner
const propertyOwnerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido"),
  propertyType: z.enum(["Venda", "Locação"]),
  propertyName: z.string().min(3, "Nome do imóvel deve ter pelo menos 3 caracteres"),
  notes: z.string().optional(),
});

type PropertyOwnerFormValues = z.infer<typeof propertyOwnerSchema>;

const initialOwners: Owner[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@example.com",
    phone: "(11) 98765-4321",
    properties: ["1"],
  },
  {
    id: "2",
    name: "Maria Oliveira",
    email: "maria@example.com",
    phone: "(11) 91234-5678",
    properties: ["2"],
  },
];

export default function PropertyOwners() {
  const [owners, setOwners] = useState<Owner[]>(initialOwners);
  const { toast } = useToast();
  
  // Define form
  const form = useForm<PropertyOwnerFormValues>({
    resolver: zodResolver(propertyOwnerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      propertyType: "Venda",
      propertyName: "",
      notes: "",
    },
  });

  const onSubmit = (data: PropertyOwnerFormValues) => {
    // Generate a random ID
    const newId = Math.random().toString(36).substr(2, 9);
    
    // Create new owner
    const newOwner: Owner = {
      id: newId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      properties: [newId], // Just for demonstration
    };
    
    // Add to owners list
    setOwners([...owners, newOwner]);
    
    // Reset form
    form.reset();
    
    // Show success message
    toast({
      title: "Proprietário Adicionado",
      description: `${data.name} foi adicionado com sucesso.`,
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto ml-0 lg:ml-64">
        <h1 className="text-3xl font-bold mb-6">Gerenciar Proprietários</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Adicionar Proprietário</CardTitle>
              <CardDescription>
                Preencha os dados do proprietário e do imóvel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" placeholder="Nome do proprietário" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" placeholder="(00) 00000-0000" {...field} />
                          </div>
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
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" placeholder="email@exemplo.com" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Negócio</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                              <SelectTrigger className="pl-10">
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </div>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Venda">Venda</SelectItem>
                            <SelectItem value="Locação">Locação</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="propertyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imóvel</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input className="pl-10" placeholder="Nome/Identificação do imóvel" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações (opcional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Informações adicionais sobre o proprietário ou imóvel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full mt-6">Adicionar Proprietário</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* Table Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Proprietários Cadastrados</CardTitle>
              <CardDescription>
                Lista de todos os proprietários e seus imóveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Imóveis</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {owners.map((owner) => (
                      <TableRow key={owner.id}>
                        <TableCell className="font-medium">{owner.name}</TableCell>
                        <TableCell>{owner.phone}</TableCell>
                        <TableCell>{owner.email}</TableCell>
                        <TableCell>{owner.properties.length}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">Editar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {owners.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Nenhum proprietário cadastrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                Total: {owners.length} proprietários
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
