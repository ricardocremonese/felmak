
import { motion } from 'framer-motion';
import { Calendar, LayoutDashboard, Filter, Droplets } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryCardsProps {
  blockCount: number;
  totalPlantedArea: number;
  totalLitersApplied: number;
  totalValueSpent: number;
  language: string;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export const SummaryCards = ({ 
  blockCount, 
  totalPlantedArea, 
  totalLitersApplied, 
  totalValueSpent,
  language 
}: SummaryCardsProps) => {
  const { t } = useTranslation();

  const formatCurrency = (value: number) => {
    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    const currency = language === 'pt-BR' ? 'BRL' : 'USD';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="transition-all">
        <Card className="shadow-md border border-gray-200 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <LayoutDashboard size={16} className="text-green-600" />
              {t('dashboard.totalBlocks')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockCount}</div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="transition-all">
        <Card className="shadow-md border border-gray-200 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar size={16} className="text-green-600" />
              {t('dashboard.plantedArea')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPlantedArea.toFixed(1)} {t('dashboard.acres')}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="transition-all">
        <Card className="shadow-md border border-gray-200 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplets size={16} className="text-green-600" />
              {t('dashboard.litersApplied')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalLitersApplied.toFixed(1)} L
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} className="transition-all">
        <Card className="shadow-md border border-gray-200 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Filter size={16} className="text-green-600" />
              {t('dashboard.totalSpent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValueSpent)}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
