
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, MessageSquare, Bot, Bell, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WhatsAppSettings: React.FC = () => {
  const { toast } = useToast();
  const [autoReply, setAutoReply] = useState(true);
  const [autoReplyMessage, setAutoReplyMessage] = useState('Olá! Obrigado pelo seu contato. Nossa equipe responderá em breve.');
  const [businessHours, setBusinessHours] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [autoAssignment, setAutoAssignment] = useState(true);

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram atualizadas com sucesso!"
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Configurações do WhatsApp</h2>
        <p className="text-gray-600">
          Configure as automações e integrações do WhatsApp Business
        </p>
      </div>

      <div className="grid gap-6">
        {/* Resposta Automática */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Resposta Automática
            </CardTitle>
            <CardDescription>
              Configure mensagens automáticas para novos contatos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ativar resposta automática</Label>
                <p className="text-sm text-gray-500">
                  Enviar mensagem automática para novos contatos
                </p>
              </div>
              <Switch
                checked={autoReply}
                onCheckedChange={setAutoReply}
              />
            </div>
            
            {autoReply && (
              <div className="space-y-2">
                <Label htmlFor="auto-reply-message">Mensagem de resposta automática</Label>
                <Textarea
                  id="auto-reply-message"
                  placeholder="Digite sua mensagem automática..."
                  value={autoReplyMessage}
                  onChange={(e) => setAutoReplyMessage(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Horário de Funcionamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horário de Funcionamento
            </CardTitle>
            <CardDescription>
              Configure horários para atendimento automático
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Respeitar horário comercial</Label>
                <p className="text-sm text-gray-500">
                  Aplicar regras diferentes fora do horário comercial
                </p>
              </div>
              <Switch
                checked={businessHours}
                onCheckedChange={setBusinessHours}
              />
            </div>
            
            {businessHours && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horário de início</Label>
                  <Select defaultValue="08:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00">08:00</SelectItem>
                      <SelectItem value="09:00">09:00</SelectItem>
                      <SelectItem value="10:00">10:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Horário de término</Label>
                  <Select defaultValue="18:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="17:00">17:00</SelectItem>
                      <SelectItem value="18:00">18:00</SelectItem>
                      <SelectItem value="19:00">19:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribuição Automática */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Distribuição de Conversas
            </CardTitle>
            <CardDescription>
              Configure como as conversas são distribuídas para a equipe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Distribuição automática</Label>
                <p className="text-sm text-gray-500">
                  Distribuir conversas automaticamente para corretores
                </p>
              </div>
              <Switch
                checked={autoAssignment}
                onCheckedChange={setAutoAssignment}
              />
            </div>
            
            {autoAssignment && (
              <div className="space-y-2">
                <Label>Método de distribuição</Label>
                <Select defaultValue="round-robin">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="round-robin">Round Robin</SelectItem>
                    <SelectItem value="load-based">Baseado na carga</SelectItem>
                    <SelectItem value="availability">Por disponibilidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Webhooks e Integrações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Integrações
            </CardTitle>
            <CardDescription>
              Configure webhooks e integrações externas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">URL do Webhook</Label>
              <Input
                id="webhook-url"
                placeholder="https://seu-sistema.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                URL para receber notificações de mensagens em tempo real
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <Label>Status das Integrações</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">CRM Integration</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ativo
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Lead Automation</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ativo
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Property Alerts</span>
                  <Badge variant="outline">
                    Inativo
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Visit Scheduler</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ativo
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} className="bg-green-500 hover:bg-green-600">
            <Settings className="mr-2 h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSettings;
