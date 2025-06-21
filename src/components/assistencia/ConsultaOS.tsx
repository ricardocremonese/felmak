
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

interface OrdemServico {
  id: string;
  numero_os: number;
  cliente_nome: string;
  cliente_telefone: string;
  equipamento_tipo: string;
  equipamento_marca: string;
  equipamento_modelo: string;
  status: string;
  data_entrada: string;
  data_prevista: string;
  valor_total: number;
  tecnico_responsavel: string;
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
        const numeroOS = parseInt(filtros.busca);
        if (!isNaN(numeroOS)) {
          query = query.eq('numero_os', numeroOS);
        } else {
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

  const gerarMensagemWhatsApp = (ordem: OrdemServico) => {
    const dataEntrada = new Date(ordem.data_entrada).toLocaleDateString('pt-BR');
    const mensagem = `Olá ${ordem.cliente_nome}, sua Ordem de Serviço #${ordem.numero_os} está com status: ${ordem.status}.
📅 Entrada: ${dataEntrada}
🛠️ Equipamento: ${ordem.equipamento_marca} ${ordem.equipamento_modelo}
💰 Valor: R$ ${ordem.valor_total.toFixed(2).replace('.', ',')}
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
              <Label htmlFor="busca">Buscar por nome, telefone ou nº OS</Label>
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
                      <TableCell className="font-medium">#{ordem.numero_os}</TableCell>
                      <TableCell>{ordem.cliente_nome}</TableCell>
                      <TableCell>{formatarTelefone(ordem.cliente_telefone)}</TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{ordem.equipamento_marca}</span>
                          <br />
                          <span className="text-sm text-gray-500">
                            {ordem.equipamento_tipo} {ordem.equipamento_modelo}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[ordem.status] || 'bg-gray-100 text-gray-800'}>
                          {ordem.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(ordem.data_entrada).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        R$ {ordem.valor_total.toFixed(2).replace('.', ',')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" title="Visualizar">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" title="Editar">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" title="Imprimir">
                            <Printer className="w-4 h-4" />
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
