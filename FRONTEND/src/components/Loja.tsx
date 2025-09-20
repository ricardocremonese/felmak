
import React, { useState } from 'react';
import { Search, Filter, Package, ShoppingCart, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Loja = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Dados mockados dos produtos
  const produtos = [
    {
      id: 1,
      codigo: "DW-FUR-001",
      nome: "Furadeira de Impacto DCD771C2",
      fabricante: "DeWalt",
      categoria: "Máquinas",
      valorVenda: 450.00,
      estoque: 15,
      imagem: "/placeholder.svg"
    },
    {
      id: 2,
      codigo: "MK-ESM-002", 
      nome: "Esmerilhadeira Angular GA4530",
      fabricante: "Makita",
      categoria: "Máquinas", 
      valorVenda: 320.00,
      estoque: 8,
      imagem: "/placeholder.svg"
    },
    {
      id: 3,
      codigo: "BS-MAR-003",
      nome: "Martelete Perfurador GBH 2-20 D",
      fabricante: "Bosch",
      categoria: "Máquinas",
      valorVenda: 580.00,
      estoque: 5,
      imagem: "/placeholder.svg"
    },
    {
      id: 4,
      codigo: "EPI-CAP-001",
      nome: "Capacete de Segurança Classe A",
      fabricante: "3M",
      categoria: "EPIs",
      valorVenda: 45.00,
      estoque: 50,
      imagem: "/placeholder.svg"
    },
    {
      id: 5,
      codigo: "DW-BAT-001",
      nome: "Bateria 20V MAX 4.0Ah",
      fabricante: "DeWalt", 
      categoria: "Acessórios",
      valorVenda: 280.00,
      estoque: 12,
      imagem: "/placeholder.svg"
    },
    {
      id: 6,
      codigo: "MK-LIX-001",
      nome: "Lixa Para Esmerilhadeira 180mm",
      fabricante: "Makita",
      categoria: "Peças",
      valorVenda: 12.50,
      estoque: 100,
      imagem: "/placeholder.svg"
    }
  ];

  const categorias = ['Todos', 'Máquinas', 'EPIs', 'Acessórios', 'Peças'];

  const produtosFiltrados = produtos.filter(produto => {
    const matchSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       produto.fabricante.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchCategory = selectedCategory === 'Todos' || produto.categoria === selectedCategory;
    
    return matchSearch && matchCategory;
  });

  const getEstoqueStatus = (estoque: number) => {
    if (estoque === 0) return { color: 'text-red-600 bg-red-50', text: 'Sem estoque' };
    if (estoque <= 5) return { color: 'text-yellow-600 bg-yellow-50', text: 'Estoque baixo' };
    return { color: 'text-green-600 bg-green-50', text: 'Em estoque' };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loja - Produtos</h1>
          <p className="text-gray-600">Gerencie e visualize todos os produtos disponíveis</p>
        </div>
        <div className="flex space-x-3">
          <Button className="felmak-button-primary">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Nova Venda
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="felmak-card">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Busca */}
            <div className="flex-1">
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
            </div>

            {/* Filtro por categoria */}
            <div className="flex flex-wrap gap-2">
              {categorias.map((categoria) => (
                <Button
                  key={categoria}
                  variant={selectedCategory === categoria ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(categoria)}
                  className={selectedCategory === categoria ? "felmak-button-primary" : "felmak-button-secondary"}
                >
                  <Filter className="w-4 h-4 mr-1" />
                  {categoria}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="felmak-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-felmak-blue" />
              <div>
                <p className="text-sm text-gray-600">Total de Produtos</p>
                <p className="text-xl font-bold">{produtosFiltrados.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="felmak-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-8 h-8 text-felmak-success" />
              <div>
                <p className="text-sm text-gray-600">Em Estoque</p>
                <p className="text-xl font-bold">{produtos.filter(p => p.estoque > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="felmak-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-felmak-warning" />
              <div>
                <p className="text-sm text-gray-600">Estoque Baixo</p>
                <p className="text-xl font-bold">{produtos.filter(p => p.estoque > 0 && p.estoque <= 5).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="felmak-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-felmak-danger" />
              <div>
                <p className="text-sm text-gray-600">Sem Estoque</p>
                <p className="text-xl font-bold">{produtos.filter(p => p.estoque === 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {produtosFiltrados.map((produto) => {
          const estoqueStatus = getEstoqueStatus(produto.estoque);
          
          return (
            <Card key={produto.id} className="felmak-card hover:shadow-lg transition-all">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Imagem do produto */}
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>

                  {/* Informações do produto */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {produto.nome}
                      </h3>
                    </div>
                    
                    <p className="text-xs text-gray-500">Código: {produto.codigo}</p>
                    <p className="text-sm font-medium text-felmak-blue">{produto.fabricante}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        R$ {produto.valorVenda.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {/* Status do estoque */}
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${estoqueStatus.color}`}>
                        {estoqueStatus.text}
                      </span>
                      <span className="text-sm text-gray-600">
                        Qtd: {produto.estoque}
                      </span>
                    </div>

                    {/* Ações */}
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" className="flex-1 felmak-button-primary">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        disabled={produto.estoque === 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Vender
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mensagem quando não há produtos */}
      {produtosFiltrados.length === 0 && (
        <Card className="felmak-card">
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros de busca ou categoria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Loja;
