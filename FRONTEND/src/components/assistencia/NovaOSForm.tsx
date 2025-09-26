import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Camera, Save, FileText, MapPin, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { buscarCEP, formatarTelefone, formatarCPFCNPJ, formatCurrency, parseCurrencyValue } from '@/utils/helpers';
import PecasMateriais from './PecasMateriais';
import type { Database } from '@/integrations/supabase/types';

// Usar o tipo correto do Supabase para inserção
type NovaOrdemServico = Database['public']['Tables']['ordens_servico']['Insert'];

interface FormData {
  // Cliente
  cliente_nome: string;
  cliente_telefone: string;
  cliente_email: string;
  cliente_cep: string;
  cliente_endereco: string;
  cliente_numero: string;
  cliente_complemento: string;
  cliente_bairro: string;
  cliente_cidade: string;
  cliente_estado: string;
  cliente_cpf_cnpj: string;
  
  // Equipamento
  equipamento_tipo: string;
  equipamento_marca: string;
  equipamento_modelo: string;
  equipamento_serie: string;
  acompanha_acessorios: boolean;
  acessorios_descricao: string;
  estado_fisico_entrega: string;
  
  // Diagnóstico
  defeito_relatado: string;
  observacoes_tecnico_antes: string;
  observacoes_tecnico_depois: string;
  testes_realizados: string;
  equipamento_funciona_defeito: boolean;
  avaliacao_total: boolean;
  pecas_orcamento: string;
  aplicar_taxa_orcamento: boolean;
  valor_taxa_orcamento: number;
  urgencia: boolean;
  
  // Valores
  valor_mao_obra: number;
  tem_valor_antecipado: boolean;
  valor_antecipado: number;
  
  // Status
  data_prevista: string;
  tecnico_responsavel: string;
  status: string;
  prazo_garantia_dias: number;
  
  // Outros
  codigo_item: string;
  assinatura_cliente: string;
  aceita_clausulas: boolean;
}

const NovaOSForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pecas, setPecas] = useState<Array<{id: string, nome: string, quantidade: number, preco_unitario: number}>>([]);

  // Add the missing formData state
  const [formData, setFormData] = useState<FormData>({
    cliente_nome: '',
    cliente_telefone: '',
    cliente_email: '',
    cliente_cep: '',
    cliente_endereco: '',
    cliente_numero: '',
    cliente_complemento: '',
    cliente_bairro: '',
    cliente_cidade: '',
    cliente_estado: '',
    cliente_cpf_cnpj: '',
    equipamento_tipo: '',
    equipamento_marca: '',
    equipamento_modelo: '',
    equipamento_serie: '',
    acompanha_acessorios: false,
    acessorios_descricao: '',
    estado_fisico_entrega: '',
    defeito_relatado: '',
    observacoes_tecnico_antes: '',
    observacoes_tecnico_depois: '',
    testes_realizados: '',
    equipamento_funciona_defeito: false,
    avaliacao_total: false,
    pecas_orcamento: '',
    aplicar_taxa_orcamento: false,
    valor_taxa_orcamento: 0,
    urgencia: false,
    valor_mao_obra: 0,
    tem_valor_antecipado: false,
    valor_antecipado: 0,
    data_prevista: '',
    tecnico_responsavel: '',
    status: 'Em análise',
    prazo_garantia_dias: 90,
    codigo_item: '',
    assinatura_cliente: '',
    aceita_clausulas: false
  });

  const equipamentoTipos = [
    'Martelete', 
    'Furadeira', 
    'Esmerilhadeira', 
    'Parafusadeira', 
    'Serra Circular', 
    'Lixadeira', 
    'Soprador',
    'Aspirador', 
    'Plaina', 
    'Roteador', 
    'Outros'
  ];

  const marcas = [
    'DeWalt', 
    'Makita', 
    'Bosch', 
    'Outras'
  ];

  const statusOptions = [
    'Em análise', 
    'Aguardando peça', 
    'Aguardando autorização', 
    'Em conserto', 
    'Finalizado', 
    'Entregue',
    'Devolução'
  ];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const buscarEnderecoPorCEP = async (cep: string) => {
    if (cep.length === 8) {
      try {
        const endereco = await buscarCEP(cep);
        if (endereco) {
          setFormData(prev => ({
            ...prev,
            cliente_endereco: endereco.logradouro,
            cliente_bairro: endereco.bairro,
            cliente_cidade: endereco.cidade,
            cliente_estado: endereco.uf
          }));
        }
      } catch (error) {
        toast({
          title: "Erro ao buscar CEP",
          description: "Não foi possível encontrar o endereço para este CEP.",
          variant: "destructive"
        });
      }
    }
  };

  const calcularValorTotal = () => {
    const valorPecas = pecas.reduce((total, peca) => total + (peca.quantidade * peca.preco_unitario), 0);
    return valorPecas + formData.valor_mao_obra;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Iniciando criação da OS...');
      
      const valorPecas = pecas.reduce((total, peca) => total + (peca.quantidade * peca.preco_unitario), 0);
      
      // Preparar dados para inserção - remover numero_os para ser gerado automaticamente
      const osData: NovaOrdemServico = {
        cliente_nome: formData.cliente_nome,
        cliente_telefone: formData.cliente_telefone,
        cliente_email: formData.cliente_email || null,
        cliente_cep: formData.cliente_cep || null,
        cliente_endereco: formData.cliente_endereco || null,
        cliente_numero: formData.cliente_numero || null,
        cliente_bairro: formData.cliente_bairro || null,
        cliente_cidade: formData.cliente_cidade || null,
        cliente_estado: formData.cliente_estado || null,
        cliente_cpf_cnpj: formData.cliente_cpf_cnpj || null,
        equipamento_tipo: formData.equipamento_tipo,
        equipamento_marca: formData.equipamento_marca,
        equipamento_modelo: formData.equipamento_modelo || null,
        equipamento_serie: formData.equipamento_serie || null,
        acompanha_acessorios: formData.acompanha_acessorios,
        acessorios_descricao: formData.acessorios_descricao || null,
        estado_fisico_entrega: formData.estado_fisico_entrega || null,
        defeito_relatado: formData.defeito_relatado,
        observacoes_tecnico_antes: formData.observacoes_tecnico_antes || null,
        observacoes_tecnico_depois: formData.observacoes_tecnico_depois || null,
        testes_realizados: formData.testes_realizados || null,
        equipamento_funciona_defeito: formData.equipamento_funciona_defeito,
        avaliacao_total: formData.avaliacao_total,
        pecas_orcamento: formData.pecas_orcamento || null,
        aplicar_taxa_orcamento: formData.aplicar_taxa_orcamento,
        valor_taxa_orcamento: formData.valor_taxa_orcamento,
        valor_mao_obra: formData.valor_mao_obra,
        valor_pecas: valorPecas,
        valor_total: valorPecas + formData.valor_mao_obra,
        tem_valor_antecipado: formData.tem_valor_antecipado,
        valor_antecipado: formData.valor_antecipado,
        data_prevista: formData.data_prevista || null,
        tecnico_responsavel: formData.tecnico_responsavel || null,
        status: formData.status,
        prazo_garantia_dias: formData.prazo_garantia_dias,
        codigo_item: formData.codigo_item || null,
        assinatura_cliente: formData.assinatura_cliente || null,
        aceita_clausulas: formData.aceita_clausulas
      };

      console.log('Dados sendo enviados para inserção:', osData);

      // Inserir OS - o número será gerado automaticamente pelo SERIAL
      const { data: osResult, error: osError } = await supabase
        .from('ordens_servico')
        .insert([osData])
        .select()
        .single();

      if (osError) {
        console.error('Erro ao inserir OS:', osError);
        throw osError;
      }

      console.log('OS criada com sucesso:', osResult);

      // Gerar número formatado da OS para mostrar na mensagem
      const anoAtual = new Date().getFullYear();
      const ano2Digitos = anoAtual.toString().slice(-2);
      const numeroOSFormatado = `OS${ano2Digitos}-${osResult.numero_os.toString().padStart(4, '0')}`;

      // Inserir peças se houver
      if (pecas.length > 0) {
        const pecasData = pecas.map(peca => ({
          os_id: osResult.id,
          peca_nome: peca.nome,
          quantidade: peca.quantidade,
          preco_unitario: peca.preco_unitario,
          preco_total: peca.quantidade * peca.preco_unitario
        }));

        console.log('Inserindo peças:', pecasData);

        const { error: pecasError } = await supabase
          .from('pecas_materiais')
          .insert(pecasData);

        if (pecasError) {
          console.error('Erro ao inserir peças:', pecasError);
          throw pecasError;
        }
      }

      toast({
        title: "OS criada com sucesso!",
        description: `Ordem de Serviço ${numeroOSFormatado} foi salva.`
      });

      // Limpar formulário após sucesso
      setFormData({
        cliente_nome: '',
        cliente_telefone: '',
        cliente_email: '',
        cliente_cep: '',
        cliente_endereco: '',
        cliente_numero: '',
        cliente_complemento: '',
        cliente_bairro: '',
        cliente_cidade: '',
        cliente_estado: '',
        cliente_cpf_cnpj: '',
        equipamento_tipo: '',
        equipamento_marca: '',
        equipamento_modelo: '',
        equipamento_serie: '',
        acompanha_acessorios: false,
        acessorios_descricao: '',
        estado_fisico_entrega: '',
        defeito_relatado: '',
        observacoes_tecnico_antes: '',
        observacoes_tecnico_depois: '',
        testes_realizados: '',
        equipamento_funciona_defeito: false,
        avaliacao_total: false,
        pecas_orcamento: '',
        aplicar_taxa_orcamento: false,
        valor_taxa_orcamento: 0,
        urgencia: false,
        valor_mao_obra: 0,
        tem_valor_antecipado: false,
        valor_antecipado: 0,
        data_prevista: '',
        tecnico_responsavel: '',
        status: 'Em análise',
        prazo_garantia_dias: 90,
        codigo_item: '',
        assinatura_cliente: '',
        aceita_clausulas: false
      });
      setPecas([]);

    } catch (error) {
      console.error('Erro ao criar OS:', error);
      toast({
        title: "Erro ao criar OS",
        description: `Erro: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados do Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            📋 Dados do Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="cliente_nome">Nome Completo *</Label>
            <Input
              id="cliente_nome"
              value={formData.cliente_nome}
              onChange={(e) => handleInputChange('cliente_nome', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="cliente_telefone">Telefone (WhatsApp) *</Label>
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
            <div className="flex space-x-2">
              <Input
                id="cliente_cep"
                value={formData.cliente_cep}
                onChange={(e) => {
                  const cep = e.target.value.replace(/\D/g, '');
                  handleInputChange('cliente_cep', cep);
                  if (cep.length === 8) {
                    buscarEnderecoPorCEP(cep);
                  }
                }}
                placeholder="00000-000"
                maxLength={8}
              />
              <Button type="button" variant="outline" size="icon">
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="cliente_cpf_cnpj">CPF/CNPJ</Label>
            <Input
              id="cliente_cpf_cnpj"
              value={formData.cliente_cpf_cnpj}
              onChange={(e) => handleInputChange('cliente_cpf_cnpj', formatarCPFCNPJ(e.target.value))}
              placeholder="000.000.000-00"
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
            <Label htmlFor="cliente_numero">Número</Label>
            <Input
              id="cliente_numero"
              value={formData.cliente_numero}
              onChange={(e) => handleInputChange('cliente_numero', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="cliente_complemento">Complemento</Label>
            <Input
              id="cliente_complemento"
              value={formData.cliente_complemento}
              onChange={(e) => handleInputChange('cliente_complemento', e.target.value)}
              placeholder="Apto, Bloco, Casa..."
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

          <div>
            <Label htmlFor="cliente_estado">Estado</Label>
            <Input
              id="cliente_estado"
              value={formData.cliente_estado}
              onChange={(e) => handleInputChange('cliente_estado', e.target.value)}
              maxLength={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dados do Equipamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            🔧 Dados do Equipamento
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="equipamento_tipo">Tipo de Equipamento *</Label>
            <Select value={formData.equipamento_tipo} onValueChange={(value) => handleInputChange('equipamento_tipo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {equipamentoTipos.map((tipo, index) => (
                  <SelectItem key={`tipo-${index}`} value={tipo}>{tipo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="equipamento_marca">Marca *</Label>
            <Select value={formData.equipamento_marca} onValueChange={(value) => handleInputChange('equipamento_marca', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a marca" />
              </SelectTrigger>
              <SelectContent>
                {marcas.map((marca, index) => (
                  <SelectItem key={`marca-${index}`} value={marca}>{marca}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div>
            <Label htmlFor="codigo_item">Código do Item</Label>
            <Input
              id="codigo_item"
              value={formData.codigo_item}
              onChange={(e) => handleInputChange('codigo_item', e.target.value)}
              placeholder="Código interno (não visível para cliente)"
            />
          </div>

          <div>
            <Label>Foto/Arquivo do Equipamento</Label>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Tirar Foto
              </Button>
              <Button type="button" variant="outline" className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                Upload Arquivo
              </Button>
            </div>
          </div>

          <div className="md:col-span-2">
            <Label>Acompanha Acessórios</Label>
            <div className="flex space-x-4 mb-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acompanha_acessorios_sim"
                  checked={formData.acompanha_acessorios}
                  onCheckedChange={(checked) => handleInputChange('acompanha_acessorios', checked)}
                />
                <Label htmlFor="acompanha_acessorios_sim">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acompanha_acessorios_nao"
                  checked={!formData.acompanha_acessorios}
                  onCheckedChange={(checked) => handleInputChange('acompanha_acessorios', !checked)}
                />
                <Label htmlFor="acompanha_acessorios_nao">Não</Label>
              </div>
            </div>
            {formData.acompanha_acessorios && (
              <Textarea
                id="acessorios_descricao"
                value={formData.acessorios_descricao}
                onChange={(e) => handleInputChange('acessorios_descricao', e.target.value)}
                placeholder="Descreva os acessórios que acompanham o equipamento..."
              />
            )}
          </div>

          <div>
            <Label htmlFor="estado_fisico_entrega">Estado Físico</Label>
            <Textarea
              id="estado_fisico_entrega"
              value={formData.estado_fisico_entrega}
              onChange={(e) => handleInputChange('estado_fisico_entrega', e.target.value)}
              placeholder="Descreva o estado físico do equipamento"
            />
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            🛠️ Diagnóstico e Autorização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="defeito_relatado">Descrição do Defeito Relatado *</Label>
            <Textarea
              id="defeito_relatado"
              value={formData.defeito_relatado}
              onChange={(e) => handleInputChange('defeito_relatado', e.target.value)}
              placeholder="Descreva o problema relatado pelo cliente..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="observacoes_tecnico_antes">Observações do Técnico (Antes da Entrada)</Label>
              <Textarea
                id="observacoes_tecnico_antes"
                value={formData.observacoes_tecnico_antes}
                onChange={(e) => handleInputChange('observacoes_tecnico_antes', e.target.value)}
                placeholder="Observações técnicas antes da entrada da máquina..."
              />
            </div>

            <div>
              <Label htmlFor="observacoes_tecnico_depois">Observações do Técnico (Depois da Entrada)</Label>
              <Textarea
                id="observacoes_tecnico_depois"
                value={formData.observacoes_tecnico_depois}
                onChange={(e) => handleInputChange('observacoes_tecnico_depois', e.target.value)}
                placeholder="Observações técnicas depois da entrada da máquina..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="testes_realizados">Testes Realizados Durante o Orçamento</Label>
            <Textarea
              id="testes_realizados"
              value={formData.testes_realizados}
              onChange={(e) => handleInputChange('testes_realizados', e.target.value)}
              placeholder="Testes realizados durante o orçamento..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Equipamento Funciona com o Defeito</Label>
              <div className="flex space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="equipamento_funciona_sim"
                    checked={formData.equipamento_funciona_defeito}
                    onCheckedChange={(checked) => handleInputChange('equipamento_funciona_defeito', checked)}
                  />
                  <Label htmlFor="equipamento_funciona_sim">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="equipamento_funciona_nao"
                    checked={!formData.equipamento_funciona_defeito}
                    onCheckedChange={(checked) => handleInputChange('equipamento_funciona_defeito', !checked)}
                  />
                  <Label htmlFor="equipamento_funciona_nao">Não</Label>
                </div>
              </div>
            </div>

            <div>
              <Label>Avaliação Total</Label>
              <div className="flex space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="avaliacao_total_sim"
                    checked={formData.avaliacao_total}
                    onCheckedChange={(checked) => handleInputChange('avaliacao_total', checked)}
                  />
                  <Label htmlFor="avaliacao_total_sim">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="avaliacao_total_nao"
                    checked={!formData.avaliacao_total}
                    onCheckedChange={(checked) => handleInputChange('avaliacao_total', !checked)}
                  />
                  <Label htmlFor="avaliacao_total_nao">Não</Label>
                </div>
              </div>
            </div>
          </div>

          {formData.avaliacao_total && (
            <div>
              <Label htmlFor="pecas_orcamento">Peças a Serem Orçadas</Label>
              <Textarea
                id="pecas_orcamento"
                value={formData.pecas_orcamento}
                onChange={(e) => handleInputChange('pecas_orcamento', e.target.value)}
                placeholder="Liste as peças que serão orçadas na avaliação total..."
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Aplicar Taxa de Orçamento</Label>
              <div className="flex space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aplicar_taxa_sim"
                    checked={formData.aplicar_taxa_orcamento}
                    onCheckedChange={(checked) => handleInputChange('aplicar_taxa_orcamento', checked)}
                  />
                  <Label htmlFor="aplicar_taxa_sim">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="aplicar_taxa_nao"
                    checked={!formData.aplicar_taxa_orcamento}
                    onCheckedChange={(checked) => handleInputChange('aplicar_taxa_orcamento', !checked)}
                  />
                  <Label htmlFor="aplicar_taxa_nao">Não</Label>
                </div>
              </div>
            </div>

            {formData.aplicar_taxa_orcamento && (
              <div>
                <Label htmlFor="valor_taxa_orcamento">Valor da Taxa de Orçamento (R$)</Label>
                <Input
                  id="valor_taxa_orcamento"
                  type="number"
                  step="0.01"
                  value={formData.valor_taxa_orcamento}
                  onChange={(e) => handleInputChange('valor_taxa_orcamento', parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="urgencia"
                checked={formData.urgencia}
                onCheckedChange={(checked) => handleInputChange('urgencia', checked)}
              />
              <Label htmlFor="urgencia">Atendimento Urgente</Label>
            </div>

            <div>
              <Label htmlFor="prazo_garantia_dias">Garantia (dias)</Label>
              <Input
                id="prazo_garantia_dias"
                type="number"
                value={formData.prazo_garantia_dias}
                onChange={(e) => handleInputChange('prazo_garantia_dias', parseInt(e.target.value) || 90)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Valor Antecipado</Label>
              <div className="flex space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tem_valor_antecipado_sim"
                    checked={formData.tem_valor_antecipado}
                    onCheckedChange={(checked) => handleInputChange('tem_valor_antecipado', checked)}
                  />
                  <Label htmlFor="tem_valor_antecipado_sim">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tem_valor_antecipado_nao"
                    checked={!formData.tem_valor_antecipado}
                    onCheckedChange={(checked) => handleInputChange('tem_valor_antecipado', !checked)}
                  />
                  <Label htmlFor="tem_valor_antecipado_nao">Não</Label>
                </div>
              </div>
            </div>

            {formData.tem_valor_antecipado && (
              <div>
                <Label htmlFor="valor_antecipado">Valor Antecipado (R$)</Label>
                <Input
                  id="valor_antecipado"
                  type="number"
                  step="0.01"
                  value={formData.valor_antecipado}
                  onChange={(e) => handleInputChange('valor_antecipado', parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Peças e Materiais */}
      <PecasMateriais 
        pecas={pecas}
        setPecas={setPecas}
        valorMaoObra={formData.valor_mao_obra}
        setValorMaoObra={(valor) => handleInputChange('valor_mao_obra', valor)}
      />

      {/* Prazo e Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            📅 Prazo e Status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Label htmlFor="tecnico_responsavel">Técnico Responsável</Label>
            <Input
              id="tecnico_responsavel"
              value={formData.tecnico_responsavel}
              onChange={(e) => handleInputChange('tecnico_responsavel', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status, index) => (
                  <SelectItem key={`status-${index}`} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Valor Total */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Valor Total da OS:</span>
            <span className="text-2xl text-felmak-blue">
              {formatCurrency(calcularValorTotal())}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Cláusulas Contratuais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            📋 Cláusulas Contratuais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
            <p><strong>Comunicação:</strong> Após a conclusão do serviço, o cliente será comunicado por telefone, e-mail ou aplicativo de mensagens, para retirada do equipamento.</p>
            
            <p><strong>Prazo de Retirada:</strong> Caso o cliente não retire o equipamento no prazo de 90 (noventa) dias corridos, contados da data da comunicação, o bem será considerado abandonado, nos termos do artigo 1.275, III do Código Civil.</p>
            
            <p><strong>Abandono:</strong> A partir desse prazo, poderão ser cobradas taxas de armazenamento e o prestador de serviço poderá, a seu critério, alienar (vender), doar ou descartar o equipamento para ressarcimento dos custos com o serviço, armazenagem e demais despesas decorrentes da permanência do bem no local, isentando-se de qualquer responsabilidade posterior.</p>
            
            <p><strong>Validade da Proposta:</strong> Proposta válida por 30 dias após o comunicado.</p>
            
            <p><strong>Desaprovação:</strong> Em caso de desaprovação da proposta, o prazo para retirada do equipamento é de 5 dias úteis após a comunicação de desacordo.</p>
            
            <p><strong>Garantia:</strong> A garantia aplica-se exclusivamente às peças substituídas e aos serviços efetivamente realizados.</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="aceita_clausulas"
              checked={formData.aceita_clausulas}
              onCheckedChange={(checked) => handleInputChange('aceita_clausulas', checked)}
            />
            <Label htmlFor="aceita_clausulas" className="text-sm">
              Declaro que li e aceito as cláusulas contratuais acima
            </Label>
          </div>

          <div>
            <Label htmlFor="assinatura_cliente">Assinatura do Cliente</Label>
            <Input
              id="assinatura_cliente"
              value={formData.assinatura_cliente}
              onChange={(e) => handleInputChange('assinatura_cliente', e.target.value)}
              placeholder="Nome completo do cliente"
            />
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Visualizar
        </Button>
        <Button type="submit" disabled={loading} className="bg-felmak-blue hover:bg-felmak-blue-dark">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar OS'}
        </Button>
      </div>
    </form>
  );
};

export default NovaOSForm;
