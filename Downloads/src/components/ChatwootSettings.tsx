
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Check, AlertTriangle } from "lucide-react";
import chatwootService from "@/services/ChatwootService";

interface ChatwootSettingsProps {
  onConnectionStatusChange: (connected: boolean) => void;
}

const ChatwootSettings: React.FC<ChatwootSettingsProps> = ({ onConnectionStatusChange }) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Carregar configurações salvas
    const savedConfig = chatwootService.loadConfig();
    if (savedConfig) {
      setApiKey(savedConfig.apiKey);
      setApiUrl(savedConfig.apiUrl);
      
      // Verificar se a conexão está ativa
      checkConnection();
    }
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const connected = await chatwootService.testConnection();
      setIsConnected(connected);
      onConnectionStatusChange(connected);
    } catch (error) {
      console.error("Erro ao verificar conexão:", error);
      setIsConnected(false);
      onConnectionStatusChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!apiKey || !apiUrl) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha a chave da API e a URL do Chatwoot",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Configurar o serviço com as credenciais
      chatwootService.configure({
        apiKey,
        apiUrl,
      });
      
      // Testar a conexão
      const connected = await chatwootService.testConnection();
      
      if (connected) {
        toast({
          title: "Conexão realizada",
          description: "Chatwoot conectado com sucesso!"
        });
        setIsConnected(true);
        onConnectionStatusChange(true);
      } else {
        toast({
          title: "Falha na conexão",
          description: "Não foi possível conectar com o Chatwoot. Verifique suas credenciais.",
          variant: "destructive",
        });
        setIsConnected(false);
        onConnectionStatusChange(false);
      }
    } catch (error) {
      console.error("Erro ao conectar:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao conectar com o Chatwoot",
        variant: "destructive",
      });
      setIsConnected(false);
      onConnectionStatusChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configurações do Chatwoot</CardTitle>
        <CardDescription>
          Conecte seu Chatwoot para gerenciar suas conversas de WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-url">URL do Chatwoot</Label>
          <Input
            id="api-url"
            placeholder="https://seu-chatwoot.com.br"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Ex: https://app.chatwoot.com ou seu domínio personalizado
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="api-key">Chave da API</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Sua chave da API do Chatwoot"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Encontre sua chave da API nas configurações da sua conta Chatwoot
          </p>
        </div>
        
        {isConnected && (
          <div className="flex items-center p-2 bg-green-50 text-green-700 rounded-md">
            <Check className="h-5 w-5 mr-2" />
            <span>Conectado ao Chatwoot</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isConnected ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={checkConnection}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Verificar conexão
          </Button>
        ) : (
          <Button
            onClick={handleConnect}
            className="w-full"
            disabled={isLoading || !apiKey || !apiUrl}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Conectar ao Chatwoot
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ChatwootSettings;
