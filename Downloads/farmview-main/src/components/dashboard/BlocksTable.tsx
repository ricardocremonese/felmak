
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Table, TableBody } from '@/components/ui/table';
import { BlocksTableHeader } from './BlocksTableHeader';
import { BlockTableRow } from './BlockTableRow';

interface Block {
  id: string;
  nome_bloco: string;
  area_acres: number;
  produto_usado?: string;
  data_plantio?: string;
  data_aplicacao?: string;
  data_colheita?: string;
  valor_produto?: number;
  cor?: string;
}

interface BlocksTableProps {
  blocks: Block[];
  sortField: string;
  sortDirection: string;
  onSort: (field: string) => void;
  formatDate: (date?: string) => string;
  formatCurrency: (value: number | null) => string;
}

export const BlocksTable = ({ 
  blocks,
  onSort,
  formatDate,
  formatCurrency
}: BlocksTableProps) => {
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-200"
    >
      <h3 className="text-xl font-semibold mb-4">{t('blocks.title')}</h3>
      <div className="overflow-x-auto">
        <Table>
          <BlocksTableHeader onSort={onSort} />
          <TableBody>
            {blocks.map(block => (
              <BlockTableRow
                key={block.id}
                block={block}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};
