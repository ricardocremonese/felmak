
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, Video, MoreVertical, Send, Paperclip, Smile, Archive, Pin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  avatar?: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isFromMe: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface WhatsAppChatProps {
  connectionType: 'twilio' | 'evolution' | null;
}

const WhatsAppChat: React.FC<WhatsAppChatProps> = ({ connectionType }) => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Ana Costa',
      phone: '+5511912345678',
      lastMessage: 'Oi! Gostaria de saber mais sobre o apartamento.',
      timestamp: '14:30',
      unreadCount: 2,
      isOnline: true
    },
    {
      id: '2',
      name: 'Roberto Martins',
      phone: '+5511923456789',
      lastMessage: 'Quando posso agendar uma visita?',
      timestamp: '13:45',
      unreadCount: 0,
      isOnline: false
    },
    {
      id: '3',
      name: 'Lucia Ferreira',
      phone: '+5511934567890',
      lastMessage: 'Obrigada pelas informações!',
      timestamp: 'Ontem',
      unreadCount: 0,
      isOnline: true
    }
  ]);
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar mensagens quando selecionar um contato
  useEffect(() => {
    if (selectedContact) {
      // Simulando carregamento de mensagens
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Olá! Vi o anúncio do apartamento na Vila Madalena.',
          timestamp: '14:25',
          isFromMe: false,
          status: 'read'
        },
        {
          id: '2',
          content: 'Oi! Obrigado pelo interesse. É um apartamento de 2 quartos com 75m².',
          timestamp: '14:26',
          isFromMe: true,
          status: 'read'
        },
        {
          id: '3',
          content: 'Gostaria de saber mais sobre o apartamento.',
          timestamp: '14:30',
          isFromMe: false,
          status: 'read'
        }
      ];
      setMessages(mockMessages);
    }
  }, [selectedContact]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isFromMe: true,
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Atualizar última mensagem do contato
    setContacts(prev => 
      prev.map(contact => 
        contact.id === selectedContact.id 
          ? { ...contact, lastMessage: newMessage, timestamp: 'Agora' }
          : contact
      )
    );

    toast({
      title: "Mensagem enviada",
      description: `Mensagem enviada para ${selectedContact.name}`,
    });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  const formatContactName = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="h-full flex bg-gray-100">
      {/* Lista de contatos - estilo WhatsApp */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header da lista */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Conversas</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Archive className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar ou começar uma nova conversa"
              className="pl-10 bg-gray-100 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de conversas */}
        <ScrollArea className="flex-1">
          <div className="divide-y divide-gray-100">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedContact?.id === contact.id ? 'bg-green-50' : ''
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-green-500 text-white">
                        {formatContactName(contact.name)}
                      </AvatarFallback>
                    </Avatar>
                    {contact.isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate">{contact.name}</h3>
                      <span className="text-xs text-gray-500">{contact.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                    <p className="text-xs text-gray-400">{contact.phone}</p>
                  </div>
                  
                  {contact.unreadCount > 0 && (
                    <Badge className="bg-green-500 text-white">
                      {contact.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedContact ? (
          <>
            {/* Header do chat */}
            <div className="bg-gray-100 p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-green-500 text-white">
                    {formatContactName(selectedContact.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedContact.name}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedContact.isOnline ? 'online' : 'offline'} • {selectedContact.phone}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="chat-bg" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"%3E%3Cg fill="%23f0f0f0" fill-opacity="0.1"%3E%3Cpolygon points="50,0 60,40 100,50 60,60 50,100 40,60 0,50 40,40"/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23chat-bg)"/%3E%3C/svg%3E")' }}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.isFromMe
                          ? 'bg-green-500 text-white rounded-br-none'
                          : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      <div className={`text-xs mt-1 flex items-center justify-end gap-1 ${
                        message.isFromMe ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        <span>{message.timestamp}</span>
                        {message.isFromMe && (
                          <div className="flex">
                            <span className={`text-xs ${
                              message.status === 'read' ? 'text-blue-300' : 'text-green-200'
                            }`}>
                              ✓✓
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input de mensagem */}
            <div className="bg-gray-100 p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5 text-gray-500" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder="Digite uma mensagem"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="bg-white border-gray-300 pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                  >
                    <Smile className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">WhatsApp Web</h3>
              <p className="text-gray-600 max-w-md">
                Selecione uma conversa para começar a enviar mensagens para seus clientes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppChat;
