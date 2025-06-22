import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { User, Phone, Mail, MapPin, Wrench, Calendar, DollarSign, FileText, Clock, Printer } from 'lucide-react';
import { formatarTelefone } from '@/utils/helpers';
import type { Database } from '@/integrations/supabase/types';
type OrdemServico = Database['public']['Tables']['ordens_servico']['Row'];
interface VisualizarOSProps {
  ordem: OrdemServico;
  children: React.ReactNode;
}
const VisualizarOS = ({
  ordem,
  children
}: VisualizarOSProps) => {
  const gerarNumeroOS = (numeroOS: number, dataEntrada: string | null): string => {
    if (!dataEntrada) return 'Aguardando...';
    const ano = new Date(dataEntrada).getFullYear();
    const ano2Digitos = ano.toString().slice(-2);
    return `OS${ano2Digitos}-${numeroOS.toString().padStart(4, '0')}`;
  };
  const numeroOSFormatado = gerarNumeroOS(ordem.numero_os, ordem.data_entrada);
  const statusColors: Record<string, string> = {
    'Em análise': 'bg-yellow-100 text-yellow-800',
    'Aguardando peça': 'bg-orange-100 text-orange-800',
    'Aguardando autorização': 'bg-blue-100 text-blue-800',
    'Em conserto': 'bg-purple-100 text-purple-800',
    'Finalizado': 'bg-green-100 text-green-800',
    'Entregue': 'bg-gray-100 text-gray-800'
  };
  const imprimirModal = () => {
    window.print();
  };

  // Componente para renderizar o conteúdo da OS
  const ConteudoOS = ({
    tipoVia
  }: {
    tipoVia: string;
  }) => <div className="space-y-3 print:space-y-2">
      {/* Header com logo e número da OS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src="/lovable-uploads/9428a948-19d8-4c0c-abbb-048b4717f2cc.png" alt="Logo FELMAK" className="h-16 w-auto print:h-12" />
        </div>
        <div className="text-right">
          <div className="text-xl font-bold print:text-lg">
            OS: {numeroOSFormatado}
          </div>
          {tipoVia && <div className="text-xs font-medium print:text-xs text-gray-600">
              {tipoVia}
            </div>}
        </div>
      </div>
      
      {/* Dados de contato da empresa */}
      <div className="text-sm text-gray-600 space-y-1 print:text-sm text-center">
        <p>Tel: (11) 4368-7395 | (11) 2598-7894 | e-mail: felmak.assist@gmail.com</p>
        <p>Av. Senador Vergueiro, 2483 - São Bernardo do Campo</p>
      </div>
      
      <h2 className="text-lg font-bold print:text-lg text-center">ORDEM DE SERVIÇO</h2>

      {/* DADOS DO CLIENTE */}
      <div className="bg-gray-50 p-3 rounded-lg border print:p-2 print:bg-white print:border">
        <h3 className="text-sm font-bold mb-2 flex items-center print:text-sm print:mb-2">
          <User className="w-3 h-3 mr-2 print:w-3 print:h-3" />
          DADOS DO CLIENTE
        </h3>
        <div className="space-y-1 text-xs print:text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 print:grid-cols-2 print:gap-2">
            <div className="space-y-1">
              <div>
                <span className="font-medium">Nome:</span> {ordem.cliente_nome}
              </div>
              <div>
                <span className="font-medium">Telefone:</span> {formatarTelefone(ordem.cliente_telefone)}
              </div>
              {ordem.cliente_email && <div>
                  <span className="font-medium">E-mail:</span> {ordem.cliente_email}
                </div>}
              {ordem.cliente_bairro && <div>
                  <span className="font-medium">Bairro:</span> {ordem.cliente_bairro} - {ordem.cliente_cidade || ''} - {ordem.cliente_estado || ''}
                </div>}
            </div>
            
            <div className="space-y-1">
              {ordem.cliente_cpf_cnpj && <div>
                  <span className="font-medium">CPF/CNPJ:</span> {ordem.cliente_cpf_cnpj}
                </div>}
              
              {ordem.cliente_endereco && <div>
                  <span className="font-medium">Endereço:</span> {ordem.cliente_endereco}{ordem.cliente_numero ? `, ${ordem.cliente_numero}` : ''}
                </div>}
              
              {ordem.cliente_cep && <div>
                  <span className="font-medium">CEP:</span> {ordem.cliente_cep}
                </div>}
            </div>
          </div>
        </div>
      </div>

      {/* DADOS DO EQUIPAMENTO */}
      <div className="bg-gray-50 p-3 rounded-lg border print:p-2 print:bg-white print:border">
        <h3 className="text-sm font-bold mb-2 flex items-center print:text-sm print:mb-2">
          <Wrench className="w-3 h-3 mr-2 print:w-3 print:h-3" />
          DADOS DO EQUIPAMENTO
        </h3>
        <div className="space-y-1 text-xs print:text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 print:grid-cols-2 print:gap-2">
            <div className="space-y-1">
              <div>
                <span className="font-medium">Tipo:</span> {ordem.equipamento_tipo}
              </div>
              <div>
                <span className="font-medium">Marca:</span> {ordem.equipamento_marca}
              </div>
              {ordem.equipamento_modelo && <div>
                  <span className="font-medium">Modelo:</span> {ordem.equipamento_modelo}
                </div>}
            </div>
            
            <div className="space-y-1">
              {ordem.equipamento_serie && <div>
                  <span className="font-medium">Nº Série:</span> {ordem.equipamento_serie}
                </div>}
              {ordem.equipamento_cor && <div>
                  <span className="font-medium">Cor:</span> {ordem.equipamento_cor}
                </div>}
              {ordem.estado_fisico_entrega && <div>
                  <span className="font-medium">Estado Físico:</span> {ordem.estado_fisico_entrega}
                </div>}
            </div>
          </div>
          
          {ordem.acessorios_entregues && <div>
              <span className="font-medium">Acessórios:</span> {ordem.acessorios_entregues}
            </div>}
        </div>
      </div>

      {/* DEFEITO RELATADO */}
      {ordem.defeito_relatado && <div className="bg-gray-50 p-3 rounded-lg border print:p-2 print:bg-white print:border">
          <h3 className="text-sm font-bold mb-2 flex items-center print:text-sm print:mb-2">
            <FileText className="w-3 h-3 mr-2 print:w-3 print:h-3" />
            DEFEITO RELATADO
          </h3>
          <p className="text-xs leading-relaxed print:text-sm print:leading-normal">{ordem.defeito_relatado}</p>
        </div>}

      {/* OBSERVAÇÕES TÉCNICAS */}
      {ordem.observacoes_tecnico && <div className="bg-gray-50 p-3 rounded-lg border print:p-2 print:bg-white print:border">
          <h3 className="text-sm font-bold mb-2 flex items-center print:text-sm print:mb-2">
            <FileText className="w-3 h-3 mr-2 print:w-3 print:h-3" />
            OBSERVAÇÕES TÉCNICAS
          </h3>
          <p className="text-xs leading-relaxed print:text-sm print:leading-normal">{ordem.observacoes_tecnico}</p>
        </div>}

      {/* TESTES REALIZADOS */}
      {ordem.testes_realizados && <div className="bg-gray-50 p-3 rounded-lg border print:p-2 print:bg-white print:border">
          <h3 className="text-sm font-bold mb-2 flex items-center print:text-sm print:mb-2">
            <FileText className="w-3 h-3 mr-2 print:w-3 print:h-3" />
            TESTES REALIZADOS
          </h3>
          <p className="text-xs leading-relaxed print:text-sm print:leading-normal">{ordem.testes_realizados}</p>
        </div>}

      {/* VALORES */}
      <div className="bg-gray-50 p-3 rounded-lg border print:p-2 print:bg-white print:border">
        <h3 className="text-sm font-bold mb-2 flex items-center print:text-sm print:mb-2">
          <DollarSign className="w-3 h-3 mr-2 print:w-3 print:h-3" />
          VALORES
        </h3>
        <div className="space-y-1 text-xs print:text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 print:grid-cols-3 print:gap-2">
            {ordem.valor_pecas && ordem.valor_pecas > 0 && <div>
                <span className="font-medium">Valor Peças:</span> R$ {ordem.valor_pecas.toFixed(2).replace('.', ',')}
              </div>}
            
            {ordem.valor_mao_obra && ordem.valor_mao_obra > 0 && <div>
                <span className="font-medium">Mão de Obra:</span> R$ {ordem.valor_mao_obra.toFixed(2).replace('.', ',')}
              </div>}
            
            <div className="font-bold text-sm print:text-sm">
              <span className="font-bold">VALOR TOTAL:</span> R$ {(ordem.valor_total || 0).toFixed(2).replace('.', ',')}
            </div>
          </div>
          
          {ordem.autorizacao_orcamento && ordem.autorizacao_orcamento > 0 && <div>
              <span className="font-medium">Limite Autorizado:</span> R$ {ordem.autorizacao_orcamento.toFixed(2).replace('.', ',')}
            </div>}
        </div>
      </div>

      {/* Informações básicas */}
      <div className="space-y-1 text-xs print:text-sm print:space-y-1">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 print:grid-cols-4 print:gap-2">
          {ordem.data_entrada && <div>
              <span className="font-medium">Data Entrada:</span> {new Date(ordem.data_entrada).toLocaleDateString('pt-BR')}
            </div>}
          {ordem.data_prevista && <div>
              <span className="font-medium">Data Prevista:</span> {new Date(ordem.data_prevista).toLocaleDateString('pt-BR')}
            </div>}
          {ordem.data_entrega && <div>
              <span className="font-medium">Data Entrega:</span> {new Date(ordem.data_entrega).toLocaleDateString('pt-BR')}
            </div>}
          {ordem.tecnico_responsavel && <div>
              <span className="font-medium">Técnico:</span> {ordem.tecnico_responsavel}
            </div>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 print:grid-cols-3 print:gap-2">
          {ordem.prazo_garantia_dias && ordem.prazo_garantia_dias > 0 && <div>
              <span className="font-medium">Garantia:</span> {ordem.prazo_garantia_dias} dias
            </div>}
          
          <div>
            <span className="font-medium">Status:</span> 
            <Badge className={`ml-2 text-xs print:text-xs ${statusColors[ordem.status || 'Em análise'] || 'bg-gray-100 text-gray-800'}`}>
              {ordem.status || 'Em análise'}
            </Badge>
          </div>
          
          {ordem.urgencia && <div>
              <span className="font-medium">Urgência:</span> 
              <Badge variant="destructive" className="ml-2 text-xs print:text-xs">Urgente</Badge>
            </div>}
        </div>
      </div>
    </div>;
  return <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible">
        <style>
          {`
            @media print {
              .print-hide { display: none !important; }
              
              @page {
                margin: 0.5in;
                size: A4;
              }
              
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
              
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: 100% !important;
              }
              
              body * {
                visibility: hidden;
              }
              
              .print-container, .print-container * {
                visibility: visible;
              }
              
              .print-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 20px !important;
                font-size: 14px !important;
                line-height: 1.4 !important;
                box-sizing: border-box !important;
              }
              
              .print-divider {
                width: 100% !important;
                text-align: center !important;
                margin: 30px 0 !important;
                padding: 15px 0 !important;
                border-top: 2px dashed #000 !important;
                page-break-inside: avoid !important;
                font-size: 12px !important;
                font-weight: bold !important;
              }
              
              .via-copy {
                page-break-inside: avoid !important;
                margin-bottom: 15px !important;
              }
            }
          `}
        </style>
        
        <div className="print-container">
          <DialogHeader className="text-center space-y-2 print:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={imprimirModal} className="print-hide">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <div className="text-right">
                  
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Versão para tela - conteúdo normal */}
          <div className="print:hidden">
            <ConteudoOS tipoVia="" />
          </div>

          {/* Versão para impressão - duas vias */}
          <div className="hidden print:block">
            {/* VIA CLIENTE */}
            <div className="via-copy">
              <ConteudoOS tipoVia="VIA CLIENTE" />
            </div>
            
            {/* Linha divisória */}
            <div className="print-divider">
              ✂️ ------------------------------------------------------------ CORTE AQUI ------------------------------------------------------------
            </div>
            
            {/* VIA EMPRESA */}
            <div className="via-copy">
              <ConteudoOS tipoVia="VIA EMPRESA" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
export default VisualizarOS;