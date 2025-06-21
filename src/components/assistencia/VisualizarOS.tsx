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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4">
          {/* Logo e Número da OS - Igual ao PDF */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/9428a948-19d8-4c0c-abbb-048b4717f2cc.png" 
                alt="Logo FELMAK" 
                className="h-16 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={imprimirModal}
                className="print:hidden"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <div className="text-right">
                <DialogTitle className="text-2xl font-bold">
                  OS: {numeroOSFormatado}
                </DialogTitle>
              </div>
            </div>
          </div>
          
          {/* Dados de contato da empresa - Igual ao PDF */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>Tel: (11) 4368-7395 | (11) 2598-7894</p>
            <p>Av. Senador Vergueiro, 2483 - São Bernardo do Campo</p>
            <p>e-mail: felmak.assist@gmail.com</p>
          </div>
          
          <h2 className="text-xl font-bold">ORDEM DE SERVIÇO</h2>
        </DialogHeader>

        <div className="space-y-6">
          {/* DADOS DO CLIENTE - Seção destacada igual ao PDF */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              DADOS DO CLIENTE
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Nome:</span> {ordem.cliente_nome}</p>
                </div>
                <div>
                  <p><span className="font-medium">Telefone:</span> {formatarTelefone(ordem.cliente_telefone)}</p>
                </div>
              </div>
              
              {ordem.cliente_email && (
                <div>
                  <p><span className="font-medium">E-mail:</span> {ordem.cliente_email}</p>
                </div>
              )}
              
              {ordem.cliente_cpf_cnpj && (
                <div>
                  <p><span className="font-medium">CPF/CNPJ:</span> {ordem.cliente_cpf_cnpj}</p>
                </div>
              )}

              {ordem.cliente_endereco && (
                <div className="space-y-2">
                  <p><span className="font-medium">Endereço:</span> {ordem.cliente_endereco}{ordem.cliente_numero ? `, ${ordem.cliente_numero}` : ''}</p>
                  {(ordem.cliente_bairro || ordem.cliente_cidade || ordem.cliente_estado) && (
                    <p>{ordem.cliente_bairro || ''} - {ordem.cliente_cidade || ''} - {ordem.cliente_estado || ''}</p>
                  )}
                  {ordem.cliente_cep && (
                    <p><span className="font-medium">CEP:</span> {ordem.cliente_cep}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* DADOS DO EQUIPAMENTO - Seção destacada igual ao PDF */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <Wrench className="w-5 h-5 mr-2" />
              DADOS DO EQUIPAMENTO
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Tipo:</span> {ordem.equipamento_tipo}</p>
                </div>
                <div>
                  <p><span className="font-medium">Marca:</span> {ordem.equipamento_marca}</p>
                </div>
              </div>
              
              {ordem.equipamento_modelo && (
                <div>
                  <p><span className="font-medium">Modelo:</span> {ordem.equipamento_modelo}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ordem.equipamento_serie && (
                  <div>
                    <p><span className="font-medium">Nº Série:</span> {ordem.equipamento_serie}</p>
                  </div>
                )}
                {ordem.equipamento_cor && (
                  <div>
                    <p><span className="font-medium">Cor:</span> {ordem.equipamento_cor}</p>
                  </div>
                )}
              </div>
              
              {ordem.acessorios_entregues && (
                <div>
                  <p><span className="font-medium">Acessórios:</span> {ordem.acessorios_entregues}</p>
                </div>
              )}
              
              {ordem.estado_fisico_entrega && (
                <div>
                  <p><span className="font-medium">Estado Físico:</span> {ordem.estado_fisico_entrega}</p>
                </div>
              )}
            </div>
          </div>

          {/* DEFEITO RELATADO - Seção destacada igual ao PDF */}
          {ordem.defeito_relatado && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                DEFEITO RELATADO
              </h3>
              <p className="text-sm leading-relaxed">{ordem.defeito_relatado}</p>
            </div>
          )}

          {/* OBSERVAÇÕES TÉCNICAS - Seção destacada igual ao PDF */}
          {ordem.observacoes_tecnico && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                OBSERVAÇÕES TÉCNICAS
              </h3>
              <p className="text-sm leading-relaxed">{ordem.observacoes_tecnico}</p>
            </div>
          )}

          {/* TESTES REALIZADOS - Seção destacada igual ao PDF */}
          {ordem.testes_realizados && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                TESTES REALIZADOS
              </h3>
              <p className="text-sm leading-relaxed">{ordem.testes_realizados}</p>
            </div>
          )}

          {/* VALORES - Seção destacada igual ao PDF */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              VALORES
            </h3>
            <div className="space-y-3">
              {ordem.valor_pecas && ordem.valor_pecas > 0 && (
                <p><span className="font-medium">Valor Peças:</span> R$ {ordem.valor_pecas.toFixed(2).replace('.', ',')}</p>
              )}
              
              {ordem.valor_mao_obra && ordem.valor_mao_obra > 0 && (
                <p><span className="font-medium">Mão de Obra:</span> R$ {ordem.valor_mao_obra.toFixed(2).replace('.', ',')}</p>
              )}
              
              <p className="text-lg font-bold">
                <span className="font-bold">VALOR TOTAL:</span> R$ {(ordem.valor_total || 0).toFixed(2).replace('.', ',')}
              </p>
              
              {ordem.autorizacao_orcamento && ordem.autorizacao_orcamento > 0 && (
                <p><span className="font-medium">Limite Autorizado:</span> R$ {ordem.autorizacao_orcamento.toFixed(2).replace('.', ',')}</p>
              )}
            </div>
          </div>

          {/* Informações básicas (sem seção destacada, igual ao PDF) */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ordem.data_entrada && (
                <div>
                  <p><span className="font-medium">Data Entrada:</span> {new Date(ordem.data_entrada).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
              {ordem.data_prevista && (
                <div>
                  <p><span className="font-medium">Data Prevista:</span> {new Date(ordem.data_prevista).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
            </div>
            
            {ordem.data_entrega && (
              <div>
                <p><span className="font-medium">Data Entrega:</span> {new Date(ordem.data_entrega).toLocaleDateString('pt-BR')}</p>
              </div>
            )}
            
            {ordem.tecnico_responsavel && (
              <div>
                <p><span className="font-medium">Técnico Responsável:</span> {ordem.tecnico_responsavel}</p>
              </div>
            )}
            
            {ordem.prazo_garantia_dias && ordem.prazo_garantia_dias > 0 && (
              <div>
                <p><span className="font-medium">Garantia:</span> {ordem.prazo_garantia_dias} dias</p>
              </div>
            )}
            
            <div>
              <p><span className="font-medium">Status:</span> 
                <Badge className={`ml-2 ${statusColors[ordem.status || 'Em análise'] || 'bg-gray-100 text-gray-800'}`}>
                  {ordem.status || 'Em análise'}
                </Badge>
              </p>
            </div>
            
            {ordem.urgencia && (
              <div>
                <p><span className="font-medium">Urgência:</span> 
                  <Badge variant="destructive" className="ml-2">Urgente</Badge>
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisualizarOS;
