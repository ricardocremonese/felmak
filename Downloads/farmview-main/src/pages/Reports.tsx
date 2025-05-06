
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mockFarms, mockBlocks } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import ReportGenerationForm from '@/components/reports/ReportGenerationForm';
import ReportCharts from '@/components/reports/ReportCharts';
import ReportView from '@/components/reports/ReportView';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState<'farm' | 'block'>('farm');
  const [selectedFarm, setSelectedFarm] = useState<string>('');
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [reportGenerated, setReportGenerated] = useState(false);

  const blocksForFarm = selectedFarm
    ? mockBlocks.filter((block) => block.fazenda_id === selectedFarm)
    : [];

  const handleGenerateReport = () => {
    if (!selectedFarm) {
      toast({
        title: 'Error',
        description: t('blocks.selectFarm'),
        variant: 'destructive',
      });
      return;
    }

    if (reportType === 'block' && !selectedBlock) {
      toast({
        title: 'Error',
        description: t('applications.selectBlock'),
        variant: 'destructive',
      });
      return;
    }

    setReportGenerated(true);

    toast({
      title: t('reports.generateReport'),
      description: reportType === 'farm'
        ? `${t('reports.farmReport')} ${getFarmName(selectedFarm)}`
        : `${t('reports.blockReport')} ${getBlockName(selectedBlock)}`,
    });
  };

  const handleExportReport = () => {
    toast({
      title: `${t('reports.exportAs')} ${exportFormat.toUpperCase()}`,
      description: t('common.noData'),
    });
  };

  const getFarmName = (farmId: string): string => {
    const farm = mockFarms.find((farm) => farm.id === farmId);
    return farm ? farm.name : '';
  };

  const getBlockName = (blockId: string): string => {
    const block = mockBlocks.find((block) => block.id === blockId);
    return block ? block.nome_bloco : '';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('reports.title')}</h1>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="generate">{t('reports.generateReport')}</TabsTrigger>
          <TabsTrigger value="view">{t('reports.title')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-4 pt-4">
          <ReportGenerationForm
            mockFarms={mockFarms}
            blocksForFarm={blocksForFarm}
            selectedFarm={selectedFarm}
            setSelectedFarm={setSelectedFarm}
            selectedBlock={selectedBlock}
            setSelectedBlock={setSelectedBlock}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            reportType={reportType}
            setReportType={setReportType}
            exportFormat={exportFormat}
            setExportFormat={setExportFormat}
            onGenerateReport={handleGenerateReport}
            onExportReport={handleExportReport}
            reportGenerated={reportGenerated}
          />

          {reportGenerated && (
            <ReportCharts
              reportType={reportType}
              farmName={getFarmName(selectedFarm)}
              blockName={getBlockName(selectedBlock)}
              blocksForFarm={blocksForFarm}
              selectedFarm={selectedFarm}
              selectedBlock={selectedBlock}
            />
          )}
        </TabsContent>
        
        <TabsContent value="view" className="pt-4">
          <ReportView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
