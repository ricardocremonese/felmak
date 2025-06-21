
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
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Ordem de Serviço {numeroOSFormatado}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="w-5 h-5 mr-2" />
                Status e Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Status Atual</label>
                  <div className="mt-1">
                    <Badge className={statusColors[ordem.status || 'Em análise'] || 'bg-gray-100 text-gray-800'}>
                      {ordem.status || 'Em análise'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Urgência</label>
                  <div className="mt-1">
                    <Badge variant={ordem.urgencia ? "destructive" : "secondary"}>
                      {ordem.urgencia ? 'Urgente' : 'Normal'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Técnico Responsável</label>
                  <p className="mt-1 text-sm">{ordem.tecnico_responsavel || 'Não atribuído'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="w-5 h-5 mr-2" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome</label>
                  <p className="mt-1 font-medium">{ordem.cliente_nome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Telefone</label>
                  <div className="flex items-center mt-1">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <p>{formatarTelefone(ordem.cliente_telefone)}</p>
                  </div>
                </div>
                {ordem.cliente_email && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">E-mail</label>
                    <div className="flex items-center mt-1">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      <p className="text-sm">{ordem.cliente_email}</p>
                    </div>
                  </div>
                )}
                {ordem.cliente_cpf_cnpj && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">CPF/CNPJ</label>
                    <p className="mt-1 text-sm">{ordem.cliente_cpf_cnpj}</p>
                  </div>
                )}
              </div>

              {(ordem.cliente_endereco || ordem.cliente_cep) && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Endereço
                    </label>
                    <div className="mt-2 text-sm space-y-1">
                      {ordem.cliente_endereco && (
                        <p>{ordem.cliente_endereco}, {ordem.cliente_numero || 'S/N'} {ordem.cliente_complemento && `- ${ordem.cliente_complemento}`}</p>
                      )}
                      {ordem.cliente_bairro && (
                        <p>Bairro: {ordem.cliente_bairro}</p>
                      )}
                      {ordem.cliente_cidade && ordem.cliente_estado && (
                        <p>{ordem.cliente_cidade} - {ordem.cliente_estado}</p>
                      )}
                      {ordem.cliente_cep && (
                        <p>CEP: {ordem.cliente_cep}</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Dados do Equipamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Wrench className="w-5 h-5 mr-2" />
                Dados do Equipamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo</label>
                  <p className="mt-1 font-medium">{ordem.equipamento_tipo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Marca</label>
                  <p className="mt-1 font-medium">{ordem.equipamento_marca}</p>
                </div>
                {ordem.equipamento_modelo && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Modelo</label>
                    <p className="mt-1">{ordem.equipamento_modelo}</p>
                  </div>
                )}
                {ordem.equipamento_serie && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Número de Série</label>
                    <p className="mt-1">{ordem.equipamento_serie}</p>
                  </div>
                )}
                {ordem.equipamento_cor && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cor</label>
                    <p className="mt-1">{ordem.equipamento_cor}</p>
                  </div>
                )}
              </div>

              {(ordem.acessorios_entregues || ordem.estado_fisico_entrega) && (
                <>
                  <Separator />
                  {ordem.acessorios_entregues && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Acessórios Entregues</label>
                      <p className="mt-1 text-sm">{ordem.acessorios_entregues}</p>
                    </div>
                  )}
                  {ordem.estado_fisico_entrega && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estado Físico na Entrega</label>
                      <p className="mt-1 text-sm">{ordem.estado_fisico_entrega}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Defeito e Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="w-5 h-5 mr-2" />
                Defeito e Observações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Defeito Relatado</label>
                <p className="mt-1 text-sm p-3 bg-gray-50 rounded-md">{ordem.defeito_relatado}</p>
              </div>
              
              {ordem.observacoes_tecnico && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Observações do Técnico</label>
                  <p className="mt-1 text-sm p-3 bg-blue-50 rounded-md">{ordem.observacoes_tecnico}</p>
                </div>
              )}

              {ordem.testes_realizados && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Testes Realizados</label>
                  <p className="mt-1 text-sm p-3 bg-green-50 rounded-md">{ordem.testes_realizados}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Valores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="w-5 h-5 mr-2" />
                Valores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Valor das Peças</label>
                  <p className="mt-1 text-lg font-medium">R$ {(ordem.valor_pecas || 0).toString().replace('.', ',')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Mão de Obra</label>
                  <p className="mt-1 text-lg font-medium">R$ {(ordem.valor_mao_obra || 0).toString().replace('.', ',')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Valor Total</label>
                  <p className="mt-1 text-xl font-bold text-green-600">R$ {(ordem.valor_total || 0).toString().replace('.', ',')}</p>
                </div>
              </div>

              {ordem.autorizacao_orcamento && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Limite de Autorização</label>
                  <p className="mt-1 text-lg">R$ {ordem.autorizacao_orcamento.toString().replace('.', ',')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prazos e Datas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calendar className="w-5 h-5 mr-2" />
                Prazos e Datas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ordem.data_entrada && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data de Entrada</label>
                    <div className="flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      <p>{new Date(ordem.data_entrada).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                )}
                {ordem.data_prevista && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data Prevista</label>
                    <div className="flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-2 text-blue-500" />
                      <p>{new Date(ordem.data_prevista).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                )}
                {ordem.data_entrega && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data de Entrega</label>
                    <div className="flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-2 text-green-500" />
                      <p>{new Date(ordem.data_entrega).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                )}
              </div>

              {ordem.prazo_garantia_dias && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Prazo de Garantia</label>
                  <p className="mt-1">{ordem.prazo_garantia_dias} dias</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisualizarOS;
