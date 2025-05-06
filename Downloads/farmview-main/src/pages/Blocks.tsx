
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FarmSelector } from '@/components/blocks/FarmSelector';
import { BlocksTable } from '@/components/dashboard/BlocksTable';
import { CreateBlockDialog } from '@/components/blocks/CreateBlockDialog';
import { BlocksHeader } from '@/components/blocks/BlocksHeader';
import { FarmInfoCards } from '@/components/blocks/FarmInfoCards';
import { useBlocksData } from '@/hooks/useBlocksData';
import { useFarmData } from '@/hooks/useFarmData';
import { useFormatters } from '@/hooks/useFormatters';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const Blocks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const farmId = searchParams.get('fazenda');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string>('nome_bloco');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { blocks, loading: isLoading, handleSort, fetchBlocks } = useBlocksData(farmId);
  const { farm, isLoading: isFarmLoading } = useFarmData(farmId);
  const { formatDate, formatCurrency } = useFormatters();

  const handleFarmChange = (selectedFarmId: string) => {
    navigate(`/blocks?fazenda=${selectedFarmId}`);
  };

  if (!farmId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">{t('blocks.selectFarm')}</h2>
          <FarmSelector selectedFarm="" onFarmChange={handleFarmChange} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <BlocksHeader onCreateBlock={() => setIsCreateDialogOpen(true)} />

      {farm && <FarmInfoCards farm={farm} />}

      {isLoading || isFarmLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-48"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
            <div className="h-4 bg-muted rounded w-52"></div>
          </div>
        </div>
      ) : blocks.length === 0 ? (
        <div className="text-center py-12 bg-background/50 border rounded-lg">
          <h3 className="text-xl font-semibold mb-2">{t('blocks.noBlocks')}</h3>
          <p className="text-muted-foreground mb-4">{t('blocks.createFirst')}</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('blocks.addBlock')}
          </Button>
        </div>
      ) : (
        <BlocksTable
          blocks={blocks}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      )}

      <CreateBlockDialog
        farmId={farmId}
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          fetchBlocks();
          setIsCreateDialogOpen(false);
        }}
      />
    </motion.div>
  );
};

export default Blocks;
