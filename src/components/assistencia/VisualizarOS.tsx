
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
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Wrench, 
  Calendar, 
  DollarSign,
  FileText,
  Clock
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4">
          {/* Logo e Número da OS */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/9428a948-19d8-4c0c-abbb-048b4717f2cc.png" 
                alt="Logo FELMAK" 
                className="h-12 w-auto"
              />
            </div>
            <div className="text-right">
              <DialogTitle className="text-2xl font-bold">
                OS: {numeroOSFormatado}
              </DialogTitle>
            </div>
          </div>
          
          {/* Dados de contato da empresa */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>Tel: (11) 4368-7395 | (11) 2598-7894</p>
            <p>Av. Senador Vergueiro, 2483 - São Bernardo do Campo</p>
            <p>e-mail: felmak.assist@gmail.com</p>
          </div>
          
          <h2 className="text-xl font-bold">ORDEM DE SERVIÇO</h2>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dados do Cliente */}
          <Card>
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center text-lg font-bold">
                <User className="w-5 h-5 mr-2" />
                DADOS DO CLIENTE
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Nome:</span> {ordem.cliente_nome}</p>
                </div>
                <div>
                  <p><span className="font-medium">Telefone:</span> {formatarTelefone(ordem.cliente_telefone)}</p>
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
              </div>

              {ordem.cliente_endereco && (
                <div className="space-y-2">
                  <p><span className="font-medium">Endereço:</span> {ordem.cliente_endereco}{ordem.cliente_numero ? `, ${ordem.cliente_numero}` : ''}</p>
                  {ordem.cliente_bairro && (
                    <p>{ordem.cliente_bairro} - {ordem.cliente_cidade || ''} - {ordem.cliente_estado || ''}</p>
                  )}
                  {ordem.cliente_cep && (
                    <p><span className="font-medium">CEP:</span> {ordem.cliente_cep}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados do Equipamento */}
          <Card>
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center text-lg font-bold">
                <Wrench className="w-5 h-5 mr-2" />
                DADOS DO EQUIPAMENTO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><span className="font-medium">Tipo:</span> {ordem.equipamento_tipo}</p>
                </div>
                <div>
                  <p><span className="font-medium">Marca:</span> {ordem.equipamento_marca}</p>
                </div>
                {ordem.equipamento_modelo && (
                  <div>
                    <p><span className="font-medium">Modelo:</span> {ordem.equipamento_modelo}</p>
                  </div>
                )}
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
            </CardContent>
          </Card>

          {/* Defeito Relatado */}
          {ordem.defeito_relatado && (
            <Card>
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex items-center text-lg font-bold">
                  <FileText className="w-5 h-5 mr-2" />
                  DEFEITO RELATADO
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm leading-relaxed">{ordem.defeito_relatado}</p>
              </CardContent>
            </Card>
          )}

          {/* Observações Técnicas */}
          {ordem.observacoes_tecnico && (
            <Card>
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex items-center text-lg font-bold">
                  <FileText className="w-5 h-5 mr-2" />
                  OBSERVAÇÕES TÉCNICAS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm leading-relaxed">{ordem.observacoes_tecnico}</p>
              </CardContent>
            </Card>
          )}

          {/* Testes Realizados */}
          {ordem.testes_realizados && (
            <Card>
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex items-center text-lg font-bold">
                  <FileText className="w-5 h-5 mr-2" />
                  TESTES REALIZADOS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm leading-relaxed">{ordem.testes_realizados}</p>
              </CardContent>
            </Card>
          )}

          {/* Valores */}
          <Card>
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center text-lg font-bold">
                <DollarSign className="w-5 h-5 mr-2" />
                VALORES
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
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
            </CardContent>
          </Card>

          {/* Informações de Data e Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="w-5 h-5 mr-2" />
                Informações Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisualizarOS;
