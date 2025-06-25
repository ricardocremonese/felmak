
export default class TwilioService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;
  private baseUrl: string;

  constructor(accountSid: string, authToken: string, fromNumber: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromNumber = fromNumber;
    this.baseUrl = 'https://api.twilio.com/2010-04-01';
  }

  async testConnection(): Promise<boolean> {
    try {
      const auth = btoa(`${this.accountSid}:${this.authToken}`);
      
      const response = await fetch(`${this.baseUrl}/Accounts/${this.accountSid}.json`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conexão Twilio:', error);
      return false;
    }
  }

  async sendMessage(to: string, body: string): Promise<boolean> {
    try {
      const auth = btoa(`${this.accountSid}:${this.authToken}`);
      
      const formData = new URLSearchParams();
      formData.append('From', this.fromNumber);
      formData.append('To', `whatsapp:${to}`);
      formData.append('Body', body);

      const response = await fetch(`${this.baseUrl}/Accounts/${this.accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Mensagem enviada via Twilio:', data);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao enviar mensagem via Twilio:', error);
      return false;
    }
  }

  async getMessages(): Promise<any[]> {
    try {
      const auth = btoa(`${this.accountSid}:${this.authToken}`);
      
      const response = await fetch(`${this.baseUrl}/Accounts/${this.accountSid}/Messages.json?PageSize=50`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.messages || [];
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar mensagens do Twilio:', error);
      return [];
    }
  }

  // Método para configurar webhooks
  async setupWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const auth = btoa(`${this.accountSid}:${this.authToken}`);
      
      const formData = new URLSearchParams();
      formData.append('FriendlyName', 'MyDear CRM WhatsApp');
      formData.append('StatusCallback', webhookUrl);

      const response = await fetch(`${this.baseUrl}/Accounts/${this.accountSid}/Applications.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao configurar webhook Twilio:', error);
      return false;
    }
  }
}
