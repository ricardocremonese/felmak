
export default class EvolutionService {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl: string, apiKey: string) {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'apikey': this.apiKey,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/instance/fetchInstances`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conexão Evolution API:', error);
      return false;
    }
  }

  async createInstance(instanceName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/instance/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          instanceName,
          token: this.apiKey,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Instância criada:', data);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      return false;
    }
  }

  async generateQRCode(instanceName: string): Promise<string | null> {
    try {
      // Primeiro, criar a instância se não existir
      await this.createInstance(instanceName);

      // Depois, buscar o QR code
      const response = await fetch(`${this.apiUrl}/instance/connect/${instanceName}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Retorna um QR code de exemplo para demonstração
        // Em produção, isso viria da resposta da API
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      }

      return null;
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
      return null;
    }
  }

  async sendMessage(instanceName: string, number: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/message/sendText/${instanceName}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          number: number,
          textMessage: {
            text: message
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Mensagem enviada via Evolution API:', data);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao enviar mensagem via Evolution API:', error);
      return false;
    }
  }

  async getInstanceStatus(instanceName: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return data.instance?.state || 'disconnected';
      }

      return 'disconnected';
    } catch (error) {
      console.error('Erro ao verificar status da instância:', error);
      return 'disconnected';
    }
  }

  async getMessages(instanceName: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiUrl}/chat/fetchAllMessages/${instanceName}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          where: {
            owner: instanceName
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.messages || [];
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }
  }

  async setupWebhook(instanceName: string, webhookUrl: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/webhook/set/${instanceName}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          url: webhookUrl,
          events: [
            'APPLICATION_STARTUP',
            'QRCODE_UPDATED',
            'CONNECTION_UPDATE',
            'MESSAGES_UPSERT',
            'SEND_MESSAGE'
          ]
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      return false;
    }
  }

  async deleteInstance(instanceName: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/instance/delete/${instanceName}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao deletar instância:', error);
      return false;
    }
  }
}
