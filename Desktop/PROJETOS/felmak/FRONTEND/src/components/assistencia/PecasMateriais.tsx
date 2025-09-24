
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseCurrencyValue } from '@/utils/helpers';

interface Peca {
  id: string;
  nome: string;
  fabricante: string;
  quantidade: number;
  preco_unitario: number;
}

interface PecasMateriaisProps {
  pecas: Peca[];
  setPecas: React.Dispatch<React.SetStateAction<Peca[]>>;
  valorMaoObra: number;
  setValorMaoObra: (valor: number) => void;
}

const PecasMateriais: React.FC<PecasMateriaisProps> = ({
  pecas,
  setPecas,
  valorMaoObra,
  setValorMaoObra
}) => {
  const { toast } = useToast();
  const [novaPeca, setNovaPeca] = useState({
    nome: '',
    fabricante: '',
    quantidade: 1,
    preco_unitario: 0
  });
  const [precoInput, setPrecoInput] = useState('');
  const [maoObraInput, setMaoObraInput] = useState('');

  const adicionarPeca = () => {
    if (!novaPeca.nome.trim()) {
      toast({
        title: "Nome da peça obrigatório",
        description: "Por favor, informe o nome da peça.",
        variant: "destructive"
      });
      return;
    }

    if (novaPeca.preco_unitario <= 0) {
      toast({
        title: "Preço inválido",
        description: "Por favor, informe um preço válido para a peça.",
        variant: "destructive"
      });
      return;
    }

    const peca: Peca = {
      id: Date.now().toString(),
      nome: novaPeca.nome,
      fabricante: novaPeca.fabricante,
      quantidade: novaPeca.quantidade,
      preco_unitario: novaPeca.preco_unitario
    };

    setPecas(prev => [...prev, peca]);
    setNovaPeca({ nome: '', fabricante: '', quantidade: 1, preco_unitario: 0 });
    setPrecoInput('');
    
    toast({
      title: "Peça adicionada",
      description: `${peca.nome} foi adicionada à lista.`
    });
  };

  const removerPeca = (id: string) => {
    setPecas(prev => prev.filter(peca => peca.id !== id));
    toast({
      title: "Peça removida",
      description: "A peça foi removida da lista."
    });
  };

  const calcularSubtotalPecas = () => {
    return pecas.reduce((total, peca) => total + (peca.quantidade * peca.preco_unitario), 0);
  };

  const calcularTotal = () => {
    return calcularSubtotalPecas() + valorMaoObra;
  };

  const handlePrecoInputChange = (value: string) => {
    setPrecoInput(value);
    const numericValue = parseCurrencyValue(value);
    setNovaPeca(prev => ({ ...prev, preco_unitario: numericValue }));
  };

  const handleMaoObraInputChange = (value: string) => {
    setMaoObraInput(value);
    const numericValue = parseCurrencyValue(value);
    setValorMaoObra(numericValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          📦 Peças e Materiais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Adicionar Nova Peça */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label htmlFor="nome_peca">Nome da Peça</Label>
            <Input
              id="nome_peca"
              value={novaPeca.nome}
              onChange={(e) => setNovaPeca(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Digite o nome da peça"
            />
          </div>
          
          <div>
            <Label htmlFor="fabricante_peca">Fabricante/Distribuidor</Label>
            <Input
              id="fabricante_peca"
              value={novaPeca.fabricante}
              onChange={(e) => setNovaPeca(prev => ({ ...prev, fabricante: e.target.value }))}
              placeholder="Nome do fabricante"
            />
          </div>
          
          <div>
            <Label htmlFor="quantidade_peca">Quantidade</Label>
            <Input
              id="quantidade_peca"
              type="number"
              min="1"
              value={novaPeca.quantidade}
              onChange={(e) => setNovaPeca(prev => ({ ...prev, quantidade: parseInt(e.target.value) || 1 }))}
            />
          </div>
          
          <div>
            <Label htmlFor="preco_peca">Preço Unitário</Label>
            <Input
              id="preco_peca"
              value={precoInput}
              onChange={(e) => handlePrecoInputChange(e.target.value)}
              placeholder="R$ 0,00"
            />
          </div>
          
          <div className="flex items-end">
            <Button 
              type="button" 
              onClick={adicionarPeca}
              className="w-full bg-felmak-blue hover:bg-felmak-blue-dark"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Lista de Peças */}
        {pecas.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Peças Adicionadas:</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Peça</TableHead>
                  <TableHead>Fabricante/Distribuidor</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Preço Unit.</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pecas.map((peca) => (
                  <TableRow key={peca.id}>
                    <TableCell>{peca.nome}</TableCell>
                    <TableCell>{peca.fabricante || '-'}</TableCell>
                    <TableCell>{peca.quantidade}</TableCell>
                    <TableCell>R$ {peca.preco_unitario.toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell>R$ {(peca.quantidade * peca.preco_unitario).toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removerPeca(peca.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Valores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <Label htmlFor="valor_mao_obra">Valor da Mão de Obra</Label>
            <Input
              id="valor_mao_obra"
              value={maoObraInput}
              onChange={(e) => handleMaoObraInputChange(e.target.value)}
              placeholder="R$ 0,00"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal Peças:</span>
              <span>R$ {calcularSubtotalPecas().toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between">
              <span>Mão de Obra:</span>
              <span>R$ {valorMaoObra.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-felmak-blue">R$ {calcularTotal().toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PecasMateriais;
