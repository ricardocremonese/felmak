
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { FarmBlocksTable } from '@/components/dashboard/FarmBlocksTable';
import { useBlocksData } from '@/hooks/useBlocksData';
import { useFormatters } from '@/hooks/useFormatters';

const DashboardFarm = () => {
  const { t } = useTranslation();
  const { language } = useSettings();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const farmId = params.get('fazenda');
  
  const { 
    blocks, 
    loading, 
    error, 
    sortField, 
    sortDirection, 
    handleSort 
  } = useBlocksData(farmId);
  
  const { formatCurrency, formatDate, formatArea } = useFormatters();

  if (!farmId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <LayoutDashboard size={48} className="text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t('dashboard.noFarmSelected')}</h2>
        <p className="text-muted-foreground">
          {t('dashboard.selectFarm')}
        </p>
      </div>
    );
  }

  const blockCount = blocks?.length || 0;
  const totalPlantedArea = blocks?.reduce((sum, block) => sum + block.area_acres, 0) || 0;
  const totalLitersApplied = blocks?.reduce((sum, block) => sum + (block.quantidade_litros || 0), 0) || 0;
  const totalValueSpent = blocks?.reduce((sum, block) => sum + (block.valor_produto || 0), 0) || 0;

  const spendingByBlockData = blocks.map(block => ({
    name: block.nome_bloco,
    value: block.valor_produto || 0,
    color: block.cor
  }));

  const productData = () => {
    const productMap = new Map();
    
    blocks.forEach(block => {
      if (!block.produto_usado) return;
      
      if (productMap.has(block.produto_usado)) {
        productMap.set(block.produto_usado, productMap.get(block.produto_usado) + (block.quantidade_litros || 0));
      } else {
        productMap.set(block.produto_usado, block.quantidade_litros || 0);
      }
    });
    
    return Array.from(productMap.entries()).map(([name, value]) => ({
      name,
      value
    }));
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">{t('dashboard.farmDashboard')}</h1>
      </div>

      <SummaryCards 
        blockCount={blockCount}
        totalPlantedArea={totalPlantedArea}
        totalLitersApplied={totalLitersApplied}
        totalValueSpent={totalValueSpent}
        language={language}
      />

      <DashboardCharts 
        spendingByBlockData={spendingByBlockData}
        productData={productData()}
        formatCurrency={formatCurrency}
      />

      <FarmBlocksTable
        blocks={blocks}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        formatDate={formatDate}
        formatCurrency={formatCurrency}
        formatArea={formatArea}
        language={language}
      />
    </motion.div>
  );
};

export default DashboardFarm;
