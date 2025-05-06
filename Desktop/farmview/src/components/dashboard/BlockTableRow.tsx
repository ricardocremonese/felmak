
import { TableCell, TableRow } from '@/components/ui/table';
import { useTranslation } from 'react-i18next';
import { BlockColorIndicator } from './BlockColorIndicator';

interface BlockTableRowProps {
  block: {
    id: string;
    nome_bloco: string;
    area_acres: number;
    produto_usado?: string;
    data_plantio?: string;
    data_aplicacao?: string;
    data_colheita?: string;
    valor_produto?: number;
    cor?: string;
    farm_name?: string; // Added farm name property
  };
  formatDate: (date?: string) => string;
  formatCurrency: (value: number | null) => string;
}

export const BlockTableRow = ({ block, formatDate, formatCurrency }: BlockTableRowProps) => {
  const { t } = useTranslation();

  return (
    <TableRow key={block.id}>
      <TableCell>
        <div className="flex items-center gap-2">
          <BlockColorIndicator 
            color={block.cor || '#4caf50'} 
            name={block.nome_bloco}
            product={block.produto_usado}
          />
          <div>
            <div>{block.nome_bloco}</div>
            {block.farm_name && (
              <div className="text-xs text-muted-foreground">
                {block.farm_name}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>{block.area_acres?.toFixed(1) || '-'} {t('dashboard.acres')}</TableCell>
      <TableCell>{block.produto_usado || '-'}</TableCell>
      <TableCell>{formatDate(block.data_plantio)}</TableCell>
      <TableCell>{formatDate(block.data_aplicacao)}</TableCell>
      <TableCell>{formatDate(block.data_colheita)}</TableCell>
      <TableCell>{formatCurrency(block.valor_produto || 0)}</TableCell>
    </TableRow>
  );
};
