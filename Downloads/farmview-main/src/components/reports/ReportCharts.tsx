
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Block } from '@/types';

interface ReportChartsProps {
  reportType: 'farm' | 'block';
  farmName: string;
  blockName: string;
  blocksForFarm: Block[];
  selectedFarm: string;
  selectedBlock: string;
}

const ReportCharts: React.FC<ReportChartsProps> = ({
  reportType,
  farmName,
  blockName,
  blocksForFarm,
  selectedFarm,
  selectedBlock,
}) => {
  const { t } = useTranslation();

  const farmPieData = {
    labels: blocksForFarm.map(block => block.nome_bloco),
    datasets: [
      {
        data: blocksForFarm.map(block => block.area_acres),
        backgroundColor: blocksForFarm.map(block => block.cor),
        borderWidth: 1,
      },
    ],
  };

  const farmBarData = {
    labels: blocksForFarm.map(block => block.nome_bloco),
    datasets: [
      {
        label: t('blocks.area'),
        data: blocksForFarm.map(block => block.area_acres),
        backgroundColor: 'rgba(80, 158, 47, 0.6)',
        borderColor: 'rgba(80, 158, 47, 1)',
        borderWidth: 1,
      },
    ],
  };

  const generateDateSeries = (startDate: Date, count: number) => {
    return Array.from({ length: count }).map((_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i * 30);
      return date.toLocaleDateString();
    });
  };

  const blockTimeSeriesData = {
    labels: generateDateSeries(new Date('2023-01-01'), 12),
    datasets: [
      {
        label: t('applications.productValue'),
        data: Array.from({ length: 12 }).map(() => Math.floor(Math.random() * 5000) + 1000),
        borderColor: 'rgba(80, 158, 47, 1)',
        backgroundColor: 'rgba(80, 158, 47, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {reportType === 'farm' 
              ? `${t('reports.farmReport')} - ${farmName}`
              : `${t('reports.blockReport')} - ${blockName}`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportType === 'farm' ? (
              <>
                <div className="h-[300px]">
                  <h3 className="text-sm font-medium mb-4">{t('blocks.title')}</h3>
                  <Pie 
                    data={farmPieData} 
                    options={{ 
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        }
                      }
                    }} 
                  />
                </div>
                <div className="h-[300px]">
                  <h3 className="text-sm font-medium mb-4">{t('blocks.area')}</h3>
                  <Bar 
                    data={farmBarData} 
                    options={{ 
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }} 
                  />
                </div>
              </>
            ) : (
              <div className="col-span-2 h-[300px]">
                <h3 className="text-sm font-medium mb-4">{t('applications.productValue')}</h3>
                <Line 
                  data={blockTimeSeriesData} 
                  options={{ 
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }} 
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ReportCharts;
