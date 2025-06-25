
interface ChatwootConfig {
  apiKey: string;
  apiUrl: string;
}

interface ChatwootContact {
  id: number;
  name: string;
  phone_number: string;
  last_activity_at: string;
  last_message?: string;
  unread_count: number;
  avatar_url?: string;
}

interface ChatwootMessage {
  id: number;
  content: string;
  created_at: string;
  message_type: 'incoming' | 'outgoing';
  sender: {
    id: number;
    name: string;
  };
}

interface ChatwootConversation {
  id: number;
  contact: ChatwootContact;
  messages: ChatwootMessage[];
  status: 'open' | 'resolved' | 'pending';
}

class ChatwootService {
  private apiKey: string = '';
  private apiUrl: string = '';
  private isConnected: boolean = false;

  configure(config: ChatwootConfig): void {
    this.apiKey = config.apiKey;
    this.apiUrl = config.apiUrl;
    
    // Save to localStorage for persistence
    localStorage.setItem('chatwoot_api_key', config.apiKey);
    localStorage.setItem('chatwoot_api_url', config.apiUrl);
    
    console.log('Chatwoot configurado com sucesso');
  }

  loadConfig(): ChatwootConfig | null {
    const apiKey = localStorage.getItem('chatwoot_api_key');
    const apiUrl = localStorage.getItem('chatwoot_api_url');
    
    if (apiKey && apiUrl) {
      this.apiKey = apiKey;
      this.apiUrl = apiUrl;
      return { apiKey, apiUrl };
    }
    
    return null;
  }

  async testConnection(): Promise<boolean> {
    if (!this.apiKey || !this.apiUrl) {
      return false;
    }

    try {
      // Simulating API connection
      console.log('Testando conexão com Chatwoot');
      // Na implementação real, aqui faria uma chamada para a API do Chatwoot
      
      // Simulação de sucesso para demonstração
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Erro ao conectar com Chatwoot:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Gera um QR Code simulado para demonstração
  // Na implementação real, isso viria da API do Chatwoot
  generateQRCode(): string {
    return 'data:image/png;base64,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';
  }

  async getContacts(): Promise<ChatwootContact[]> {
    if (!this.isConnected) {
      throw new Error('Não conectado com o Chatwoot');
    }

    // Na implementação real, isso seria uma chamada à API
    // Retornando dados simulados para demonstração
    return [
      {
        id: 1,
        name: 'Maria Silva',
        phone_number: '+5511987654321',
        last_activity_at: '2023-04-03T10:30:00Z',
        last_message: 'Olá, gostaria de mais informações sobre o imóvel na Vila Mariana',
        unread_count: 2,
      },
      {
        id: 2,
        name: 'João Oliveira',
        phone_number: '+5511976543210',
        last_activity_at: '2023-04-03T09:15:00Z',
        last_message: 'Posso visitar o apartamento amanhã?',
        unread_count: 0,
      },
      {
        id: 3,
        name: 'Ana Carolina',
        phone_number: '+5511965432109',
        last_activity_at: '2023-04-02T16:45:00Z',
        last_message: 'Obrigada pelo atendimento',
        unread_count: 0,
      },
      {
        id: 4,
        name: 'Roberto Almeida',
        phone_number: '+5511954321098',
        last_activity_at: '2023-04-02T14:20:00Z',
        last_message: 'Qual o valor do condomínio?',
        unread_count: 1,
      },
      {
        id: 5,
        name: 'Fernanda Souza',
        phone_number: '+5511943210987',
        last_activity_at: '2023-04-01T11:10:00Z',
        last_message: 'Vou pensar sobre a proposta',
        unread_count: 0,
      },
    ];
  }

  async getConversation(contactId: number): Promise<ChatwootMessage[]> {
    if (!this.isConnected) {
      throw new Error('Não conectado com o Chatwoot');
    }

    // Na implementação real, isso seria uma chamada à API
    // Retornando dados simulados para demonstração
    const conversations: Record<number, ChatwootMessage[]> = {
      1: [
        {
          id: 101,
          content: 'Olá, gostaria de mais informações sobre o imóvel anunciado na Vila Mariana',
          created_at: '2023-04-03T10:20:00Z',
          message_type: 'incoming',
          sender: { id: 1, name: 'Maria Silva' },
        },
        {
          id: 102,
          content: 'Olá Maria! Claro, é um apartamento de 75m², com 2 quartos sendo 1 suíte, e 1 vaga de garagem.',
          created_at: '2023-04-03T10:25:00Z',
          message_type: 'outgoing',
          sender: { id: 99, name: 'Atendente' },
        },
        {
          id: 103,
          content: 'O valor do condomínio está incluso no aluguel?',
          created_at: '2023-04-03T10:30:00Z',
          message_type: 'incoming',
          sender: { id: 1, name: 'Maria Silva' },
        },
      ],
      2: [
        {
          id: 201,
          content: 'Boa tarde, vi o apartamento no centro e me interessei',
          created_at: '2023-04-03T09:00:00Z',
          message_type: 'incoming',
          sender: { id: 2, name: 'João Oliveira' },
        },
        {
          id: 202,
          content: 'Boa tarde João! Que bom que se interessou. Tem alguma dúvida específica?',
          created_at: '2023-04-03T09:05:00Z',
          message_type: 'outgoing',
          sender: { id: 99, name: 'Atendente' },
        },
        {
          id: 203,
          content: 'Posso visitar o apartamento amanhã?',
          created_at: '2023-04-03T09:15:00Z',
          message_type: 'incoming',
          sender: { id: 2, name: 'João Oliveira' },
        },
      ],
    };

    return conversations[contactId] || [];
  }

  async sendMessage(contactId: number, message: string): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('Não conectado com o Chatwoot');
    }

    // Na implementação real, isso seria uma chamada à API para enviar a mensagem
    console.log(`Enviando mensagem para contato ID ${contactId}: ${message}`);
    
    // Simulando envio bem-sucedido
    return true;
  }
  
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
  
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiUrl);
  }
}

// Singleton instance
const chatwootService = new ChatwootService();
export default chatwootService;
