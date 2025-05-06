
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowUpDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BlockColorIndicator } from './BlockColorIndicator';

interface Block {
  id: string;
  nome_bloco: string;
  area_acres: number;
  produto_usado?: string;
  data_plantio?: string;
  data_aplicacao?: string;
  proxima_colheita?: string;
  valor_produto?: number;
  cor?: string;
}

interface FarmBlocksTableProps {
  blocks: Block[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  formatDate: (date?: string) => string;
  formatCurrency: (value: number) => string;
  formatArea: (area: number) => string;
  language: string;
}

export const FarmBlocksTable = ({
  blocks,
  sortField,
  sortDirection,
  onSort,
  formatDate,
  formatCurrency,
  formatArea,
}: FarmBlocksTableProps) => {
  const { t } = useTranslation();

  const getSortIcon = (fieldName: string) => {
    if (sortField === fieldName) {
      return (
        <ArrowUpDown 
          size={16} 
          className={`ml-1 transition-transform ${
            sortDirection === 'desc' ? 'rotate-180' : ''
          }`}
        />
      );
    }
    return <ArrowUpDown size={16} className="ml-1 opacity-50" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 shadow-md rounded-2xl"
    >
      <h2 className="text-xl font-bold mb-4">{t('dashboard.farmBlocks')}</h2>
      
      <ScrollArea className="h-[500px] overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead 
                className="font-bold cursor-pointer" 
                onClick={() => onSort('nome_bloco')}
              >
                <div className="flex items-center">
                  {t('blocks.name')}
                  {getSortIcon('nome_bloco')}
                </div>
              </TableHead>
              
              <TableHead 
                className="font-bold cursor-pointer" 
                onClick={() => onSort('area_acres')}
              >
                <div className="flex items-center">
                  {t('blocks.area')}
                  {getSortIcon('area_acres')}
                </div>
              </TableHead>
              
              <TableHead 
                className="font-bold cursor-pointer" 
                onClick={() => onSort('produto_usado')}
              >
                <div className="flex items-center">
                  {t('blocks.product')}
                  {getSortIcon('produto_usado')}
                </div>
              </TableHead>
              
              <TableHead 
                className="font-bold cursor-pointer" 
                onClick={() => onSort('data_plantio')}
              >
                <div className="flex items-center">
                  {t('blocks.plantingDate')}
                  {getSortIcon('data_plantio')}
                </div>
              </TableHead>
              
              <TableHead 
                className="font-bold cursor-pointer" 
                onClick={() => onSort('data_aplicacao')}
              >
                <div className="flex items-center">
                  {t('blocks.lastApplication')}
                  {getSortIcon('data_aplicacao')}
                </div>
              </TableHead>
              
              <TableHead 
                className="font-bold cursor-pointer" 
                onClick={() => onSort('proxima_colheita')}
              >
                <div className="flex items-center">
                  {t('blocks.nextHarvest')}
                  {getSortIcon('proxima_colheita')}
                </div>
              </TableHead>
              
              <TableHead 
                className="font-bold cursor-pointer" 
                onClick={() => onSort('valor_produto')}
              >
                <div className="flex items-center">
                  {t('blocks.totalSpent')}
                  {getSortIcon('valor_produto')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {blocks.map((block, index) => (
              <TableRow 
                key={block.id}
                className={index % 2 === 1 ? 'bg-gray-50' : ''}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <BlockColorIndicator
                      color={block.cor || '#4caf50'}
                      name={block.nome_bloco}
                      product={block.produto_usado}
                    />
                    {block.nome_bloco}
                  </div>
                </TableCell>
                <TableCell>{formatArea(block.area_acres)}</TableCell>
                <TableCell>{block.produto_usado || '-'}</TableCell>
                <TableCell>{formatDate(block.data_plantio)}</TableCell>
                <TableCell>{formatDate(block.data_aplicacao)}</TableCell>
                <TableCell>{formatDate(block.proxima_colheita)}</TableCell>
                <TableCell>
                  {block.valor_produto 
                    ? formatCurrency(block.valor_produto) 
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </motion.div>
  );
};
