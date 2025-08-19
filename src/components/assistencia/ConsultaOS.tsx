
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
  Filter,
  Calendar
} from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatarTelefone } from '@/utils/helpers';
import jsPDF from 'jspdf';
import EditarOS from './EditarOS';
import VisualizarOS from './VisualizarOS';
import type { Database } from '@/integrations/supabase/types';

// Usar o tipo correto do Supabase
type OrdemServico = Database['public']['Tables']['ordens_servico']['Row'];

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

  // ... keep existing code (statusOptions, meses, anosDisponiveis, statusColors, buscarOrdens, gerarNumeroOS)

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
        // Tentar buscar por número da OS primeiro - usar campo numero_os em vez de numero_os_gerado
        if (filtros.busca.startsWith('OS')) {
          // Extrair o número da OS do formato OS25-0001
          const numeroMatch = filtros.busca.match(/OS\d{2}-(\d{4})/);
          if (numeroMatch) {
            const numeroOS = parseInt(numeroMatch[1]);
            query = query.eq('numero_os', numeroOS);
          }
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

      setOrdens(data || []);
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

  // Função para gerar o número da OS no formato correto
  const gerarNumeroOS = (numeroOS: number, dataEntrada: string | null): string => {
    if (!dataEntrada) return 'Aguardando...';
    
    const ano = new Date(dataEntrada).getFullYear();
    const ano2Digitos = ano.toString().slice(-2);
    return `OS${ano2Digitos}-${numeroOS.toString().padStart(4, '0')}`;
  };

  const gerarPDF = (ordem: OrdemServico) => {
    try {
      const doc = new jsPDF();
      const numeroOSFormatado = gerarNumeroOS(ordem.numero_os, ordem.data_entrada);
      
      // Cabeçalho simples com logo e número da OS
      let yPosition = 20;
      
      // Adicionar logo da empresa (lado esquerdo) - usando o novo logo
      try {
        const logoUrl = '/lovable-uploads/9428a948-19d8-4c0c-abbb-048b4717f2cc.png';
        doc.addImage(logoUrl, 'PNG', 20, yPosition, 60, 20); // Aumentei um pouco o tamanho para melhor visualização
      } catch (error) {
        console.log('Logo não encontrado, continuando sem logo');
      }
      
      // Número da OS (lado direito)
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(`OS: ${numeroOSFormatado}`, 150, yPosition + 10);
      
      // Dados de contato da empresa (abaixo do logo)
      yPosition += 25;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text('Tel: (11) 4368-7395 | (11) 2598-7894', 20, yPosition);
      yPosition += 5;
      doc.text('Av. Senador Vergueiro, 2483 - São Bernardo do Campo', 20, yPosition);
      yPosition += 5;
      doc.text('e-mail: felmak.assist@gmail.com', 20, yPosition);
      
      yPosition += 15;
      
      // Título da seção
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('ORDEM DE SERVIÇO', 20, yPosition);
      yPosition += 15;
      
      // Dados do Cliente - Seção destacada
      doc.setFillColor(245, 245, 245);
      doc.rect(15, yPosition - 5, 180, 8, 'F');
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('DADOS DO CLIENTE', 20, yPosition);
      yPosition += 12;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Nome: ${ordem.cliente_nome}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Telefone: ${formatarTelefone(ordem.cliente_telefone)}`, 20, yPosition);
      
      if (ordem.cliente_email) {
        doc.text(`E-mail: ${ordem.cliente_email}`, 110, yPosition);
      }
      yPosition += 6;
      
      if ((ordem as any).cliente_cpf_cnpj) {
        doc.text(`CPF/CNPJ: ${(ordem as any).cliente_cpf_cnpj}`, 20, yPosition);
        yPosition += 6;
      }
      
      if (ordem.cliente_endereco) {
        doc.text(`Endereço: ${ordem.cliente_endereco}`, 20, yPosition);
        if ((ordem as any).cliente_numero) {
          doc.text(`, ${(ordem as any).cliente_numero}`, doc.getTextWidth(`Endereço: ${ordem.cliente_endereco}`) + 20, yPosition);
        }
        yPosition += 6;
        
        if (ordem.cliente_bairro || ordem.cliente_cidade) {
          doc.text(`${ordem.cliente_bairro || ''} - ${ordem.cliente_cidade || ''} - ${ordem.cliente_estado || ''}`, 20, yPosition);
          yPosition += 6;
        }
        
        if (ordem.cliente_cep) {
          doc.text(`CEP: ${ordem.cliente_cep}`, 20, yPosition);
          yPosition += 6;
        }
      }
      
      yPosition += 8;
      
      // Dados do Equipamento - Seção destacada
      doc.setFillColor(245, 245, 245);
      doc.rect(15, yPosition - 5, 180, 8, 'F');
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('DADOS DO EQUIPAMENTO', 20, yPosition);
      yPosition += 12;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Tipo: ${ordem.equipamento_tipo}`, 20, yPosition);
      doc.text(`Marca: ${ordem.equipamento_marca}`, 110, yPosition);
      yPosition += 6;
      
      if (ordem.equipamento_modelo) {
        doc.text(`Modelo: ${ordem.equipamento_modelo}`, 20, yPosition);
        yPosition += 6;
      }
      
      if (ordem.equipamento_serie) {
        doc.text(`Nº Série: ${ordem.equipamento_serie}`, 20, yPosition);
      }
      
      if ((ordem as any).equipamento_cor) {
        doc.text(`Cor: ${(ordem as any).equipamento_cor}`, 110, yPosition);
      }
      yPosition += 6;
      
      if ((ordem as any).acessorios_entregues) {
        doc.text(`Acessórios: ${(ordem as any).acessorios_entregues}`, 20, yPosition);
        yPosition += 6;
      }
      
      if ((ordem as any).estado_fisico_entrega) {
        doc.text(`Estado Físico: ${(ordem as any).estado_fisico_entrega}`, 20, yPosition);
        yPosition += 6;
      }
      
      yPosition += 8;
      
      // Defeito Relatado - Seção destacada
      if (ordem.defeito_relatado) {
        doc.setFillColor(245, 245, 245);
        doc.rect(15, yPosition - 5, 180, 8, 'F');
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('DEFEITO RELATADO', 20, yPosition);
        yPosition += 12;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const defeitoLines = doc.splitTextToSize(ordem.defeito_relatado, 170);
        doc.text(defeitoLines, 20, yPosition);
        yPosition += defeitoLines.length * 5 + 8;
      }
      
      // Observações Técnicas
      if ((ordem as any).observacoes_tecnico) {
        doc.setFillColor(245, 245, 245);
        doc.rect(15, yPosition - 5, 180, 8, 'F');
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('OBSERVAÇÕES TÉCNICAS', 20, yPosition);
        yPosition += 12;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const obsLines = doc.splitTextToSize((ordem as any).observacoes_tecnico, 170);
        doc.text(obsLines, 20, yPosition);
        yPosition += obsLines.length * 5 + 8;
      }
      
      // Testes Realizados
      if ((ordem as any).testes_realizados) {
        doc.setFillColor(245, 245, 245);
        doc.rect(15, yPosition - 5, 180, 8, 'F');
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('TESTES REALIZADOS', 20, yPosition);
        yPosition += 12;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const testesLines = doc.splitTextToSize((ordem as any).testes_realizados, 170);
        doc.text(testesLines, 20, yPosition);
        yPosition += testesLines.length * 5 + 8;
      }
      
      // Valores - Seção destacada
      doc.setFillColor(245, 245, 245);
      doc.rect(15, yPosition - 5, 180, 8, 'F');
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('VALORES', 20, yPosition);
      yPosition += 12;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      if (ordem.valor_pecas && ordem.valor_pecas > 0) {
        doc.text(`Valor Peças: R$ ${ordem.valor_pecas.toFixed(2).replace('.', ',')}`, 20, yPosition);
        yPosition += 6;
      }
      
      if ((ordem as any).valor_mao_obra && (ordem as any).valor_mao_obra > 0) {
        doc.text(`Mão de Obra: R$ ${(ordem as any).valor_mao_obra.toFixed(2).replace('.', ',')}`, 20, yPosition);
        yPosition += 6;
      }
      
      // Valor total destacado
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`VALOR TOTAL: R$ ${(ordem.valor_total || 0).toFixed(2).replace('.', ',')}`, 20, yPosition);
      yPosition += 10;
      
      if ((ordem as any).autorizacao_orcamento && (ordem as any).autorizacao_orcamento > 0) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Limite Autorizado: R$ ${(ordem as any).autorizacao_orcamento.toFixed(2).replace('.', ',')}`, 20, yPosition);
        yPosition += 8;
      }
      
      // Informações básicas de data (removido a seção "INFORMAÇÕES DE CONTROLE")
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      if (ordem.data_entrada) {
        doc.text(`Data Entrada: ${new Date(ordem.data_entrada).toLocaleDateString('pt-BR')}`, 20, yPosition);
      }
      
      if ((ordem as any).data_prevista) {
        doc.text(`Data Prevista: ${new Date((ordem as any).data_prevista).toLocaleDateString('pt-BR')}`, 110, yPosition);
      }
      yPosition += 6;
      
      if ((ordem as any).data_entrega) {
        doc.text(`Data Entrega: ${new Date((ordem as any).data_entrega).toLocaleDateString('pt-BR')}`, 20, yPosition);
        yPosition += 6;
      }
      
      if (ordem.tecnico_responsavel) {
        doc.text(`Técnico Responsável: ${ordem.tecnico_responsavel}`, 20, yPosition);
        yPosition += 6;
      }
      
      if ((ordem as any).prazo_garantia_dias && (ordem as any).prazo_garantia_dias > 0) {
        doc.text(`Garantia: ${(ordem as any).prazo_garantia_dias} dias`, 20, yPosition);
        yPosition += 6;
      }
      
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
      const numeroOSFormatado = gerarNumeroOS(ordem.numero_os, ordem.data_entrada);
      
      // Criar uma nova janela com o PDF para impressão
      const pdfDataUri = doc.output('datauristring');
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Imprimir OS ${numeroOSFormatado}</title>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                }
                iframe {
                  width: 100%;
                  height: 100vh;
                  border: none;
                }
              </style>
            </head>
            <body>
              <iframe src="${pdfDataUri}" onload="window.print(); window.onafterprint = function() { window.close(); }"></iframe>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        // Fallback se a janela não puder ser aberta
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
      }
      
      toast({
        title: "Abrindo impressão",
        description: `O diálogo de impressão será aberto para a OS ${numeroOSFormatado}.`
      });
    }
  };

  const salvarPDF = (ordem: OrdemServico) => {
    const doc = gerarPDF(ordem);
    if (doc) {
      const numeroOSFormatado = gerarNumeroOS(ordem.numero_os, ordem.data_entrada);
      doc.save(`${numeroOSFormatado}_${ordem.cliente_nome.replace(/\s+/g, '_')}.pdf`);
      toast({
        title: "PDF salvo",
        description: `A OS ${numeroOSFormatado} foi salva como PDF.`
      });
    }
  };

  const gerarMensagemWhatsApp = (ordem: OrdemServico) => {
    const dataEntrada = ordem.data_entrada ? new Date(ordem.data_entrada).toLocaleDateString('pt-BR') : 'N/A';
    const numeroOSFormatado = gerarNumeroOS(ordem.numero_os, ordem.data_entrada);
    const mensagem = `Olá ${ordem.cliente_nome}, sua Ordem de Serviço ${numeroOSFormatado} está com status: Aguardando Aprovação do Cliente.
Entrada: ${dataEntrada}
Equipamento: ${ordem.equipamento_marca} ${ordem.equipamento_modelo || ''}
Valor: R$ ${(ordem.valor_total || 0).toString().replace('.', ',')}
FELMAK Ferramentas Elétricas - São Bernardo do Campo`;

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
                      <TableCell className="font-medium">
                        {gerarNumeroOS(ordem.numero_os, ordem.data_entrada)}
                      </TableCell>
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
                        R$ {(ordem.valor_total || 0).toString().replace('.', ',')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <VisualizarOS ordem={ordem}>
                            <Button size="sm" variant="outline" title="Visualizar">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </VisualizarOS>
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
                          <EditarOS ordem={ordem} onSuccess={buscarOrdens}>
                            <Button size="sm" variant="outline" title="Editar">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </EditarOS>
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
