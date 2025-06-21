
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  QrCode, 
  Edit, 
  AlertTriangle, 
  Package,
  Camera,
  Barcode
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Estoque = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [scanMode, setScanMode] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    fabricante: '',
    categoria: '',
    valorCusto: '',
    valorVenda: '',
    quantidade: ''
  });

  // Dados mockados
  const produtos = [
    {
      id: 1,
      codigo: "DW-FUR-001",
      nome: "Furadeira de Impacto DCD771C2",
      fabricante: "DeWalt",
      categoria: "Máquinas",
      valorCusto: 350.00,
      valorVenda: 450.00,
      estoque: 15
    },
    {
      id: 2,
      codigo: "MK-ESM-002",
      nome: "Esmerilhadeira Angular GA4530",
      fabricante: "Makita", 
      categoria: "Máquinas",
      valorCusto: 250.00,
      valorVenda: 320.00,
      estoque: 8
    },
    {
      id: 3,
      codigo: "BS-MAR-003", 
      nome: "Martelete Perfurador GBH 2-20 D",
      fabricante: "Bosch",
      categoria: "Máquinas",
      valorCusto: 450.00,
      valorVenda: 580.00,
      estoque: 3 // Estoque baixo
    },
    {
      id: 4,
      codigo: "EPI-CAP-001",
      nome: "Capacete de Segurança Classe A",
      fabricante: "3M",
      categoria: "EPIs", 
      valorCusto: 30.00,
      valorVenda: 45.00,
      estoque: 50
    },
    {
      id: 5,
      codigo: "DW-BAT-001",
      nome: "Bateria 20V MAX 4.0Ah",
      fabricante: "DeWalt",
      categoria: "Acessórios",
      valorCusto: 200.00,
      valorVenda: 280.00,
      estoque: 0 // Sem estoque
    }
  ];

  const categorias = ['Máquinas', 'EPIs', 'Acessórios', 'Peças'];
  const fabricantes = ['DeWalt', 'Makita', 'Bosch', '3M', 'Outros'];

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.fabricante.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const produtosEstoqueBaixo = produtos.filter(p => p.estoque > 0 && p.estoque <= 5);
  const produtosSemEstoque = produtos.filter(p => p.estoque === 0);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScanCode = () => {
    setScanMode(true);
    // Simular leitura de código
    setTimeout(() => {
      const codigoEscaneado = "DW-FUR-002";
      setFormData(prev => ({ ...prev, codigo: codigoEscaneado }));
      setScanMode(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Produto cadastrado:', formData);
    setShowAddProduct(false);
    setFormData({
      codigo: '',
      nome: '',
      fabricante: '',
      categoria: '',
      valorCusto: '',
      valorVenda: '',
      quantidade: ''
    });
  };

  const getEstoqueStatus = (estoque: number) => {
    if (estoque === 0) return { color: 'text-red-600 bg-red-50 border-red-200', text: 'Sem estoque', icon: '🔴' };
    if (estoque <= 5) return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', text: 'Estoque baixo', icon: '🟡' };
    return { color: 'text-green-600 bg-green-50 border-green-200', text: 'Em estoque', icon: '🟢' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle de Estoque</h1>
          <p className="text-gray-600">Gerencie produtos, preços e quantidades</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={handleScanCode}
            disabled={scanMode}
          >
            {scanMode ? <Camera className="w-4 h-4 mr-2 animate-pulse" /> : <QrCode className="w-4 h-4 mr-2" />}
            {scanMode ? 'Escaneando...' : '📷 Escanear Código'}
          </Button>
          <Button 
            onClick={() => setShowAddProduct(!showAddProduct)}
            className="felmak-button-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Resumo do Estoque */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="felmak-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-felmak-blue" />
              <div>
                <p className="text-sm text-gray-600">Total de Produtos</p>
                <p className="text-xl font-bold">{produtos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="felmak-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-felmak-success" />
              <div>
                <p className="text-sm text-gray-600">Em Estoque</p>
                <p className="text-xl font-bold">{produtos.filter(p => p.estoque > 5).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="felmak-card border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-felmak-warning" />
              <div>
                <p className="text-sm text-yellow-600">Estoque Baixo</p>
                <p className="text-xl font-bold text-yellow-600">{produtosEstoqueBaixo.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="felmak-card border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-felmak-danger" />
              <div>
                <p className="text-sm text-red-600">Sem Estoque</p>
                <p className="text-xl font-bold text-red-600">{produtosSemEstoque.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de Cadastro */}
      {showAddProduct && (
        <Card className="felmak-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-felmak-blue" />
              <span>Cadastrar Novo Produto</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código do Produto</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="codigo"
                      type="text"
                      placeholder="Ex: DW-FUR-001"
                      value={formData.codigo}
                      onChange={(e) => handleInputChange('codigo', e.target.value)}
                      className="felmak-input"
                      required
                    />
                    <Button type="button" size="sm" variant="outline" onClick={handleScanCode}>
                      <Barcode className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Ex: Furadeira de Impacto"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    className="felmak-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fabricante">Fabricante</Label>
                  <Select value={formData.fabricante} onValueChange={(value) => handleInputChange('fabricante', value)}>
                    <SelectTrigger className="felmak-input">
                      <SelectValue placeholder="Selecione o fabricante" />
                    </SelectTrigger>
                    <SelectContent>
                      {fabricantes.map((fabricante) => (
                        <SelectItem key={fabricante} value={fabricante}>{fabricante}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                    <SelectTrigger className="felmak-input">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorCusto">Valor de Custo (R$)</Label>
                  <Input
                    id="valorCusto"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.valorCusto}
                    onChange={(e) => handleInputChange('valorCusto', e.target.value)}
                    className="felmak-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorVenda">Valor de Venda (R$)</Label>
                  <Input
                    id="valorVenda"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.valorVenda}
                    onChange={(e) => handleInputChange('valorVenda', e.target.value)}
                    className="felmak-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade em Estoque</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    placeholder="0"
                    value={formData.quantidade}
                    onChange={(e) => handleInputChange('quantidade', e.target.value)}
                    className="felmak-input"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddProduct(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="felmak-button-primary">
                  Cadastrar Produto
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Busca */}
      <Card className="felmak-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por nome, código ou fabricante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 felmak-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <Card className="felmak-card">
        <CardHeader>
          <CardTitle>Produtos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Código</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Produto</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Fabricante</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Categoria</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Custo</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Venda</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Estoque</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((produto) => {
                  const status = getEstoqueStatus(produto.estoque);
                  
                  return (
                    <tr key={produto.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                          {status.icon} {status.text}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-medium text-felmak-blue">{produto.codigo}</td>
                      <td className="py-3 px-2">{produto.nome}</td>
                      <td className="py-3 px-2">{produto.fabricante}</td>
                      <td className="py-3 px-2">{produto.categoria}</td>
                      <td className="py-3 px-2">R$ {produto.valorCusto.toFixed(2).replace('.', ',')}</td>
                      <td className="py-3 px-2 font-medium">R$ {produto.valorVenda.toFixed(2).replace('.', ',')}</td>
                      <td className="py-3 px-2">
                        <span className={produto.estoque <= 5 ? 'font-bold text-red-600' : ''}>
                          {produto.estoque}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Estoque */}
      {(produtosEstoqueBaixo.length > 0 || produtosSemEstoque.length > 0) && (
        <div className="space-y-4">
          {/* Estoque Baixo */}
          {produtosEstoqueBaixo.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-800">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Produtos com Estoque Baixo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {produtosEstoqueBaixo.map((produto) => (
                    <div key={produto.id} className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="font-medium">{produto.nome}</span>
                      <span className="text-yellow-600 font-bold">Apenas {produto.estoque} unidades</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sem Estoque */}
          {produtosSemEstoque.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-800">
                  <Package className="w-5 h-5" />
                  <span>Produtos Sem Estoque</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {produtosSemEstoque.map((produto) => (
                    <div key={produto.id} className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="font-medium">{produto.nome}</span>
                      <span className="text-red-600 font-bold">SEM ESTOQUE</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Estoque;
