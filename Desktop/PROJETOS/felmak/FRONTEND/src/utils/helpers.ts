// Utilitários para o sistema FELMAK

// Formatação de moeda brasileira
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Formatação de data brasileira
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
};

// Formatação de telefone brasileiro
export const formatarTelefone = (telefone: string): string => {
  const numero = telefone.replace(/\D/g, '');
  
  if (numero.length <= 10) {
    return numero.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    return numero.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

// Formatação de CPF/CNPJ
export const formatarCPFCNPJ = (valor: string): string => {
  const numero = valor.replace(/\D/g, '');
  
  if (numero.length <= 11) {
    // CPF
    return numero.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else {
    // CNPJ
    return numero.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
};

// Busca CEP via ViaCEP
export const buscarCEP = async (cep: string) => {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }
    
    return {
      logradouro: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      uf: data.uf,
      cep: data.cep
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    throw error;
  }
};

// Gerar link do WhatsApp
export const gerarLinkWhatsApp = (telefone: string, mensagem: string): string => {
  const telefoneFormatado = telefone.replace(/\D/g, '');
  const mensagemCodificada = encodeURIComponent(mensagem);
  return `https://wa.me/55${telefoneFormatado}?text=${mensagemCodificada}`;
};

// Gerar mensagem padrão de OS para WhatsApp
export const gerarMensagemOS = (cliente: string, equipamento: string, numeroOS: string, status: string): string => {
  return `🔧 *FELMAK - Ferramentas Elétricas*

Olá ${cliente}!

Sua Ordem de Serviço foi atualizada:

📋 *OS:* ${numeroOS}
🔧 *Equipamento:* ${equipamento}
📊 *Status:* ${status}

Para mais informações, entre em contato conosco.

🏪 *FELMAK - São Bernardo do Campo*
📞 Há mais de 20 anos cuidando das suas ferramentas!`;
};

// Validar código de barras
export const validarCodigoBarras = (codigo: string): boolean => {
  return codigo.length >= 8 && /^[A-Z0-9-]+$/.test(codigo);
};

// Calcular margem de lucro
export const calcularMargem = (valorCusto: number, valorVenda: number): number => {
  if (valorCusto === 0) return 0;
  return ((valorVenda - valorCusto) / valorCusto) * 100;
};

// Gerar código de produto automático
export const gerarCodigoProduto = (fabricante: string, categoria: string): string => {
  const prefixoFabricante = fabricante.substring(0, 2).toUpperCase();
  const prefixoCategoria = categoria.substring(0, 3).toUpperCase();
  const numero = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  
  return `${prefixoFabricante}-${prefixoCategoria}-${numero}`;
};

// Status de estoque
export const getStatusEstoque = (quantidade: number) => {
  if (quantidade === 0) return { nivel: 'sem-estoque', cor: 'red', texto: 'Sem Estoque' };
  if (quantidade <= 5) return { nivel: 'baixo', cor: 'yellow', texto: 'Estoque Baixo' };
  if (quantidade <= 20) return { nivel: 'normal', cor: 'green', texto: 'Em Estoque' };
  return { nivel: 'alto', cor: 'blue', texto: 'Estoque Alto' };
};

// Formatação de moeda com parsing para input
export const parseCurrencyValue = (formattedValue: string): number => {
  // Remove o símbolo de moeda e espaços, substitui vírgula por ponto
  const cleanValue = formattedValue
    .replace('R$', '')
    .replace(/\s/g, '')
    .replace(/\./g, '') // Remove pontos de milhares
    .replace(',', '.'); // Substitui vírgula decimal por ponto
  
  return parseFloat(cleanValue) || 0;
};

// Formatação de input de moeda em tempo real
export const formatCurrencyInput = (value: string): string => {
  // Remove tudo que não é número
  const numericValue = value.replace(/\D/g, '');
  
  // Converte para número dividindo por 100 para ter centavos
  const numberValue = parseInt(numericValue) / 100;
  
  // Formata como moeda brasileira
  return numberValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};
