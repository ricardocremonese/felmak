
import React, { useState } from "react";
import { Mail, Send, Users, FileText, Building2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const emailTemplates = [
  {
    id: 1,
    name: "Lançamento de Imóvel",
    subject: "🏠 Novo Imóvel Disponível - Oportunidade Única!",
    category: "Lançamento",
    description: "Template para divulgar novos imóveis disponíveis",
    preview: "Prezado(a) {nome}, temos o prazer de apresentar um novo imóvel que pode ser perfeito para você..."
  },
  {
    id: 2,
    name: "Convite para Visita",
    subject: "📅 Que tal agendar uma visita ao imóvel dos seus sonhos?",
    category: "Convite",
    description: "Template para convidar clientes para visitas",
    preview: "Olá {nome}! Gostaríamos de convidá-lo(a) para conhecer pessoalmente este incrível imóvel..."
  },
  {
    id: 3,
    name: "Oportunidade de Investimento",
    subject: "💰 Excelente Oportunidade de Investimento Imobiliário",
    category: "Investimento",
    description: "Template para investidores e oportunidades de negócio",
    preview: "Caro(a) investidor(a), identificamos uma oportunidade única no mercado imobiliário..."
  }
];

const mockProperties = [
  { id: 1, code: "AP001", title: "Apartamento Moderno Vila Madalena", price: 850000, type: "Apartamento" },
  { id: 2, code: "CA001", title: "Casa Jardins com Piscina", price: 1200000, type: "Casa" },
  { id: 3, code: "AP002", title: "Cobertura Itaim Bibi", price: 2100000, type: "Apartamento" }
];

const mockContacts = [
  { id: 1, name: "Ana Costa", email: "ana.costa@email.com", segment: "Compradores" },
  { id: 2, name: "Roberto Martins", email: "roberto.martins@email.com", segment: "Investidores" },
  { id: 3, name: "Lucia Ferreira", email: "lucia.ferreira@email.com", segment: "Leads" }
];

const EmailMarketing = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCampaign = async () => {
    if (!selectedTemplate || !selectedProperty) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um template e um imóvel antes de enviar",
        variant: "destructive"
      });
      return;
    }

    if (selectedContacts.length === 0) {
      toast({
        title: "Nenhum contato selecionado",
        description: "Selecione pelo menos um contato para enviar a campanha",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulação do envio de e-mail via Resend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Campanha enviada com sucesso!",
        description: `E-mails enviados para ${selectedContacts.length} contato(s)`,
      });

      // Reset form
      setSelectedTemplate("");
      setSelectedProperty("");
      setSelectedContacts([]);
    } catch (error) {
      toast({
        title: "Erro ao enviar campanha",
        description: "Tente novamente em alguns minutos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-realEstate-blue mb-2">E-mail Marketing</h1>
          <p className="text-gray-600">
            Envie campanhas personalizadas para seus leads e clientes
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuração da Campanha */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Templates de E-mail
                </CardTitle>
                <CardDescription>
                  Escolha um template para sua campanha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emailTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate === template.id.toString()
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedTemplate(template.id.toString())}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{template.name}</h3>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <p className="text-xs text-gray-500 italic">{template.preview}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Selecionar Imóvel
                </CardTitle>
                <CardDescription>
                  Escolha o imóvel que será destacado no e-mail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um imóvel" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProperties.map((property) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{property.code} - {property.title}</span>
                          <span className="text-sm text-gray-500">
                            {property.type} - {formatCurrency(property.price)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Seleção de Contatos */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Lista de Contatos
                </CardTitle>
                <CardDescription>
                  Selecione os contatos que receberão a campanha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedContacts.includes(contact.id.toString())
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => toggleContact(contact.id.toString())}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-gray-600">{contact.email}</p>
                        </div>
                        <Badge variant="outline">{contact.segment}</Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Resumo da Campanha</span>
                    <Badge variant="secondary">
                      {selectedContacts.length} contato(s) selecionado(s)
                    </Badge>
                  </div>
                  
                  {selectedTemplate && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Template:</strong> {emailTemplates.find(t => t.id.toString() === selectedTemplate)?.name}
                    </p>
                  )}
                  
                  {selectedProperty && (
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Imóvel:</strong> {mockProperties.find(p => p.id.toString() === selectedProperty)?.title}
                    </p>
                  )}

                  <Button 
                    onClick={handleSendCampaign}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Campanha
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">E-mails Enviados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">247</div>
              <p className="text-sm text-gray-600">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Taxa de Abertura</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">68%</div>
              <p className="text-sm text-gray-600">Média mensal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Cliques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">42</div>
              <p className="text-sm text-gray-600">Este mês</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailMarketing;
