
interface EmailData {
  to: string[];
  subject: string;
  html: string;
  from?: string;
}

interface PropertyData {
  id: number;
  code: string;
  title: string;
  price: number;
  type: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
}

interface ContactData {
  id: number;
  name: string;
  email: string;
  segment: string;
}

class EmailService {
  private apiKey = 're_iKTeZgXW_Dt6VyocvUiMwxFcU3VfniVk3';
  private apiUrl = 'https://api.resend.com/emails';

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private getTemplate(templateId: string, property: PropertyData, contactName: string): { subject: string; html: string } {
    const templates = {
      '1': {
        subject: "🏠 Novo Imóvel Disponível - Oportunidade Única!",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #ddd; }
                .property-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .price { font-size: 24px; font-weight: bold; color: #667eea; }
                .cta-button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; border-radius: 0 0 10px 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🏠 Novo Imóvel Disponível!</h1>
                  <p>Uma oportunidade única está esperando por você</p>
                </div>
                
                <div class="content">
                  <p>Olá <strong>${contactName}</strong>,</p>
                  
                  <p>Temos o prazer de apresentar um novo imóvel que pode ser perfeito para você. Este ${property.type.toLowerCase()} possui características únicas que certamente chamarão sua atenção.</p>
                  
                  <div class="property-card">
                    <h2>${property.title}</h2>
                    <div class="price">${this.formatCurrency(property.price)}</div>
                    <p><strong>Código:</strong> ${property.code}</p>
                    <p><strong>Tipo:</strong> ${property.type}</p>
                    ${property.bedrooms ? `<p><strong>Quartos:</strong> ${property.bedrooms}</p>` : ''}
                    ${property.bathrooms ? `<p><strong>Banheiros:</strong> ${property.bathrooms}</p>` : ''}
                    ${property.area ? `<p><strong>Área:</strong> ${property.area}m²</p>` : ''}
                  </div>
                  
                  <p>Este imóvel possui localização privilegiada e acabamento de primeira qualidade. Não perca esta oportunidade!</p>
                  
                  <a href="#" class="cta-button">Quero saber mais</a>
                  
                  <p>Entre em contato conosco para agendar uma visita ou obter mais informações.</p>
                </div>
                
                <div class="footer">
                  <p>MyDear CRM - Seu parceiro imobiliário de confiança</p>
                  <p>Este e-mail foi enviado para ${contactName}</p>
                </div>
              </div>
            </body>
          </html>
        `
      },
      '2': {
        subject: "📅 Que tal agendar uma visita ao imóvel dos seus sonhos?",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #ddd; }
                .property-highlight { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
                .visit-card { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
                .cta-button { background: #f5576c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; border-radius: 0 0 10px 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📅 Hora de Conhecer Pessoalmente!</h1>
                  <p>Agende sua visita ao imóvel dos seus sonhos</p>
                </div>
                
                <div class="content">
                  <p>Olá <strong>${contactName}</strong>,</p>
                  
                  <p>Gostaríamos de convidá-lo(a) para conhecer pessoalmente este incrível imóvel. Nada substitui a experiência de estar no local e sentir o ambiente!</p>
                  
                  <div class="property-highlight">
                    <h2>${property.title}</h2>
                    <p><strong>Valor:</strong> ${this.formatCurrency(property.price)}</p>
                    <p><strong>Código:</strong> ${property.code}</p>
                  </div>
                  
                  <div class="visit-card">
                    <h3>🏠 Visita Personalizada</h3>
                    <p>Agende uma visita com nossos especialistas e conheça cada detalhe deste imóvel excepcional.</p>
                    <p><strong>Horários disponíveis:</strong> Segunda a Sábado, das 9h às 18h</p>
                  </div>
                  
                  <p>Durante a visita, você poderá:</p>
                  <ul>
                    <li>Conhecer todos os ambientes</li>
                    <li>Tirar suas dúvidas com nossos especialistas</li>
                    <li>Avaliar a localização e vizinhança</li>
                    <li>Receber informações sobre financiamento</li>
                  </ul>
                  
                  <a href="#" class="cta-button">Agendar Visita</a>
                </div>
                
                <div class="footer">
                  <p>MyDear CRM - Realizando sonhos imobiliários</p>
                  <p>Mensagem enviada para ${contactName}</p>
                </div>
              </div>
            </body>
          </html>
        `
      },
      '3': {
        subject: "💰 Excelente Oportunidade de Investimento Imobiliário",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #ddd; }
                .investment-card { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #0ea5e9; }
                .roi-highlight { background: #dcfce7; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
                .cta-button { background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; border-radius: 0 0 10px 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>💰 Oportunidade de Investimento</h1>
                  <p>Potencial de alta rentabilidade no mercado imobiliário</p>
                </div>
                
                <div class="content">
                  <p>Caro(a) <strong>${contactName}</strong>,</p>
                  
                  <p>Identificamos uma oportunidade única no mercado imobiliário que pode gerar excelentes retornos para seu portfólio de investimentos.</p>
                  
                  <div class="investment-card">
                    <h2>🏢 ${property.title}</h2>
                    <p><strong>Investimento:</strong> ${this.formatCurrency(property.price)}</p>
                    <p><strong>Código:</strong> ${property.code}</p>
                    <p><strong>Categoria:</strong> ${property.type}</p>
                  </div>
                  
                  <div class="roi-highlight">
                    <h3>📈 Potencial de Retorno</h3>
                    <p><strong>Rentabilidade estimada:</strong> 8-12% ao ano</p>
                    <p><strong>Valorização esperada:</strong> 15-20% em 3 anos</p>
                  </div>
                  
                  <h3>Por que este é um bom investimento?</h3>
                  <ul>
                    <li><strong>Localização estratégica:</strong> Área em desenvolvimento</li>
                    <li><strong>Alta demanda:</strong> Procura crescente na região</li>
                    <li><strong>Infraestrutura:</strong> Próximo a transporte e serviços</li>
                    <li><strong>Potencial de valorização:</strong> Projetos futuros na área</li>
                  </ul>
                  
                  <p>Esta oportunidade tem disponibilidade limitada. Entre em contato conosco para uma análise detalhada do investimento.</p>
                  
                  <a href="#" class="cta-button">Analisar Investimento</a>
                </div>
                
                <div class="footer">
                  <p>MyDear CRM - Investimentos Imobiliários Inteligentes</p>
                  <p>Relatório enviado para ${contactName}</p>
                </div>
              </div>
            </body>
          </html>
        `
      }
    };

    return templates[templateId as keyof typeof templates] || templates['1'];
  }

  async sendCampaign(templateId: string, property: PropertyData, contacts: ContactData[]): Promise<boolean> {
    try {
      const promises = contacts.map(async (contact) => {
        const template = this.getTemplate(templateId, property, contact.name);
        
        const emailData: EmailData = {
          to: [contact.email],
          subject: template.subject,
          html: template.html,
          from: 'MyDear CRM <noreply@mydearcrm.com.br>'
        };

        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        });

        if (!response.ok) {
          throw new Error(`Failed to send email to ${contact.email}`);
        }

        return response.json();
      });

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error sending email campaign:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService();
