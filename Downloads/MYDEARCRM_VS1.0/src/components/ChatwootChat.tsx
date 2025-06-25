
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, RefreshCw, Link as LinkIcon, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import chatwootService from "@/services/ChatwootService";

interface Contact {
  id: number;
  name: string;
  phone_number: string;
  last_activity_at: string;
  last_message?: string;
  unread_count: number;
}

interface Message {
  id: number;
  content: string;
  created_at: string;
  message_type: 'incoming' | 'outgoing';
  sender: {
    id: number;
    name: string;
  };
}

const ChatwootChat: React.FC = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadContacts();
    
    // Simulando atualização em tempo real com um intervalo
    // Em uma implementação real, isso seria feito com WebSockets ou webhooks
    const interval = setInterval(() => {
      if (chatwootService.getConnectionStatus()) {
        loadContacts();
        if (selectedContact) {
          loadMessages(selectedContact);
        }
      }
    }, 30000); // A cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact);
    }
  }, [selectedContact]);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const contactList = await chatwootService.getContacts();
      setContacts(contactList);
    } catch (error) {
      console.error("Erro ao carregar contatos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contatos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (contactId: number) => {
    setIsLoadingMessages(true);
    try {
      const messageList = await chatwootService.getConversation(contactId);
      setMessages(messageList);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;
    
    try {
      const success = await chatwootService.sendMessage(selectedContact, newMessage);
      
      if (success) {
        // Simular adição da mensagem na lista (em um app real, isso viria do servidor)
        const newMsg: Message = {
          id: Date.now(),
          content: newMessage,
          created_at: new Date().toISOString(),
          message_type: 'outgoing',
          sender: { id: 99, name: 'Atendente' },
        };
        
        setMessages(prev => [...prev, newMsg]);
        setNewMessage("");
        
        toast({
          title: "Mensagem enviada",
          description: "Sua mensagem foi enviada com sucesso"
        });
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatContactName = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone_number.includes(searchTerm)
  );

  if (!chatwootService.getConnectionStatus()) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8 text-center">
          <div className="text-yellow-500 mb-4">
            <svg viewBox="0 0 24 24" className="w-16 h-16 mx-auto">
              <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Chatwoot não está conectado</h3>
          <p className="text-gray-600 mb-4">
            Por favor, acesse as configurações para conectar sua conta do Chatwoot
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-240px)]">
      {/* Lista de contatos - 1/3 da largura */}
      <Card className="p-4 h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Conversas</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" title="Adicionar contato">
              <UserPlus className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              title="Atualizar lista"
              onClick={loadContacts}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        <Input 
          placeholder="Buscar conversa" 
          className="mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <ScrollArea className="h-[calc(100%-100px)]">
          <div className="space-y-2">
            {isLoading && filteredContacts.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <RefreshCw className="h-8 w-8 mx-auto animate-spin mb-2" />
                <p>Carregando contatos...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <p>Nenhum contato encontrado</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div 
                  key={contact.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedContact === contact.id 
                      ? "bg-realEstate-blue/10" 
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedContact(contact.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <div className="bg-realEstate-blue h-full w-full flex items-center justify-center text-white">
                        {formatContactName(contact.name)}
                      </div>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium truncate">{contact.name}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(contact.last_activity_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{contact.last_message}</p>
                      <p className="text-xs text-gray-500">{contact.phone_number}</p>
                    </div>
                    {contact.unread_count > 0 && (
                      <div className="flex-shrink-0 bg-green-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                        {contact.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
      
      {/* Área de chat - 2/3 da largura */}
      <Card className="col-span-2 flex flex-col h-full">
        {selectedContact ? (
          <>
            {/* Cabeçalho do chat */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <div className="bg-realEstate-blue h-full w-full flex items-center justify-center text-white">
                    {formatContactName(contacts.find(c => c.id === selectedContact)?.name || '')}
                  </div>
                </Avatar>
                <div>
                  <h3 className="font-medium">{contacts.find(c => c.id === selectedContact)?.name}</h3>
                  <p className="text-xs text-gray-500">{contacts.find(c => c.id === selectedContact)?.phone_number}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" title="Opções de conversa">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Área de mensagens */}
            <ScrollArea className="flex-1 p-4">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Nenhuma mensagem para exibir</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex ${msg.message_type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.message_type === 'outgoing' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 text-right ${
                          msg.message_type === 'outgoing' ? 'text-green-50' : 'text-gray-500'
                        }`}>
                          {formatMessageTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            {/* Área de input */}
            <div className="p-4 border-t flex gap-2">
              <Textarea 
                placeholder="Digite sua mensagem..." 
                className="resize-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                className="bg-green-500 hover:bg-green-600"
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <svg viewBox="0 0 24 24" className="w-16 h-16 mx-auto text-green-500 mb-4">
                <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Selecione uma conversa</h3>
              <p className="text-gray-600">
                Escolha uma conversa da lista para começar a enviar mensagens
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ChatwootChat;
