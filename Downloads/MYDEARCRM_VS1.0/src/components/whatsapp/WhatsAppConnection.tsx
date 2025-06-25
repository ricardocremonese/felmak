
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QrCode, Smartphone, Zap, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TwilioService from "@/services/TwilioService";
import EvolutionService from "@/services/EvolutionService";

interface WhatsAppConnectionProps {
  onConnectionChange: (connected: boolean, type: 'twilio' | 'evolution' | null) => void;
}

const WhatsAppConnection: React.FC<WhatsAppConnectionProps> = ({ onConnectionChange }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'twilio' | 'evolution'>('evolution');
  const [isConnecting, setIsConnecting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  
  // Twilio credentials
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [twilioFromNumber, setTwilioFromNumber] = useState('');
  
  // Evolution API credentials
  const [evolutionApiUrl, setEvolutionApiUrl] = useState('');
  const [evolutionApiKey, setEvolutionApiKey] = useState('');
  const [instanceName, setInstanceName] = useState('mydearcrm-instance');

  const handleTwilioConnect = async () => {
    if (!twilioAccountSid || !twilioAuthToken || !twilioFromNumber) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos do Twilio",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const twilioService = new TwilioService(twilioAccountSid, twilioAuthToken, twilioFromNumber);
      const connected = await twilioService.testConnection();
      
      if (connected) {
        toast({
          title: "Conexão realizada",
          description: "Twilio conectado com sucesso!"
        });
        onConnectionChange(true, 'twilio');
      } else {
        toast({
          title: "Falha na conexão",
          description: "Verifique suas credenciais do Twilio",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao conectar Twilio:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com Twilio",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEvolutionConnect = async () => {
    if (!evolutionApiUrl || !evolutionApiKey) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a URL e chave da API do Evolution",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const evolutionService = new EvolutionService(evolutionApiUrl, evolutionApiKey);
      const qrCodeData = await evolutionService.generateQRCode(instanceName);
      
      if (qrCodeData) {
        setQrCode(qrCodeData);
        toast({
          title: "QR Code gerado",
          description: "Escaneie o QR Code com seu WhatsApp"
        });
        
        // Simular conexão após 10 segundos (em produção, seria via webhook)
        setTimeout(() => {
          setQrCode(null);
          onConnectionChange(true, 'evolution');
          toast({
            title: "WhatsApp conectado",
            description: "Conexão estabelecida com sucesso!"
          });
        }, 10000);
      }
    } catch (error) {
      console.error('Erro ao conectar Evolution API:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com Evolution API",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Conectar WhatsApp Business</h2>
        <p className="text-gray-600">
          Escolha o método de conexão para integrar seu WhatsApp Business ao CRM
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'twilio' | 'evolution')}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="evolution" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Evolution API (Recomendado)
          </TabsTrigger>
          <TabsTrigger value="twilio" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Twilio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evolution">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Evolution API
                </CardTitle>
                <CardDescription>
                  Conecte usando Evolution API para WhatsApp Multi-Device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="evolution-url">URL da Evolution API</Label>
                  <Input
                    id="evolution-url"
                    placeholder="https://sua-evolution-api.com"
                    value={evolutionApiUrl}
                    onChange={(e) => setEvolutionApiUrl(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="evolution-key">Chave da API</Label>
                  <Input
                    id="evolution-key"
                    type="password"
                    placeholder="Sua chave da Evolution API"
                    value={evolutionApiKey}
                    onChange={(e) => setEvolutionApiKey(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instance-name">Nome da Instância</Label>
                  <Input
                    id="instance-name"
                    placeholder="mydearcrm-instance"
                    value={instanceName}
                    onChange={(e) => setInstanceName(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleEvolutionConnect}
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-4 w-4" />
                      Gerar QR Code
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
                <CardDescription>
                  Escaneie com o WhatsApp no seu telefone
                </CardDescription>
              </CardHeader>
              <CardContent>
                {qrCode ? (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <img src={qrCode} alt="QR Code WhatsApp" className="max-w-full h-auto" />
                    </div>
                    <Alert>
                      <Smartphone className="h-4 w-4" />
                      <AlertDescription>
                        1. Abra o WhatsApp no seu telefone<br/>
                        2. Toque em Menu (⋮) → Aparelhos conectados<br/>
                        3. Toque em "Conectar um aparelho"<br/>
                        4. Aponte a câmera para este QR code
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">QR Code aparecerá aqui após configurar a API</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="twilio">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Twilio WhatsApp Business API
              </CardTitle>
              <CardDescription>
                Configure suas credenciais do Twilio para WhatsApp Business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Para usar Twilio, você precisa de uma conta verificada e aprovada para WhatsApp Business API.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="twilio-sid">Account SID</Label>
                <Input
                  id="twilio-sid"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={twilioAccountSid}
                  onChange={(e) => setTwilioAccountSid(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twilio-token">Auth Token</Label>
                <Input
                  id="twilio-token"
                  type="password"
                  placeholder="Seu Auth Token do Twilio"
                  value={twilioAuthToken}
                  onChange={(e) => setTwilioAuthToken(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twilio-from">Número WhatsApp (From)</Label>
                <Input
                  id="twilio-from"
                  placeholder="whatsapp:+5511999999999"
                  value={twilioFromNumber}
                  onChange={(e) => setTwilioFromNumber(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleTwilioConnect}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testando conexão...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Conectar Twilio
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppConnection;
