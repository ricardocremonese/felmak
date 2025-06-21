
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Wrench, 
  Calendar, 
  DollarSign,
  FileText,
  Clock,
  Printer
} from 'lucide-react';
import { formatarTelefone } from '@/utils/helpers';
import type { Database } from '@/integrations/supabase/types';

type OrdemServico = Database['public']['Tables']['ordens_servico']['Row'];

interface VisualizarOSProps {
  ordem: OrdemServico;
  children: React.ReactNode;
}

const VisualizarOS = ({ ordem, children }: VisualizarOSProps) => {
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible">
        <style jsx>{`
          @media print {
            .lovable-badge { display: none !important; }
            [data-testid="lovable-badge"] { display: none !important; }
            .lovable-watermark { display: none !important; }
            .print-hide { display: none !important; }
            body * {
              visibility: hidden;
            }
            .print-container, .print-container * {
              visibility: visible;
            }
            .print-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              font-size: 14px !important;
            }
          }
        `}</style>
        
        <div className="print-container">
          <DialogHeader className="text-center space-y-3 print:space-y-2">
            {/* Logo e Número da OS */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img 
                  src="/lovable-uploads/9428a948-19d8-4c0c-abbb-048b4717f2cc.png" 
                  alt="Logo FELMAK" 
                  className="h-16 w-auto print:h-14"
                />
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={imprimirModal}
                  className="print:hidden print-hide"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
                <div className="text-right">
                  <DialogTitle className="text-2xl font-bold print:text-xl">
                    OS: {numeroOSFormatado}
                  </DialogTitle>
                </div>
              </div>
            </div>
            
            {/* Dados de contato da empresa */}
            <div className="text-sm text-gray-600 space-y-1 print:text-xs">
              <p>Tel: (11) 4368-7395 | (11) 2598-7894 | e-mail: felmak.assist@gmail.com</p>
              <p>Av. Senador Vergueiro, 2483 - São Bernardo do Campo</p>
            </div>
            
            <h2 className="text-xl font-bold print:text-lg">ORDEM DE SERVIÇO</h2>
          </DialogHeader>

          <div className="space-y-6 print:space-y-4">
            {/* DADOS DO CLIENTE - Layout reorganizado */}
            <div className="bg-gray-50 p-4 rounded-lg border print:p-3">
              <h3 className="text-lg font-bold mb-3 flex items-center print:text-base print:mb-2">
                <User className="w-5 h-5 mr-2 print:w-4 print:h-4" />
                DADOS DO CLIENTE
              </h3>
              <div className="space-y-2 text-base print:text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                  <div className="space-y-2">
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
                  
                  <div className="space-y-2">
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

            {/* DADOS DO EQUIPAMENTO - Layout melhorado */}
            <div className="bg-gray-50 p-4 rounded-lg border print:p-3">
              <h3 className="text-lg font-bold mb-3 flex items-center print:text-base print:mb-2">
                <Wrench className="w-5 h-5 mr-2 print:w-4 print:h-4" />
                DADOS DO EQUIPAMENTO
              </h3>
              <div className="space-y-2 text-base print:text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2">
                  <div className="space-y-2">
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
                  
                  <div className="space-y-2">
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
                
                {ordem.acessorios_entregues && (
                  <div>
                    <span className="font-medium">Acessórios:</span> {ordem.acessorios_entregues}
                  </div>
                )}
              </div>
            </div>

            {/* DEFEITO RELATADO */}
            {ordem.defeito_relatado && (
              <div className="bg-gray-50 p-4 rounded-lg border print:p-3">
                <h3 className="text-lg font-bold mb-3 flex items-center print:text-base print:mb-2">
                  <FileText className="w-5 h-5 mr-2 print:w-4 print:h-4" />
                  DEFEITO RELATADO
                </h3>
                <p className="text-base leading-relaxed print:text-sm print:leading-normal">{ordem.defeito_relatado}</p>
              </div>
            )}

            {/* OBSERVAÇÕES TÉCNICAS */}
            {ordem.observacoes_tecnico && (
              <div className="bg-gray-50 p-4 rounded-lg border print:p-3">
                <h3 className="text-lg font-bold mb-3 flex items-center print:text-base print:mb-2">
                  <FileText className="w-5 h-5 mr-2 print:w-4 print:h-4" />
                  OBSERVAÇÕES TÉCNICAS
                </h3>
                <p className="text-base leading-relaxed print:text-sm print:leading-normal">{ordem.observacoes_tecnico}</p>
              </div>
            )}

            {/* TESTES REALIZADOS */}
            {ordem.testes_realizados && (
              <div className="bg-gray-50 p-4 rounded-lg border print:p-3">
                <h3 className="text-lg font-bold mb-3 flex items-center print:text-base print:mb-2">
                  <FileText className="w-5 h-5 mr-2 print:w-4 print:h-4" />
                  TESTES REALIZADOS
                </h3>
                <p className="text-base leading-relaxed print:text-sm print:leading-normal">{ordem.testes_realizados}</p>
              </div>
            )}

            {/* VALORES */}
            <div className="bg-gray-50 p-4 rounded-lg border print:p-3">
              <h3 className="text-lg font-bold mb-3 flex items-center print:text-base print:mb-2">
                <DollarSign className="w-5 h-5 mr-2 print:w-4 print:h-4" />
                VALORES
              </h3>
              <div className="space-y-2 text-base print:text-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
                  {ordem.valor_pecas && ordem.valor_pecas > 0 && (
                    <div>
                      <span className="font-medium">Valor Peças:</span> R$ {ordem.valor_pecas.toFixed(2).replace('.', ',')}
                    </div>
                  )}
                  
                  {ordem.valor_mao_obra && ordem.valor_mao_obra > 0 && (
                    <div>
                      <span className="font-medium">Mão de Obra:</span> R$ {ordem.valor_mao_obra.toFixed(2).replace('.', ',')}
                    </div>
                  )}
                  
                  <div className="font-bold text-lg print:text-base">
                    <span className="font-bold">VALOR TOTAL:</span> R$ {(ordem.valor_total || 0).toFixed(2).replace('.', ',')}
                  </div>
                </div>
                
                {ordem.autorizacao_orcamento && ordem.autorizacao_orcamento > 0 && (
                  <div>
                    <span className="font-medium">Limite Autorizado:</span> R$ {ordem.autorizacao_orcamento.toFixed(2).replace('.', ',')}
                  </div>
                )}
              </div>
            </div>

            {/* Informações básicas */}
            <div className="space-y-3 text-base print:text-sm print:space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
                {ordem.prazo_garantia_dias && ordem.prazo_garantia_dias > 0 && (
                  <div>
                    <span className="font-medium">Garantia:</span> {ordem.prazo_garantia_dias} dias
                  </div>
                )}
                
                <div>
                  <span className="font-medium">Status:</span> 
                  <Badge className={`ml-2 text-sm print:text-xs ${statusColors[ordem.status || 'Em análise'] || 'bg-gray-100 text-gray-800'}`}>
                    {ordem.status || 'Em análise'}
                  </Badge>
                </div>
                
                {ordem.urgencia && (
                  <div>
                    <span className="font-medium">Urgência:</span> 
                    <Badge variant="destructive" className="ml-2 text-sm print:text-xs">Urgente</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisualizarOS;
