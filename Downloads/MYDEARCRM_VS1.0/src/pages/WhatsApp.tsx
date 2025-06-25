import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MessageCircle, Phone } from "lucide-react";

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "h-6 w-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const WhatsApp = () => {
  const [qrLoaded, setQrLoaded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleConnectDemo = () => {
    setConnected(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Message to ${phoneNumber}: ${message}`);
    setMessage("");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6 text-realEstate-blue">WhatsApp Business Integration</h1>
        
        <Tabs defaultValue="connect" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="connect">Conexão</TabsTrigger>
            <TabsTrigger value="messaging">Mensagens</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="automation">Automação</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conectar ao WhatsApp Business</CardTitle>
                <CardDescription>
                  Conecte sua conta do WhatsApp Business para começar a enviar mensagens automatizadas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Métodos de Conexão</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-green-100 p-2 rounded-full">
                          <WhatsAppIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">WhatsApp Business API</h4>
                          <p className="text-sm text-muted-foreground">
                            Conecte diretamente usando as credenciais da API oficial.
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Configurar API
                          </Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Phone className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Código QR (Demonstração)</h4>
                          <p className="text-sm text-muted-foreground">
                            Use para fins de demonstração ou teste.
                          </p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={handleConnectDemo}>
                            Conectar via QR
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 flex flex-col items-center justify-center bg-slate-50">
                    {connected ? (
                      <div className="text-center">
                        <div className="bg-green-100 p-4 rounded-full inline-flex mb-4">
                          <WhatsAppIcon className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Conectado com Sucesso!</h3>
                        <p className="text-muted-foreground mb-4">
                          Sua integração com o WhatsApp está ativa e pronta para uso.
                        </p>
                        <Button variant="default">Gerenciar Conexão</Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                          QR Code ou detalhes de conexão aparecerão aqui.
                        </p>
                        <div className="border-2 border-dashed rounded-lg w-48 h-48 mx-auto flex items-center justify-center mb-4">
                          <span className="text-muted-foreground">QR Code</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Escaneie com o app WhatsApp Business no seu telefone
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription>
                    Para usar a API oficial do WhatsApp Business, você precisará de uma conta verificada e credenciais 
                    de acesso. Consulte a <a href="https://developers.facebook.com/docs/whatsapp/api/settings" 
                    className="underline" target="_blank" rel="noopener noreferrer">documentação oficial</a> para mais detalhes.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messaging" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enviar Mensagens</CardTitle>
                <CardDescription>
                  Envie mensagens diretamente para contatos via WhatsApp Business API.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Número de Telefone</Label>
                      <Input 
                        id="phoneNumber" 
                        placeholder="+5511999999999" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Formato internacional com código do país
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="messageType">Tipo de Mensagem</Label>
                      <select 
                        id="messageType" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      >
                        <option value="text">Texto Simples</option>
                        <option value="template">Template</option>
                        <option value="image">Imagem</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <textarea 
                      id="message" 
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      placeholder="Digite sua mensagem aqui..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Enviar Mensagem
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Templates de Mensagem</CardTitle>
                <CardDescription>
                  Gerencie e crie templates para mensagens frequentes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Funcionalidade em Desenvolvimento</h3>
                  <p className="text-muted-foreground mb-4">
                    A gestão de templates estará disponível em breve.
                  </p>
                  <Button variant="outline">Verificar Documentação</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automação de Mensagens</CardTitle>
                <CardDescription>
                  Configure regras para envio automático de mensagens.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Funcionalidade em Desenvolvimento</h3>
                  <p className="text-muted-foreground mb-4">
                    A automação de mensagens estará disponível em breve.
                  </p>
                  <Button variant="outline">Verificar Documentação</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WhatsApp;
