
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatarTelefone } from '@/utils/helpers';
import type { Database } from '@/integrations/supabase/types';

type OrdemServico = Database['public']['Tables']['ordens_servico']['Row'];

interface EditarOSProps {
  ordem: OrdemServico;
  onSuccess: () => void;
  children: React.ReactNode;
}

const EditarOS = ({ ordem, onSuccess, children }: EditarOSProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    cliente_nome: ordem.cliente_nome || '',
    cliente_telefone: ordem.cliente_telefone || '',
    cliente_email: ordem.cliente_email || '',
    cliente_endereco: ordem.cliente_endereco || '',
    cliente_bairro: ordem.cliente_bairro || '',
    cliente_cidade: ordem.cliente_cidade || '',
    cliente_estado: ordem.cliente_estado || '',
    cliente_cep: ordem.cliente_cep || '',
    equipamento_tipo: ordem.equipamento_tipo || '',
    equipamento_marca: ordem.equipamento_marca || '',
    equipamento_modelo: ordem.equipamento_modelo || '',
    equipamento_serie: ordem.equipamento_serie || '',
    defeito_relatado: ordem.defeito_relatado || '',
    observacoes_tecnico: ordem.observacoes_tecnico || '',
    status: ordem.status || 'Em análise',
    tecnico_responsavel: ordem.tecnico_responsavel || '',
    data_prevista: ordem.data_prevista ? new Date(ordem.data_prevista).toISOString().split('T')[0] : '',
    valor_pecas: ordem.valor_pecas?.toString() || '0',
    valor_mao_obra: ordem.valor_mao_obra?.toString() || '0',
    prazo_garantia_dias: ordem.prazo_garantia_dias?.toString() || '90'
  });

  const statusOptions = [
    'Em análise', 
    'Aguardando peça', 
    'Aguardando autorização', 
    'Em conserto', 
    'Finalizado', 
    'Entregue'
  ];

  const handleInputChange = (campo: string, valor: string) => {
    setFormData(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSalvar = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('ordens_servico')
        .update({
          cliente_nome: formData.cliente_nome,
          cliente_telefone: formData.cliente_telefone,
          cliente_email: formData.cliente_email || null,
          cliente_endereco: formData.cliente_endereco || null,
          cliente_bairro: formData.cliente_bairro || null,
          cliente_cidade: formData.cliente_cidade || null,
          cliente_estado: formData.cliente_estado || null,
          cliente_cep: formData.cliente_cep || null,
          equipamento_tipo: formData.equipamento_tipo,
          equipamento_marca: formData.equipamento_marca,
          equipamento_modelo: formData.equipamento_modelo || null,
          equipamento_serie: formData.equipamento_serie || null,
          defeito_relatado: formData.defeito_relatado,
          observacoes_tecnico: formData.observacoes_tecnico || null,
          status: formData.status,
          tecnico_responsavel: formData.tecnico_responsavel || null,
          data_prevista: formData.data_prevista ? new Date(formData.data_prevista).toISOString() : null,
          valor_pecas: parseFloat(formData.valor_pecas) || 0,
          valor_mao_obra: parseFloat(formData.valor_mao_obra) || 0,
          prazo_garantia_dias: parseInt(formData.prazo_garantia_dias) || 90,
          updated_at: new Date().toISOString()
        })
        .eq('id', ordem.id);

      if (error) throw error;

      toast({
        title: "OS atualizada com sucesso",
        description: "As alterações foram salvas."
      });

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar OS:', error);
      toast({
        title: "Erro ao atualizar OS",
        description: "Ocorreu um erro ao salvar as alterações.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar OS {ordem.numero_os ? `OS${new Date(ordem.data_entrada || '').getFullYear().toString().slice(-2)}-${ordem.numero_os.toString().padStart(4, '0')}` : 'Nova'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cliente_nome">Nome do Cliente *</Label>
                <Input
                  id="cliente_nome"
                  value={formData.cliente_nome}
                  onChange={(e) => handleInputChange('cliente_nome', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cliente_telefone">Telefone *</Label>
                <Input
                  id="cliente_telefone"
                  value={formData.cliente_telefone}
                  onChange={(e) => handleInputChange('cliente_telefone', formatarTelefone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cliente_email">E-mail</Label>
                <Input
                  id="cliente_email"
                  type="email"
                  value={formData.cliente_email}
                  onChange={(e) => handleInputChange('cliente_email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cliente_cep">CEP</Label>
                <Input
                  id="cliente_cep"
                  value={formData.cliente_cep}
                  onChange={(e) => handleInputChange('cliente_cep', e.target.value)}
                  placeholder="00000-000"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="cliente_endereco">Endereço</Label>
                <Input
                  id="cliente_endereco"
                  value={formData.cliente_endereco}
                  onChange={(e) => handleInputChange('cliente_endereco', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cliente_bairro">Bairro</Label>
                <Input
                  id="cliente_bairro"
                  value={formData.cliente_bairro}
                  onChange={(e) => handleInputChange('cliente_bairro', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cliente_cidade">Cidade</Label>
                <Input
                  id="cliente_cidade"
                  value={formData.cliente_cidade}
                  onChange={(e) => handleInputChange('cliente_cidade', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dados do Equipamento */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Equipamento</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipamento_tipo">Tipo de Equipamento *</Label>
                <Input
                  id="equipamento_tipo"
                  value={formData.equipamento_tipo}
                  onChange={(e) => handleInputChange('equipamento_tipo', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="equipamento_marca">Marca *</Label>
                <Input
                  id="equipamento_marca"
                  value={formData.equipamento_marca}
                  onChange={(e) => handleInputChange('equipamento_marca', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="equipamento_modelo">Modelo</Label>
                <Input
                  id="equipamento_modelo"
                  value={formData.equipamento_modelo}
                  onChange={(e) => handleInputChange('equipamento_modelo', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="equipamento_serie">Número de Série</Label>
                <Input
                  id="equipamento_serie"
                  value={formData.equipamento_serie}
                  onChange={(e) => handleInputChange('equipamento_serie', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Defeito e Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Defeito e Observações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="defeito_relatado">Defeito Relatado *</Label>
                <Textarea
                  id="defeito_relatado"
                  value={formData.defeito_relatado}
                  onChange={(e) => handleInputChange('defeito_relatado', e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="observacoes_tecnico">Observações do Técnico</Label>
                <Textarea
                  id="observacoes_tecnico"
                  value={formData.observacoes_tecnico}
                  onChange={(e) => handleInputChange('observacoes_tecnico', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status e Controle */}
          <Card>
            <CardHeader>
              <CardTitle>Status e Controle</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tecnico_responsavel">Técnico Responsável</Label>
                <Input
                  id="tecnico_responsavel"
                  value={formData.tecnico_responsavel}
                  onChange={(e) => handleInputChange('tecnico_responsavel', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="data_prevista">Data Prevista</Label>
                <Input
                  id="data_prevista"
                  type="date"
                  value={formData.data_prevista}
                  onChange={(e) => handleInputChange('data_prevista', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="prazo_garantia_dias">Garantia (dias)</Label>
                <Input
                  id="prazo_garantia_dias"
                  type="number"
                  value={formData.prazo_garantia_dias}
                  onChange={(e) => handleInputChange('prazo_garantia_dias', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Valores */}
          <Card>
            <CardHeader>
              <CardTitle>Valores</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor_pecas">Valor das Peças (R$)</Label>
                <Input
                  id="valor_pecas"
                  type="number"
                  step="0.01"
                  value={formData.valor_pecas}
                  onChange={(e) => handleInputChange('valor_pecas', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="valor_mao_obra">Valor da Mão de Obra (R$)</Label>
                <Input
                  id="valor_mao_obra"
                  type="number"
                  step="0.01"
                  value={formData.valor_mao_obra}
                  onChange={(e) => handleInputChange('valor_mao_obra', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSalvar} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditarOS;
