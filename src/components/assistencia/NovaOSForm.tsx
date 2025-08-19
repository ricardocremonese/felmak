import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Camera, Save, FileText, MessageCircle, MapPin, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { buscarCEP, formatarTelefone, formatarCPFCNPJ, formatCurrency, parseCurrencyValue, formatCurrencyInput } from '@/utils/helpers';
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
  equipamento_cor: string;
  acessorios_entregues: string;
  estado_fisico_entrega: string;
  
  // Diagnóstico
  defeito_relatado: string;
  observacoes_tecnico: string;
  testes_realizados: string;
  urgencia: boolean;
  
  // Valores
  valor_mao_obra: number;
  
  // Status
  data_prevista: string;
  tecnico_responsavel: string;
  status: string;
  prazo_garantia_dias: number;
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
    equipamento_cor: '',
    acessorios_entregues: '',
    estado_fisico_entrega: '',
    defeito_relatado: '',
    observacoes_tecnico: '',
    testes_realizados: '',
    urgencia: false,
    valor_mao_obra: 0,
    data_prevista: '',
    tecnico_responsavel: '',
    status: 'Em análise',
    prazo_garantia_dias: 90
  });

  const equipamentoTipos = [
    'Britadeira', 
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
    'Entregue'
  ];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCurrencyInputChange = (field: keyof FormData, value: string) => {
    const numericValue = parseCurrencyValue(value);
    setFormData(prev => ({ ...prev, [field]: numericValue }));
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
        // cliente_complemento: formData.cliente_complemento, // Temporarily disabled until types updated
        cliente_bairro: formData.cliente_bairro || null,
        cliente_cidade: formData.cliente_cidade || null,
        cliente_estado: formData.cliente_estado || null,
        cliente_cpf_cnpj: formData.cliente_cpf_cnpj || null,
        equipamento_tipo: formData.equipamento_tipo,
        equipamento_marca: formData.equipamento_marca,
        equipamento_modelo: formData.equipamento_modelo || null,
        equipamento_serie: formData.equipamento_serie || null,
        equipamento_cor: formData.equipamento_cor || null,
        acessorios_entregues: formData.acessorios_entregues || null,
        estado_fisico_entrega: formData.estado_fisico_entrega || null,
        defeito_relatado: formData.defeito_relatado,
        observacoes_tecnico: formData.observacoes_tecnico || null,
        testes_realizados: formData.testes_realizados || null,
        // urgencia: formData.urgencia, // Temporarily disabled until types updated
        valor_mao_obra: formData.valor_mao_obra,
        valor_pecas: valorPecas,
        valor_total: valorPecas + formData.valor_mao_obra,
        data_prevista: formData.data_prevista || null,
        tecnico_responsavel: formData.tecnico_responsavel || null,
        status: formData.status,
        prazo_garantia_dias: formData.prazo_garantia_dias
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
        equipamento_cor: '',
        acessorios_entregues: '',
        estado_fisico_entrega: '',
        defeito_relatado: '',
        observacoes_tecnico: '',
        testes_realizados: '',
        urgencia: false,
        valor_mao_obra: 0,
        data_prevista: '',
        tecnico_responsavel: '',
        status: 'Em análise',
        prazo_garantia_dias: 90
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
            <Label htmlFor="equipamento_cor">Cor</Label>
            <Input
              id="equipamento_cor"
              value={formData.equipamento_cor}
              onChange={(e) => handleInputChange('equipamento_cor', e.target.value)}
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
            <Label htmlFor="acessorios_entregues">Acessórios Entregues</Label>
            <Textarea
              id="acessorios_entregues"
              value={formData.acessorios_entregues}
              onChange={(e) => handleInputChange('acessorios_entregues', e.target.value)}
              placeholder="Ex: Maleta, bateria, carregador, broca..."
            />
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
              <Label htmlFor="observacoes_tecnico">Observações do Técnico</Label>
              <Textarea
                id="observacoes_tecnico"
                value={formData.observacoes_tecnico}
                onChange={(e) => handleInputChange('observacoes_tecnico', e.target.value)}
                placeholder="Observações técnicas..."
              />
            </div>

            <div>
              <Label htmlFor="testes_realizados">Testes Realizados</Label>
              <Textarea
                id="testes_realizados"
                value={formData.testes_realizados}
                onChange={(e) => handleInputChange('testes_realizados', e.target.value)}
                placeholder="Testes realizados na entrada..."
              />
            </div>
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
