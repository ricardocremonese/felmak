import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Eye, 
  Edit, 
  FileText, 
  Printer, 
  MessageCircle,
  Filter,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatarTelefone } from '@/utils/helpers';
import jsPDF from 'jspdf';

// Interface simplificada para evitar problemas de tipo
interface OrdemServico {
  id: string;
  numero_os_gerado: string | null;
  cliente_nome: string;
  cliente_telefone: string;
  equipamento_tipo: string;
  equipamento_marca: string;
  equipamento_modelo: string | null;
  status: string | null;
  data_entrada: string | null;
  data_prevista: string | null;
  valor_total: number | null;
  tecnico_responsavel: string | null;
  cliente_email?: string | null;
  cliente_endereco?: string | null;
  cliente_bairro?: string | null;
  cliente_cidade?: string | null;
  cliente_estado?: string | null;
  equipamento_serie?: string | null;
  defeito_relatado?: string;
  observacoes_tecnico?: string | null;
  prazo_garantia_dias?: number | null;
  valor_mao_obra?: number | null;
  valor_pecas?: number | null;
}

const ConsultaOS = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [filtros, setFiltros] = useState({
    busca: '',
    status: '',
    mes: '',
    ano: '',
    dataEspecifica: ''
  });

  const statusOptions = [
    'Em análise', 
    'Aguardando peça', 
    'Aguardando autorização', 
    'Em conserto', 
    'Finalizado', 
    'Entregue'
  ];

  const meses = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const anosDisponiveis = () => {
    const anoAtual = new Date().getFullYear();
    const anos = [];
    for (let i = anoAtual; i >= anoAtual - 5; i--) {
      anos.push(i.toString());
    }
    return anos;
  };

  const statusColors: Record<string, string> = {
    'Em análise': 'bg-yellow-100 text-yellow-800',
    'Aguardando peça': 'bg-orange-100 text-orange-800',
    'Aguardando autorização': 'bg-blue-100 text-blue-800',
    'Em conserto': 'bg-purple-100 text-purple-800',
    'Finalizado': 'bg-green-100 text-green-800',
    'Entregue': 'bg-gray-100 text-gray-800'
  };

  const buscarOrdens = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('ordens_servico')
        .select('*')
        .order('data_entrada', { ascending: false });

      // Aplicar filtros
      if (filtros.busca) {
        // Tentar buscar por número da OS primeiro
        if (filtros.busca.startsWith('OS')) {
          query = query.eq('numero_os_gerado', filtros.busca.toUpperCase());
        } else {
          // Buscar por nome ou telefone
          query = query.or(`cliente_nome.ilike.%${filtros.busca}%,cliente_telefone.ilike.%${filtros.busca}%`);
        }
      }

      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }

      // Filtro por data específica
      if (filtros.dataEspecifica) {
        query = query.gte('data_entrada', filtros.dataEspecifica + 'T00:00:00')
                   .lte('data_entrada', filtros.dataEspecifica + 'T23:59:59');
      }
      // Filtro por mês e ano
      else if (filtros.mes && filtros.ano) {
        const dataInicio = `${filtros.ano}-${filtros.mes}-01T00:00:00`;
        const ultimoDia = new Date(parseInt(filtros.ano), parseInt(filtros.mes), 0).getDate();
        const dataFim = `${filtros.ano}-${filtros.mes}-${ultimoDia.toString().padStart(2, '0')}T23:59:59`;
        query = query.gte('data_entrada', dataInicio).lte('data_entrada', dataFim);
      }
      // Filtro só por ano
      else if (filtros.ano) {
        query = query.gte('data_entrada', `${filtros.ano}-01-01T00:00:00`)
                   .lte('data_entrada', `${filtros.ano}-12-31T23:59:59`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Mapear os dados para garantir a estrutura correta
      const ordensFormatadas = (data || []).map(ordem => ({
        ...ordem,
        numero_os_gerado: ordem.numero_os_gerado || 'Aguardando...',
        status: ordem.status || 'Em análise',
        valor_total: ordem.valor_total || 0
      })) as OrdemServico[];

      setOrdens(ordensFormatadas);
    } catch (error) {
      console.error('Erro ao buscar ordens:', error);
      toast({
        title: "Erro ao buscar ordens",
        description: "Ocorreu um erro ao carregar as ordens de serviço.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const gerarPDF = (ordem: OrdemServico) => {
    try {
      const doc = new jsPDF();
      
      // Cabeçalho
      doc.setFontSize(20);
      doc.text('FELMAK Ferramentas Elétricas', 20, 20);
      doc.setFontSize(16);
      doc.text(`Ordem de Serviço ${ordem.numero_os_gerado || 'N/A'}`, 20, 30);
      
      // Linha divisória
      doc.line(20, 35, 190, 35);
      
      let yPosition = 45;
      
      // Dados do Cliente
      doc.setFontSize(14);
      doc.text('DADOS DO CLIENTE', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text(`Nome: ${ordem.cliente_nome}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Telefone: ${formatarTelefone(ordem.cliente_telefone)}`, 20, yPosition);
      yPosition += 7;
      if (ordem.cliente_email) {
        doc.text(`E-mail: ${ordem.cliente_email}`, 20, yPosition);
        yPosition += 7;
      }
      if (ordem.cliente_endereco) {
        doc.text(`Endereço: ${ordem.cliente_endereco}, ${ordem.cliente_bairro || ''}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Cidade: ${ordem.cliente_cidade || ''} - ${ordem.cliente_estado || ''}`, 20, yPosition);
        yPosition += 7;
      }
      
      yPosition += 5;
      
      // Dados do Equipamento
      doc.setFontSize(14);
      doc.text('DADOS DO EQUIPAMENTO', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text(`Tipo: ${ordem.equipamento_tipo}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Marca: ${ordem.equipamento_marca}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Modelo: ${ordem.equipamento_modelo || 'N/A'}`, 20, yPosition);
      yPosition += 7;
      if (ordem.equipamento_serie) {
        doc.text(`Série: ${ordem.equipamento_serie}`, 20, yPosition);
        yPosition += 7;
      }
      
      yPosition += 5;
      
      // Defeito e Observações
      if (ordem.defeito_relatado) {
        doc.setFontSize(14);
        doc.text('DEFEITO RELATADO', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        const defeitoLines = doc.splitTextToSize(ordem.defeito_relatado, 170);
        doc.text(defeitoLines, 20, yPosition);
        yPosition += defeitoLines.length * 7 + 5;
      }
      
      if (ordem.observacoes_tecnico) {
        doc.setFontSize(14);
        doc.text('OBSERVAÇÕES TÉCNICAS', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        const obsLines = doc.splitTextToSize(ordem.observacoes_tecnico, 170);
        doc.text(obsLines, 20, yPosition);
        yPosition += obsLines.length * 7 + 5;
      }
      
      // Valores
      doc.setFontSize(14);
      doc.text('VALORES', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      if (ordem.valor_pecas) {
        doc.text(`Valor Peças: R$ ${ordem.valor_pecas.toFixed(2).replace('.', ',')}`, 20, yPosition);
        yPosition += 7;
      }
      if (ordem.valor_mao_obra) {
        doc.text(`Mão de Obra: R$ ${ordem.valor_mao_obra.toFixed(2).replace('.', ',')}`, 20, yPosition);
        yPosition += 7;
      }
      doc.setFontSize(12);
      doc.text(`TOTAL: R$ ${(ordem.valor_total || 0).toFixed(2).replace('.', ',')}`, 20, yPosition);
      yPosition += 10;
      
      // Status e Datas
      doc.setFontSize(14);
      doc.text('STATUS E PRAZOS', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text(`Status: ${ordem.status || 'Em análise'}`, 20, yPosition);
      yPosition += 7;
      if (ordem.data_entrada) {
        doc.text(`Data Entrada: ${new Date(ordem.data_entrada).toLocaleDateString('pt-BR')}`, 20, yPosition);
        yPosition += 7;
      }
      if (ordem.data_prevista) {
        doc.text(`Data Prevista: ${new Date(ordem.data_prevista).toLocaleDateString('pt-BR')}`, 20, yPosition);
        yPosition += 7;
      }
      if (ordem.tecnico_responsavel) {
        doc.text(`Técnico: ${ordem.tecnico_responsavel}`, 20, yPosition);
        yPosition += 7;
      }
      if (ordem.prazo_garantia_dias) {
        doc.text(`Garantia: ${ordem.prazo_garantia_dias} dias`, 20, yPosition);
        yPosition += 7;
      }
      
      // Rodapé
      doc.setFontSize(8);
      doc.text('FELMAK Ferramentas Elétricas - São Bernardo do Campo', 20, 280);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, 285);
      
      return doc;
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
        variant: "destructive"
      });
      return null;
    }
  };

  const imprimirOS = (ordem: OrdemServico) => {
    const doc = gerarPDF(ordem);
    if (doc) {
      doc.autoPrint();
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 100);
      };
      
      toast({
        title: "Imprimindo OS",
        description: `A OS ${ordem.numero_os_gerado || 'N/A'} está sendo impressa.`
      });
    }
  };

  const salvarPDF = (ordem: OrdemServico) => {
    const doc = gerarPDF(ordem);
    if (doc) {
      doc.save(`${ordem.numero_os_gerado || 'OS'}_${ordem.cliente_nome.replace(/\s+/g, '_')}.pdf`);
      toast({
        title: "PDF salvo",
        description: `A OS ${ordem.numero_os_gerado || 'N/A'} foi salva como PDF.`
      });
    }
  };

  const gerarMensagemWhatsApp = (ordem: OrdemServico) => {
    const dataEntrada = ordem.data_entrada ? new Date(ordem.data_entrada).toLocaleDateString('pt-BR') : 'N/A';
    const mensagem = `Olá ${ordem.cliente_nome}, sua Ordem de Serviço ${ordem.numero_os_gerado || 'N/A'} está com status: ${ordem.status || 'Em análise'}.
📅 Entrada: ${dataEntrada}
🛠️ Equipamento: ${ordem.equipamento_marca} ${ordem.equipamento_modelo || ''}
💰 Valor: R$ ${(ordem.valor_total || 0).toFixed(2).replace('.', ',')}
📝 FELMAK Ferramentas Elétricas - São Bernardo do Campo`;

    const telefone = ordem.cliente_telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      status: '',
      mes: '',
      ano: '',
      dataEspecifica: ''
    });
  };

  useEffect(() => {
    buscarOrdens();
  }, []);

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <Label htmlFor="busca">Buscar por nome, telefone ou nº OS (ex: OS25-0001)</Label>
              <Input
                id="busca"
                value={filtros.busca}
                onChange={(e) => handleFiltroChange('busca', e.target.value)}
                placeholder="Digite para buscar..."
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filtros.status} onValueChange={(value) => handleFiltroChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ano">Ano</Label>
              <Select value={filtros.ano} onValueChange={(value) => handleFiltroChange('ano', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os anos</SelectItem>
                  {anosDisponiveis().map(ano => (
                    <SelectItem key={ano} value={ano}>{ano}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mes">Mês</Label>
              <Select value={filtros.mes} onValueChange={(value) => handleFiltroChange('mes', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os meses</SelectItem>
                  {meses.map(mes => (
                    <SelectItem key={mes.value} value={mes.value}>{mes.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="dataEspecifica">Ou buscar por data específica</Label>
              <Input
                id="dataEspecifica"
                type="date"
                value={filtros.dataEspecifica}
                onChange={(e) => handleFiltroChange('dataEspecifica', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
            <Button onClick={buscarOrdens} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>
            Ordens de Serviço ({ordens.length} encontradas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordens.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma ordem de serviço encontrada.</p>
              <p className="text-sm mt-2">Tente ajustar os filtros de busca.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº OS</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Entrada</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordens.map((ordem) => (
                    <TableRow key={ordem.id}>
                      <TableCell className="font-medium">{ordem.numero_os_gerado || 'Aguardando...'}</TableCell>
                      <TableCell>{ordem.cliente_nome}</TableCell>
                      <TableCell>{formatarTelefone(ordem.cliente_telefone)}</TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{ordem.equipamento_marca}</span>
                          <br />
                          <span className="text-sm text-gray-500">
                            {ordem.equipamento_tipo} {ordem.equipamento_modelo || ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[ordem.status || 'Em análise'] || 'bg-gray-100 text-gray-800'}>
                          {ordem.status || 'Em análise'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ordem.data_entrada ? new Date(ordem.data_entrada).toLocaleDateString('pt-BR') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        R$ {(ordem.valor_total || 0).toFixed(2).replace('.', ',')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" title="Visualizar">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Imprimir"
                            onClick={() => imprimirOS(ordem)}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Salvar em PDF"
                            onClick={() => salvarPDF(ordem)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" title="Editar">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="WhatsApp"
                            onClick={() => gerarMensagemWhatsApp(ordem)}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultaOS;
