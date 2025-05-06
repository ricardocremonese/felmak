
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BlocksTableHeaderProps {
  onSort: (field: string) => void;
}

export const BlocksTableHeader = ({ onSort }: BlocksTableHeaderProps) => {
  const { t } = useTranslation();

  return (
    <TableHeader>
      <TableRow>
        <TableHead onClick={() => onSort('name')} className="cursor-pointer">
          <div className="flex items-center gap-1">
            {t('blocks.name')}
            <ArrowUpDown size={16} className="ml-1" />
          </div>
        </TableHead>
        <TableHead onClick={() => onSort('area')} className="cursor-pointer">
          <div className="flex items-center gap-1">
            {t('blocks.area')}
            <ArrowUpDown size={16} className="ml-1" />
          </div>
        </TableHead>
        <TableHead>{t('blocks.product')}</TableHead>
        <TableHead onClick={() => onSort('plantingDate')} className="cursor-pointer">
          <div className="flex items-center gap-1">
            {t('blocks.plantingDate')}
            <ArrowUpDown size={16} className="ml-1" />
          </div>
        </TableHead>
        <TableHead onClick={() => onSort('applicationDate')} className="cursor-pointer">
          <div className="flex items-center gap-1">
            {t('blocks.lastApplication')}
            <ArrowUpDown size={16} className="ml-1" />
          </div>
        </TableHead>
        <TableHead onClick={() => onSort('harvestDate')} className="cursor-pointer">
          <div className="flex items-center gap-1">
            {t('blocks.harvestDate')}
            <ArrowUpDown size={16} className="ml-1" />
          </div>
        </TableHead>
        <TableHead onClick={() => onSort('value')} className="cursor-pointer">
          <div className="flex items-center gap-1">
            {t('blocks.totalSpent')}
            <ArrowUpDown size={16} className="ml-1" />
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
