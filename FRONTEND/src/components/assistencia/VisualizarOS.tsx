import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Wrench, DollarSign, FileText, Printer } from 'lucide-react';
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
    'Entregue': 'bg-gray-100 text-gray-800',
    'Devolução': 'bg-red-100 text-red-800'
  };

  const imprimirModal = () => {
    window.print();
  };

  // Componente para renderizar o conteúdo da OS
  const ConteudoOS = () => (
    <div className="space-y-2 print:space-y-1">
      {/* Header com logo e número da OS */}
      <div className="flex items-center justify-between print:relative">
        <div className="flex items-center space-x-4 print:flex print:justify-center print:w-full">
          <img 
            src="/lovable-uploads/9428a948-19d8-4c0c-abbb-048b4717f2cc.png" 
            alt="Logo FELMAK" 
            className="h-16 w-auto print:h-6 print:mx-auto print:block" 
          />
        </div>
        <div className="text-right print:absolute print:right-0 print:top-0">
          <div className="text-xl font-bold print:text-xs print:font-bold">
            OS: {numeroOSFormatado}
          </div>
        </div>
      </div>
      
      {/* Dados de contato da empresa */}
      <div className="text-sm text-gray-600 space-y-1 print:text-xs text-center print:mb-1">
        <p>Tel: (11) 4368-7395 | (11) 2598-7894 | e-mail: felmak.assist@gmail.com</p>
        <p>Av. Senador Vergueiro, 2483 - São Bernardo do Campo</p>
      </div>
      
      <h2 className="text-lg font-bold print:text-xs text-center print:mb-1">ORDEM DE SERVIÇO</h2>

      {/* DADOS DO CLIENTE */}
      <div className="bg-gray-50 p-3 rounded-lg border print:p-1 print:bg-white print:border print:mb-1">
        <h3 className="text-sm font-bold mb-2 flex items-center print:text-xs print:mb-1">
          <User className="w-3 h-3 mr-2 print:w-2 print:h-2" />
          DADOS DO CLIENTE
        </h3>
        <div className="space-y-1 text-xs print:text-xs print:space-y-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 print:grid-cols-2 print:gap-1">
            <div className="space-y-1 print:space-y-0">
              <div>
                <span className="font-medium">Nome:</span> {ordem.cliente_nome}
              </div>
              <div>
                <span className="font-medium">Telefone:</span> {formatarTelefone(ordem.cliente_telefone)}
              </div>
              {ordem.cliente_email && (
                <div>
                  <span className="font-medium">E-mail:</span> {ordem.cliente_email}
                </div>
              )}
              {ordem.cliente_bairro && (
                <div>
                  <span className="font-medium">Bairro:</span> {ordem.cliente_bairro} - {ordem.cliente_cidade || ''} - {ordem.cliente_estado || ''}
                </div>
              )}
            </div>
            
            <div className="space-y-1 print:space-y-0">
              {ordem.cliente_cpf_cnpj && (
                <div>
                  <span className="font-medium">CPF/CNPJ:</span> {ordem.cliente_cpf_cnpj}
                </div>
              )}
              
              {ordem.cliente_endereco && (
                <div>
                  <span className="font-medium">Endereço:</span> {ordem.cliente_endereco}{ordem.cliente_numero ? `, ${ordem.cliente_numero}` : ''}
                </div>
              )}
              
              {ordem.cliente_cep && (
                <div>
                  <span className="font-medium">CEP:</span> {ordem.cliente_cep}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DADOS DO EQUIPAMENTO */}
      <div className="bg-gray-50 p-3 rounded-lg border print:p-1 print:bg-white print:border print:mb-1">
        <h3 className="text-sm font-bold mb-2 flex items-center print:text-xs print:mb-1">
          <Wrench className="w-3 h-3 mr-2 print:w-2 print:h-2" />
          DADOS DO EQUIPAMENTO
        </h3>
        <div className="space-y-1 text-xs print:text-xs print:space-y-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 print:grid-cols-2 print:gap-1">
            <div className="space-y-1 print:space-y-0">
              <div>
                <span className="font-medium">Tipo:</span> {ordem.equipamento_tipo}
              </div>
              <div>
                <span className="font-medium">Marca:</span> {ordem.equipamento_marca}
              </div>
              {ordem.equipamento_modelo && (
                <div>
                  <span className="font-medium">Modelo:</span> {ordem.equipamento_modelo}
                </div>
              )}
            </div>
            
            <div className="space-y-1 print:space-y-0">
              {ordem.equipamento_serie && (
                <div>
                  <span className="font-medium">Nº Série:</span> {ordem.equipamento_serie}
                </div>
              )}
              {ordem.equipamento_cor && (
                <div>
                  <span className="font-medium">Cor:</span> {ordem.equipamento_cor}
                </div>
              )}
              {ordem.estado_fisico_entrega && (
                <div>
                  <span className="font-medium">Estado Físico:</span> {ordem.estado_fisico_entrega}
                </div>
              )}
            </div>
          </div>
          
          {(ordem as any).acompanha_acessorios && (ordem as any).acessorios_descricao && (
            <div>
              <span className="font-medium">Acessórios:</span> {(ordem as any).acessorios_descricao}
            </div>
          )}
        </div>
      </div>

      {/* DEFEITO RELATADO */}
      {ordem.defeito_relatado && (
        <div className="bg-gray-50 p-3 rounded-lg border print:p-1 print:bg-white print:border print:mb-1">
          <h3 className="text-sm font-bold mb-2 flex items-center print:text-xs print:mb-1">
            <FileText className="w-3 h-3 mr-2 print:w-2 print:h-2" />
            DEFEITO RELATADO
          </h3>
          <p className="text-xs leading-relaxed print:text-xs print:leading-tight">{ordem.defeito_relatado}</p>
        </div>
      )}

      {/* OBSERVAÇÕES TÉCNICAS */}
      {((ordem as any).observacoes_tecnico_antes || (ordem as any).observacoes_tecnico_depois) && (
        <div className="bg-gray-50 p-3 rounded-lg border print:p-1 print:bg-white print:border print:mb-1">
          <h3 className="text-sm font-bold mb-2 flex items-center print:text-xs print:mb-1">
            <FileText className="w-3 h-3 mr-2 print:w-2 print:h-2" />
            OBSERVAÇÕES TÉCNICAS
          </h3>
          {(ordem as any).observacoes_tecnico_antes && (
            <div className="mb-2">
              <span className="font-medium text-xs">Antes da Entrada:</span>
              <p className="text-xs leading-relaxed print:text-xs print:leading-tight">{(ordem as any).observacoes_tecnico_antes}</p>
            </div>
          )}
          {(ordem as any).observacoes_tecnico_depois && (
            <div>
              <span className="font-medium text-xs">Depois da Entrada:</span>
              <p className="text-xs leading-relaxed print:text-xs print:leading-tight">{(ordem as any).observacoes_tecnico_depois}</p>
            </div>
          )}
        </div>
      )}

      {/* TESTES REALIZADOS */}
      {ordem.testes_realizados && (
        <div className="bg-gray-50 p-3 rounded-lg border print:p-1 print:bg-white print:border print:mb-1">
          <h3 className="text-sm font-bold mb-2 flex items-center print:text-xs print:mb-1">
            <FileText className="w-3 h-3 mr-2 print:w-2 print:h-2" />
            TESTES REALIZADOS DURANTE O ORÇAMENTO
          </h3>
          <p className="text-xs leading-relaxed print:text-xs print:leading-tight">{ordem.testes_realizados}</p>
        </div>
      )}

      {/* INFORMAÇÕES ADICIONAIS DO DIAGNÓSTICO */}
      {((ordem as any).equipamento_funciona_defeito !== null || (ordem as any).avaliacao_total || (ordem as any).aplicar_taxa_orcamento || (ordem as any).tem_valor_antecipado) && (
        <div className="bg-gray-50 p-3 rounded-lg border print:p-1 print:bg-white print:border print:mb-1">
          <h3 className="text-sm font-bold mb-2 flex items-center print:text-xs print:mb-1">
            <FileText className="w-3 h-3 mr-2 print:w-2 print:h-2" />
            INFORMAÇÕES ADICIONAIS
          </h3>
          <div className="space-y-1 text-xs print:text-xs print:space-y-0">
            {(ordem as any).equipamento_funciona_defeito !== null && (
              <div>
                <span className="font-medium">Equipamento Funciona com o Defeito:</span> {(ordem as any).equipamento_funciona_defeito ? 'Sim' : 'Não'}
              </div>
            )}
            
            {(ordem as any).avaliacao_total && (
              <div>
                <span className="font-medium">Avaliação Total:</span> Sim
                {(ordem as any).pecas_orcamento && (
                  <div className="ml-4 mt-1">
                    <span className="font-medium">Peças a Serem Orçadas:</span> {(ordem as any).pecas_orcamento}
                  </div>
                )}
              </div>
            )}
            
            {(ordem as any).aplicar_taxa_orcamento && (ordem as any).valor_taxa_orcamento > 0 && (
              <div>
                <span className="font-medium">Taxa de Orçamento:</span> R$ {((ordem as any).valor_taxa_orcamento).toFixed(2).replace('.', ',')}
              </div>
            )}
            
            {(ordem as any).tem_valor_antecipado && (ordem as any).valor_antecipado > 0 && (
              <div>
                <span className="font-medium">Valor Antecipado:</span> R$ {((ordem as any).valor_antecipado).toFixed(2).replace('.', ',')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VALORES */}
      <div className="bg-gray-50 p-3 rounded-lg border print:p-1 print:bg-white print:border print:mb-1">
        <h3 className="text-sm font-bold mb-2 flex items-center print:text-xs print:mb-1">
          <DollarSign className="w-3 h-3 mr-2 print:w-2 print:h-2" />
          VALORES
        </h3>
        <div className="space-y-1 text-xs print:text-xs print:space-y-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 print:grid-cols-3 print:gap-1">
            {Boolean(ordem.valor_pecas && ordem.valor_pecas > 0) && (
              <div>
                <span className="font-medium">Valor Peças:</span> R$ {ordem.valor_pecas.toFixed(2).replace('.', ',')}
              </div>
            )}
            
            {Boolean(ordem.valor_mao_obra && ordem.valor_mao_obra > 0) && (
              <div>
                <span className="font-medium">Mão de Obra:</span> R$ {ordem.valor_mao_obra.toFixed(2).replace('.', ',')}
              </div>
            )}
            
            <div className="font-bold text-sm print:text-xs">
              <span className="font-bold">VALOR TOTAL:</span> R$ {(ordem.valor_total || 0).toFixed(2).replace('.', ',')}
            </div>
          </div>
          
          {(ordem as any).autorizacao_orcamento && (ordem as any).autorizacao_orcamento > 0 && (
            <div>
              <span className="font-medium">Limite Autorizado:</span> R$ {((ordem as any).autorizacao_orcamento).toFixed(2).replace('.', ',')}
            </div>
          )}
        </div>
      </div>

      {/* Informações básicas */}
      <div className="space-y-1 text-xs print:text-xs print:space-y-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 print:grid-cols-4 print:gap-1">
          {ordem.data_entrada && (
            <div>
              <span className="font-medium">Data Entrada:</span> {new Date(ordem.data_entrada).toLocaleDateString('pt-BR')}
            </div>
          )}
          {ordem.data_prevista && (
            <div>
              <span className="font-medium">Data Prevista:</span> {new Date(ordem.data_prevista).toLocaleDateString('pt-BR')}
            </div>
          )}
          {ordem.data_entrega && (
            <div>
              <span className="font-medium">Data Entrega:</span> {new Date(ordem.data_entrega).toLocaleDateString('pt-BR')}
            </div>
          )}
          {ordem.tecnico_responsavel && (
            <div>
              <span className="font-medium">Técnico:</span> {ordem.tecnico_responsavel}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 print:grid-cols-3 print:gap-1">
          {Boolean(ordem.prazo_garantia_dias && ordem.prazo_garantia_dias > 0) && (
            <div>
              <span className="font-medium">Garantia:</span> {ordem.prazo_garantia_dias} dias
            </div>
          )}
          
          <div>
            <span className="font-medium">Status:</span> 
            <Badge className={`ml-2 text-xs print:text-xs ${statusColors[ordem.status || 'Em análise'] || 'bg-gray-100 text-gray-800'}`}>
              {ordem.status || 'Em análise'}
            </Badge>
          </div>
          
          {(ordem as any).urgencia && (
            <div>
              <span className="font-medium">Urgência:</span> 
              <Badge variant="destructive" className="ml-2 text-xs print:text-xs">Urgente</Badge>
            </div>
          )}
        </div>

        {(ordem as any).data_ultima_alteracao_status && (
          <div className="mt-2">
            <span className="font-medium">Última Alteração do Status:</span> {new Date((ordem as any).data_ultima_alteracao_status).toLocaleDateString('pt-BR')} às {new Date((ordem as any).data_ultima_alteracao_status).toLocaleTimeString('pt-BR')}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible">
        <DialogTitle className="sr-only">Visualizar Ordem de Serviço {numeroOSFormatado}</DialogTitle>
        <style>
          {`
            @media print {
              .print-hide { display: none !important; }
              
              @page {
                margin: 0.5in;
                size: A4 portrait;
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
                font-size: 8px !important;
                line-height: 1.2 !important;
              }
              
              body * {
                visibility: hidden;
              }
              
              .print-container, .print-container * {
                visibility: visible;
              }
              
              .print-container {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                margin: 0 !important;
                padding: 8px !important;
                font-size: 8px !important;
                line-height: 1.2 !important;
                box-sizing: border-box !important;
                display: block !important;
                background: white !important;
                z-index: 9999 !important;
              }
              
              .print-copies-container {
                width: 100% !important;
                height: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: flex-start !important;
                align-items: stretch !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              .primeira-via,
              .segunda-via {
                width: 100% !important;
                height: 45% !important;
                overflow: hidden !important;
                margin: 0 !important;
                padding: 4px !important;
                box-sizing: border-box !important;
                page-break-inside: avoid !important;
                border: 1px solid #000 !important;
                background: white !important;
              }
              
              .print-divider {
                width: 100% !important;
                text-align: center !important;
                margin: 0 !important;
                padding: 4px 0 !important;
                border-top: 1px dashed #000 !important;
                font-size: 6px !important;
                font-weight: bold !important;
                height: 10% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: white !important;
              }
              
              .print-container > .hidden {
                display: block !important;
              }
              
              .print-container .print\\:text-xs {
                font-size: 7px !important;
              }
              
              .print-container .print\\:h-6 {
                height: 16px !important;
              }
              
              .print-container .print\\:p-1 {
                padding: 2px !important;
              }
              
              .print-container .print\\:mb-1 {
                margin-bottom: 1px !important;
              }
              
              .print-container .print\\:space-y-0 > * + * {
                margin-top: 0 !important;
              }
              
              .print-container .print\\:grid-cols-2 {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
              
              .print-container .print\\:grid-cols-3 {
                grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
              }
              
              .print-container .print\\:grid-cols-4 {
                grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
              }
              
              .print-container .print\\:gap-1 {
                gap: 1px !important;
              }
              
              .print-container .print\\:w-2 {
                width: 6px !important;
              }
              
              .print-container .print\\:h-2 {
                height: 6px !important;
              }
              
              .print-container .print\\:leading-tight {
                line-height: 1.1 !important;
              }
              
              .print-container .print\\:border {
                border: 1px solid #000 !important;
              }
              
              .print-container .print\\:bg-white {
                background-color: white !important;
              }
              
              .print-container .print\\:relative {
                position: relative !important;
              }
              
              .print-container .print\\:absolute {
                position: absolute !important;
              }
              
              .print-container .print\\:right-0 {
                right: 0 !important;
              }
              
              .print-container .print\\:top-0 {
                top: 0 !important;
              }
              
              .print-container .print\\:font-bold {
                font-weight: bold !important;
              }
              
              .print-container .print\\:mx-auto {
                margin-left: auto !important;
                margin-right: auto !important;
              }
              
              .print-container .print\\:block {
                display: block !important;
              }
              
              .print-container .print\\:flex {
                display: flex !important;
              }
              
              .print-container .print\\:justify-center {
                justify-content: center !important;
              }
              
              .print-container .print\\:w-full {
                width: 100% !important;
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
            <ConteudoOS />
          </div>

          {/* Versão para impressão - duas cópias na mesma página */}
          <div className="hidden print:block">
            <div className="print-copies-container">
              {/* PRIMEIRA VIA - CLIENTE */}
              <div className="primeira-via">
                <ConteudoOS />
              </div>
              
              {/* Linha divisória */}
              <div className="print-divider">
                ✂️ ---------------------------------------- CORTE AQUI ----------------------------------------
              </div>
              
              {/* SEGUNDA VIA - EMPRESA */}
              <div className="segunda-via">
                <ConteudoOS />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisualizarOS;
