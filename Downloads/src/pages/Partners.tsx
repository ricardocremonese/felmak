import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Users, Search, Plus, PlusCircle, 
  Edit, Trash2, MapPin, Mail, Phone 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Partner, Sale } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import PartnerForm, { formSchema } from "@/components/partners/PartnerForm";
import PartnerTable from "@/components/partners/PartnerTable";
import PartnerSalesHistory from "@/components/partners/PartnerSalesHistory";

const mockPartners: Partner[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@example.com",
    phone: "(11) 98765-4321",
    partnerType: "Corretor",
    commissionRate: 6,
    specialization: "Imóveis residenciais",
    regions: ["Zona Sul", "Zona Oeste"],
    neighborhoods: ["Itaim", "Moema", "Pinheiros"],
    zipCodes: ["04538-132", "04522-000"],
    activeDeals: ["deal1", "deal2"],
    totalSales: 3,
    totalCommission: 72000,
    licenseNumber: "123456-F",
    completedSales: [
      {
        id: "sale1",
        propertyId: "prop1",
        propertyTitle: "Apartamento em Moema",
        propertyPrice: 800000,
        date: "2023-01-15",
        commission: 48000,
        partners: ["1"],
        commissionPerPartner: 48000
      },
      {
        id: "sale2",
        propertyId: "prop2",
        propertyTitle: "Casa em Pinheiros",
        propertyPrice: 1200000,
        date: "2023-03-22",
        commission: 72000,
        partners: ["1", "3"],
        commissionPerPartner: 36000
      }
    ]
  },
  {
    id: "2",
    name: "Imobiliária Central",
    email: "contato@imobiliariacentral.com",
    phone: "(11) 3456-7890",
    partnerType: "Imobiliária",
    commissionRate: 6,
    specialization: "Imóveis comerciais e residenciais",
    regions: ["Zona Sul", "Zona Norte", "Centro"],
    neighborhoods: ["Jardins", "Higienópolis", "Centro"],
    zipCodes: ["01311-000", "01422-000", "01310-100"],
    activeDeals: ["deal3"],
    totalSales: 5,
    totalCommission: 120000,
    licenseNumber: "J-98765",
    completedSales: []
  },
  {
    id: "3",
    name: "Maria Oliveira",
    email: "maria.oliveira@example.com",
    phone: "(11) 97654-3210",
    partnerType: "Corretor",
    commissionRate: 6,
    specialization: "Imóveis de alto padrão",
    regions: ["Zona Sul"],
    neighborhoods: ["Jardins", "Vila Nova Conceição"],
    zipCodes: ["01453-000", "04511-000"],
    activeDeals: [],
    totalSales: 2,
    totalCommission: 54000,
    licenseNumber: "456789-F",
    completedSales: [
      {
        id: "sale3",
        propertyId: "prop3",
        propertyTitle: "Apartamento em Vila Nova Conceição",
        propertyPrice: 1500000,
        date: "2023-02-10",
        commission: 90000,
        partners: ["3", "1"],
        commissionPerPartner: 45000
      }
    ]
  }
];

const Partners = () => {
  const { toast } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [activeTab, setActiveTab] = useState("partners");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      partnerType: "Corretor",
      specialization: "",
      regions: "",
      neighborhoods: "",
      zipCodes: "",
      commissionRate: 6,
      licenseNumber: ""
    }
  });

  useEffect(() => {
    async function fetchPartners() {
      setLoading(true);
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        toast({
          title: "Erro ao carregar parceiros",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      setPartners(
        (data || []).map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          phone: p.phone,
          partnerType: p.partner_type === "Corretor" ? "Corretor" : "Imobiliária",
          commissionRate: Number(p.commission_rate),
          specialization: p.specialization || "",
          regions: Array.isArray(p.regions) ? p.regions : [],
          neighborhoods: Array.isArray(p.neighborhoods) ? p.neighborhoods : [],
          zipCodes: Array.isArray(p.zip_codes) ? p.zip_codes : [],
          licenseNumber: p.license_number || "",
          activeDeals: [],
          totalSales: 0,
          totalCommission: 0,
          completedSales: []
        }))
      );
      setLoading(false);
    }
    fetchPartners();
  }, []);

  const watchPartnerType = form.watch("partnerType");

  const handleAddPartner = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);

    const partnerPayload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      partner_type: data.partnerType,
      specialization: data.specialization || "",
      regions: data.regions.split(",").map((item) => item.trim()).filter(Boolean),
      neighborhoods: data.neighborhoods.split(",").map((item) => item.trim()).filter(Boolean),
      zip_codes: data.zipCodes.split(",").map((item) => item.trim()).filter(Boolean),
      commission_rate: data.commissionRate,
      license_number: data.licenseNumber || ""
    };

    try {
      if (selectedPartner) {
        const { error, data: updated } = await supabase
          .from("partners")
          .update(partnerPayload)
          .eq("id", selectedPartner.id)
          .select()
          .single();
        if (error) throw error;
        setPartners((prev) =>
          prev.map((partner) =>
            partner.id === selectedPartner.id
              ? {
                  ...partner,
                  ...{
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    partnerType: data.partnerType,
                    specialization: data.specialization || "",
                    regions: data.regions.split(",").map((item) => item.trim()).filter(Boolean),
                    neighborhoods: data.neighborhoods.split(",").map((item) => item.trim()).filter(Boolean),
                    zipCodes: data.zipCodes.split(",").map((item) => item.trim()).filter(Boolean),
                    commissionRate: data.commissionRate,
                    licenseNumber: data.licenseNumber || ""
                  }
                }
              : partner
          )
        );
        toast({
          title: "Parceiro atualizado",
          description: `${data.name} foi atualizado com sucesso.`
        });
      } else {
        const { data: inserted, error } = await supabase
          .from("partners")
          .insert(partnerPayload)
          .select()
          .single();
        if (error) throw error;
        setPartners((prev) => [
          {
            id: inserted.id,
            name: inserted.name,
            email: inserted.email,
            phone: inserted.phone,
            partnerType: inserted.partner_type === "Corretor" ? "Corretor" : "Imobiliária",
            commissionRate: Number(inserted.commission_rate),
            specialization: inserted.specialization || "",
            regions: Array.isArray(inserted.regions) ? inserted.regions : [],
            neighborhoods: Array.isArray(inserted.neighborhoods) ? inserted.neighborhoods : [],
            zipCodes: Array.isArray(inserted.zip_codes) ? inserted.zip_codes : [],
            licenseNumber: inserted.license_number || "",
            activeDeals: [],
            totalSales: 0,
            totalCommission: 0,
            completedSales: []
          },
          ...prev
        ]);
        toast({
          title: "Parceiro adicionado",
          description: `${data.name} foi adicionado com sucesso.`
        });
      }
      setIsDialogOpen(false);
      form.reset();
      setSelectedPartner(null);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar parceiro",
        description: error.message || "Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    form.reset({
      name: partner.name,
      email: partner.email,
      phone: partner.phone,
      partnerType: partner.partnerType,
      specialization: partner.specialization,
      regions: partner.regions.join(", "),
      neighborhoods: partner.neighborhoods.join(", "),
      zipCodes: partner.zipCodes.join(", "),
      commissionRate: partner.commissionRate,
      licenseNumber: partner.licenseNumber || ""
    });
    setIsDialogOpen(true);
  };

  const handleDeletePartner = async (id: string) => {
    setLoading(true);
    try {
      await supabase.from("partners").delete().eq("id", id);
      setPartners(partners.filter((partner) => partner.id !== id));
      toast({
        title: "Parceiro removido",
        description: "O parceiro foi removido com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover parceiro",
        description: error.message || "Remoção falhou.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openNewPartnerDialog = () => {
    form.reset({
      name: "",
      email: "",
      phone: "",
      partnerType: "Corretor",
      specialization: "",
      regions: "",
      neighborhoods: "",
      zipCodes: "",
      commissionRate: 6,
      licenseNumber: ""
    });
    setSelectedPartner(null);
    setIsDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden pl-0 lg:pl-64">
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Parceiros</h1>
              <p className="text-gray-500">Corretores e imobiliárias parceiras</p>
            </div>
            <Button onClick={openNewPartnerDialog} className="self-start md:self-auto bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Novo Parceiro
            </Button>
          </div>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="partners">Lista de Parceiros</TabsTrigger>
              <TabsTrigger value="sales">Histórico de Vendas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="partners" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle>Parceiros</CardTitle>
                      <CardDescription>
                        Gerencie corretores e imobiliárias parceiras.
                      </CardDescription>
                    </div>
                    <div className="flex items-center border rounded-md px-3 py-2 w-full sm:w-auto">
                      <Search className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                      <Input 
                        placeholder="Buscar parceiros..." 
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <PartnerTable
                    partners={partners}
                    onEdit={handleEditPartner}
                    onDelete={handleDeletePartner}
                    formatCurrency={formatCurrency}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sales" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Vendas</CardTitle>
                  <CardDescription>
                    Visualize todas as vendas e comissões divididas entre parceiros.
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <PartnerSalesHistory
                    partners={partners}
                    formatCurrency={formatCurrency}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <PartnerForm
            form={form}
            onSubmit={handleAddPartner}
            isSubmitting={loading}
            onCancel={() => setIsDialogOpen(false)}
            selectedPartnerName={selectedPartner?.name}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Partners;
