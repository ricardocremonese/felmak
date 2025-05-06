
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { Farm, Block } from '@/types';
import { FileText, Download } from 'lucide-react';

interface ReportGenerationFormProps {
  mockFarms: Farm[];
  blocksForFarm: Block[];
  selectedFarm: string;
  setSelectedFarm: (value: string) => void;
  selectedBlock: string;
  setSelectedBlock: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  reportType: 'farm' | 'block';
  setReportType: (value: 'farm' | 'block') => void;
  exportFormat: 'csv' | 'pdf';
  setExportFormat: (value: 'csv' | 'pdf') => void;
  onGenerateReport: () => void;
  onExportReport: () => void;
  reportGenerated: boolean;
}

const ReportGenerationForm: React.FC<ReportGenerationFormProps> = ({
  mockFarms,
  blocksForFarm,
  selectedFarm,
  setSelectedFarm,
  selectedBlock,
  setSelectedBlock,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  reportType,
  setReportType,
  exportFormat,
  setExportFormat,
  onGenerateReport,
  onExportReport,
  reportGenerated,
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('reports.generateReport')}</CardTitle>
        <CardDescription>
          {t('reports.selectFarm')} {reportType === 'block' && t('applications.selectBlock')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">{t('reports.reportType')}</h3>
            <RadioGroup 
              defaultValue={reportType}
              onValueChange={(value) => setReportType(value as 'farm' | 'block')}
              className="flex flex-row space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="farm" id="farm" />
                <Label htmlFor="farm">{t('reports.farmReport')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="block" id="block" />
                <Label htmlFor="block">{t('reports.blockReport')}</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t('reports.startDate')}</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">{t('reports.endDate')}</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="farm">{t('farms.title')}</Label>
              <Select
                value={selectedFarm}
                onValueChange={setSelectedFarm}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('reports.selectFarm')} />
                </SelectTrigger>
                <SelectContent>
                  {mockFarms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id}>
                      {farm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reportType === 'block' && (
              <div className="space-y-2">
                <Label htmlFor="block">{t('blocks.title')}</Label>
                <Select
                  value={selectedBlock}
                  onValueChange={setSelectedBlock}
                  disabled={!selectedFarm}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('reports.selectBlock')} />
                  </SelectTrigger>
                  <SelectContent>
                    {blocksForFarm.map((block) => (
                      <SelectItem key={block.id} value={block.id}>
                        {block.nome_bloco}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">{t('reports.exportAs')}</h3>
            <RadioGroup 
              defaultValue={exportFormat}
              onValueChange={(value) => setExportFormat(value as 'csv' | 'pdf')}
              className="flex flex-row space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">{t('reports.csv')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">{t('reports.pdf')}</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onExportReport} disabled={!reportGenerated}>
          <Download className="mr-2 h-4 w-4" />
          {t('common.export')}
        </Button>
        <Button onClick={onGenerateReport}>
          <FileText className="mr-2 h-4 w-4" />
          {t('reports.generateData')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReportGenerationForm;
