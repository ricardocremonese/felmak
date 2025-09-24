import React, { useState } from 'react';
// Forçar atualização do arquivo para sincronizar com GitHub
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
import { buscarCEP, formatarTelefone, formatarCPFCNPJ, formatCurrency } from '@/utils/helpers';
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

  // Estados para acompanha acessórios
  const [acompanhaAcessorios, setAcompanhaAcessorios] = useState<string>('');
  const [acessoriosSelecionados, setAcessoriosSelecionados] = useState<string[]>([]);

  // Estados para equipamento funciona
  const [equipamentoFunciona, setEquipamentoFunciona] = useState<string>('');

  // Estados para assinatura
  const [assinatura, setAssinatura] = useState<string>('');

  // Estados para avaliação total
  const [avaliacaoTotal, setAvaliacaoTotal] = useState<string>('');
  const [pecasSelecionadas, setPecasSelecionadas] = useState<string[]>([]);

  // Estados para taxa de orçamento
  const [aplicarTaxaOrcamento, setAplicarTaxaOrcamento] = useState<string>('');
  const [valorTaxaOrcamento, setValorTaxaOrcamento] = useState<string>('');

  // Estados para valor antecipado
  const [valorAntecipado, setValorAntecipado] = useState<string>('');
  const [valorAntecipadoValor, setValorAntecipadoValor] = useState<string>('');

  // Estado para código do item
  const [codigoItem, setCodigoItem] = useState<string>('');

  // Estado para aceite dos termos
  const [aceitaTermos, setAceitaTermos] = useState<boolean>(false);

  // Estado para data da última alteração do status
  const [dataUltimaAlteracaoStatus, setDataUltimaAlteracaoStatus] = useState<string>('');

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

  const acessoriosDisponiveis = [
    'Maleta',
    'Bateria',
    'Carregador',
    'Broca',
    'Disco',
    'Lixa',
    'Cabo de força',
    'Manual',
    'Outros'
  ];

  const pecasDisponiveis = [
    'Motor',
    'Interruptor',
    'Cabo de força',
    'Rolamento',
    'Escova de carvão',
    'Engrenagem',
    'Parafusos',
    'Arruela',
    'Outros'
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

    // Se o campo alterado for o status, atualiza a data da última alteração
    if (field === 'status') {
      const agora = new Date();
      const dataFormatada = agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setDataUltimaAlteracaoStatus(dataFormatada);
    }
  };

  const handleAcompanhaAcessoriosChange = (value: string) => {
    setAcompanhaAcessorios(value);
    if (value === 'não') {
      setAcessoriosSelecionados([]);
    }
  };

  const handleAcessorioToggle = (acessorio: string) => {
    setAcessoriosSelecionados(prev => 
      prev.includes(acessorio) 
        ? prev.filter(a => a !== acessorio)
        : [...prev, acessorio]
    );
  };

  const handleAvaliacaoTotalChange = (value: string) => {
    setAvaliacaoTotal(value);
    if (value === 'não') {
      setPecasSelecionadas([]);
    }
  };

  const handlePecaToggle = (peca: string) => {
    setPecasSelecionadas(prev => 
      prev.includes(peca) 
        ? prev.filter(p => p !== peca)
        : [...prev, peca]
    );
  };

  const handleAplicarTaxaOrcamentoChange = (value: string) => {
    setAplicarTaxaOrcamento(value);
    if (value === 'não') {
      setValorTaxaOrcamento('');
    }
  };

  const handleValorAntecipadoChange = (value: string) => {
    setValorAntecipado(value);
    if (value === 'não') {
      setValorAntecipadoValor('');
    }
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
        console.error('Erro ao buscar CEP:', error);
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
    const taxaOrcamento = aplicarTaxaOrcamento === 'sim' ? parseFloat(valorTaxaOrcamento) || 0 : 0;
    const valorAntecipadoTotal = valorAntecipado === 'sim' ? parseFloat(valorAntecipadoValor) || 0 : 0;
    return valorPecas + formData.valor_mao_obra + taxaOrcamento - valorAntecipadoTotal;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!aceitaTermos) {
      toast({
        title: "Termos e Condições",
        description: "Você deve aceitar os Termos e Condições para salvar a Ordem de Serviço.",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    try {
      console.log('Iniciando criação da OS...');
      
      const valorPecas = pecas.reduce((total, peca) => total + (peca.quantidade * peca.preco_unitario), 0);
      const taxaOrcamento = aplicarTaxaOrcamento === 'sim' ? parseFloat(valorTaxaOrcamento) || 0 : 0;
      
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
        acessorios_entregues: acompanhaAcessorios === 'sim' ? acessoriosSelecionados.join(', ') : 'Nenhum',
        estado_fisico_entrega: formData.estado_fisico_entrega || null,
        defeito_relatado: formData.defeito_relatado,
        observacoes_tecnico: formData.observacoes_tecnico || null,
        testes_realizados: formData.testes_realizados || null,
        // urgencia: formData.urgencia, // Temporarily disabled until types updated
        valor_mao_obra: formData.valor_mao_obra,
        valor_pecas: valorPecas,
        valor_total: valorPecas + formData.valor_mao_obra + taxaOrcamento,
        data_prevista: formData.data_prevista || null,
        tecnico_responsavel: formData.tecnico_responsavel || null,
        status: formData.status,
        prazo_garantia_dias: formData.prazo_garantia_dias,
        // equipamento_funciona: equipamentoFunciona === 'sim', // Temporarily disabled until types updated
        // assinatura_cliente: assinatura || null, // Temporarily disabled until types updated
        // avaliacao_total: avaliacaoTotal === 'sim' ? pecasSelecionadas.join(', ') : null, // Temporarily disabled until types updated
        // aplicar_taxa_orcamento: aplicarTaxaOrcamento === 'sim', // Temporarily disabled until types updated
        // valor_taxa_orcamento: taxaOrcamento, // Temporarily disabled until types updated
        // valor_antecipado: valorAntecipadoTotal, // Temporarily disabled until types updated
        // codigo_item: codigoItem || null, // Temporarily disabled until types updated
        // data_ultima_alteracao_status: dataUltimaAlteracaoStatus ? new Date(dataUltimaAlteracaoStatus) : null, // Temporarily disabled until types updated
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
      setAcompanhaAcessorios('');
      setAcessoriosSelecionados([]);
      setEquipamentoFunciona('');
      setAssinatura('');
      setAvaliacaoTotal('');
      setPecasSelecionadas([]);
      setAplicarTaxaOrcamento('');
      setValorTaxaOrcamento('');
      setValorAntecipado('');
      setValorAntecipadoValor('');
      setCodigoItem('');
      setAceitaTermos(false);
      setDataUltimaAlteracaoStatus('');

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
                {equipamentoTipos.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
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
                {marcas.map((marca) => (
                  <SelectItem key={marca} value={marca}>{marca}</SelectItem>
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
            <Label htmlFor="acompanha_acessorios">Acompanha Acessórios</Label>
            <Select value={acompanhaAcessorios} onValueChange={handleAcompanhaAcessoriosChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="não">Não</SelectItem>
              </SelectContent>
            </Select>

            {acompanhaAcessorios === 'sim' && (
              <div className="mt-3">
                <Label>Selecione os acessórios:</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {acessoriosDisponiveis.map((acessorio) => (
                    <div key={acessorio} className="flex items-center space-x-2">
                      <Checkbox
                        id={`acessorio-${acessorio}`}
                        checked={acessoriosSelecionados.includes(acessorio)}
                        onCheckedChange={() => handleAcessorioToggle(acessorio)}
                      />
                      <Label htmlFor={`acessorio-${acessorio}`} className="text-sm">
                        {acessorio}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
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

          <div>
            <Label htmlFor="equipamento_funciona">Equipamento funciona com o defeito</Label>
            <Select value={equipamentoFunciona} onValueChange={setEquipamentoFunciona}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="não">Não</SelectItem>
              </SelectContent>
            </Select>
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
              <Label htmlFor="testes_realizados">Testes realizados durante o orçamento</Label>
              <Textarea
                id="testes_realizados"
                value={formData.testes_realizados}
                onChange={(e) => handleInputChange('testes_realizados', e.target.value)}
                placeholder="Testes realizados durante o orçamento..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div>
              <Label htmlFor="codigo_item">Código do item (interno)</Label>
              <Input
                id="codigo_item"
                value={codigoItem}
                onChange={(e) => setCodigoItem(e.target.value)}
                placeholder="Código interno"
              />
              <p className="text-xs text-gray-500 mt-1">Este campo não será exibido ao cliente</p>
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
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Valor Total */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            💰 Valor Total da OS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Valor Total:</span>
            <span className="text-2xl text-felmak-blue">
              {formatCurrency(calcularValorTotal())}
            </span>
          </div>

          <div>
            <Label htmlFor="assinatura">Assinatura</Label>
            <Input
              id="assinatura"
              value={assinatura}
              onChange={(e) => setAssinatura(e.target.value)}
              placeholder="Nome do cliente para assinatura"
            />
          </div>

          <div>
            <Label htmlFor="avaliacao_total">Avaliação total</Label>
            <Select value={avaliacaoTotal} onValueChange={handleAvaliacaoTotalChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="não">Não</SelectItem>
              </SelectContent>
            </Select>

            {avaliacaoTotal === 'sim' && (
              <div className="mt-3">
                <Label>Peças a serem orçadas:</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {pecasDisponiveis.map((peca) => (
                    <div key={peca} className="flex items-center space-x-2">
                      <Checkbox
                        id={`peca-${peca}`}
                        checked={pecasSelecionadas.includes(peca)}
                        onCheckedChange={() => handlePecaToggle(peca)}
                      />
                      <Label htmlFor={`peca-${peca}`} className="text-sm">
                        {peca}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="aplicar_taxa_orcamento">Aplicar taxa de orçamento</Label>
            <Select value={aplicarTaxaOrcamento} onValueChange={handleAplicarTaxaOrcamentoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="não">Não</SelectItem>
              </SelectContent>
            </Select>

            {aplicarTaxaOrcamento === 'sim' && (
              <div className="mt-3">
                <Label htmlFor="valor_taxa_orcamento">Valor da taxa de orçamento</Label>
                <Input
                  id="valor_taxa_orcamento"
                  type="number"
                  value={valorTaxaOrcamento}
                  onChange={(e) => setValorTaxaOrcamento(e.target.value)}
                  placeholder="Digite o valor da taxa"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="valor_antecipado">Valor antecipado</Label>
            <Select value={valorAntecipado} onValueChange={handleValorAntecipadoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="não">Não</SelectItem>
              </SelectContent>
            </Select>

            {valorAntecipado === 'sim' && (
              <div className="mt-3">
                <Label htmlFor="valor_antecipado_valor">Valor do antecipado</Label>
                <Input
                  id="valor_antecipado_valor"
                  type="number"
                  value={valorAntecipadoValor}
                  onChange={(e) => setValorAntecipadoValor(e.target.value)}
                  placeholder="Digite o valor antecipado"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Termos e Condições */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            📋 Termos e Condições
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="space-y-3 text-sm">
              <p>
                <strong>Comunicação de Conclusão:</strong> Após a conclusão do serviço, o cliente será comunicado por telefone, e-mail ou aplicativo de mensagens, para retirada do equipamento.
              </p>
              
              <p>
                <strong>Prazo de Retirada:</strong> Caso o cliente não retire o equipamento no prazo de 90 (noventa) dias corridos, contados da data da comunicação, o bem será considerado abandonado, nos termos do artigo 1.275, III do Código Civil. A partir desse prazo, poderão ser cobradas taxas de armazenamento e o prestador de serviço poderá, a seu critério, alienar (vender), doar ou descartar o equipamento para ressarcimento dos custos com o serviço, armazenagem e demais despesas decorrentes da permanência do bem no local, isentando-se de qualquer responsabilidade posterior.
              </p>
              
              <p>
                <strong>Validade da Proposta:</strong> Proposta válida por 30 dias após o comunicado.
              </p>
              
              <p>
                <strong>Desaprovação da Proposta:</strong> Em caso de desaprovação da proposta, o prazo para retirada do equipamento é de 5 dias úteis após a comunicação de desacordo.
              </p>
              
              <p>
                <strong>Garantia:</strong> A garantia aplica-se exclusivamente às peças substituídas e aos serviços efetivamente realizados.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="aceita_termos"
              checked={aceitaTermos}
              onCheckedChange={(checked) => setAceitaTermos(checked === true)}
            />
            <Label htmlFor="aceita_termos" className="text-sm">
              Declaro que li e aceito os termos e condições acima descritos
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Data da Última Alteração do Status */}
      {dataUltimaAlteracaoStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              🕒 Data da Última Alteração do Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 font-semibold">Última alteração:</span>
                <span className="text-blue-800 font-medium">{dataUltimaAlteracaoStatus}</span>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                Esta data é atualizada automaticamente sempre que o status da OS for alterado.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Visualizar
        </Button>
        <Button type="submit" disabled={loading || !aceitaTermos} className="bg-felmak-blue hover:bg-felmak-blue-dark">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar OS'}
        </Button>
      </div>
    </form>
  );
};

export default NovaOSForm;
