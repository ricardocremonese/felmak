import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { mockFarms, mockBlocks, mockApplications } from '@/data/mockData';
import { Farm } from '@/types';
import { useLocation } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Dashboard = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse farm ID from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const farmId = params.get('fazenda');
    
    if (farmId) {
      const farm = mockFarms.find(f => f.id === farmId);
      if (farm) {
        setSelectedFarm(farm);
      }
    }
    
    setLoading(false);
  }, [location.search]);

  // Get blocks for the selected farm
  const farmBlocks = selectedFarm
    ? mockBlocks.filter(block => block.fazenda_id === selectedFarm.id)
    : [];
    
  // Get applications for the selected farm
  const farmApplications = selectedFarm
    ? mockApplications.filter(app => app.farmId === selectedFarm.id)
    : [];
  
  // Calculate days since planting for the first block
  const calculateCaneAge = () => {
    if (farmBlocks.length > 0 && farmBlocks[0].data_plantio) {
      const plantingDate = new Date(farmBlocks[0].data_plantio);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - plantingDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  // Prepare data for pie chart
  const blockAreaData = {
    labels: farmBlocks.map(block => block.nome_bloco),
    datasets: [
      {
        data: farmBlocks.map(block => block.area_acres),
        backgroundColor: farmBlocks.map(block => block.cor),
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for bar chart
  const applicationValueData = {
    labels: farmApplications.map(app => app.productName),
    datasets: [
      {
        label: t('applications.productValue'),
        data: farmApplications.map(app => app.productValue),
        backgroundColor: 'rgba(80, 158, 47, 0.6)',
        borderColor: 'rgba(80, 158, 47, 1)',
        borderWidth: 1,
      },
    ],
  };

  const handleFarmChange = (farmId: string) => {
    const farm = mockFarms.find(f => f.id === farmId);
    if (farm) {
      setSelectedFarm(farm);
      
      // Update URL with the farm ID
      const params = new URLSearchParams(location.search);
      params.set('fazenda', farmId);
      window.history.replaceState(
        {},
        '',
        `${location.pathname}?${params.toString()}`
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        
        <div className="w-full md:w-64">
          <Select
            value={selectedFarm?.id || ''}
            onValueChange={handleFarmChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('dashboard.selectFarm')} />
            </SelectTrigger>
            <SelectContent>
              {mockFarms.map(farm => (
                <SelectItem key={farm.id} value={farm.id}>
                  {farm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {selectedFarm ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.caneType')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{selectedFarm.caneType}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.caneAge')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {calculateCaneAge()} {t('dashboard.days')}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.totalArea')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedFarm.totalArea} {t('dashboard.acres')}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.plantedArea')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {selectedFarm.plantedArea} {t('dashboard.acres')}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('blocks.title')}</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {farmBlocks.length > 0 ? (
                  <Pie 
                    data={blockAreaData} 
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
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    {t('common.noData')}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('applications.title')}</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                {farmApplications.length > 0 ? (
                  <Bar 
                    data={applicationValueData} 
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
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    {t('common.noData')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.summary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {farmApplications.length > 0 && (
                      <div>
                        <h3 className="font-medium">{t('dashboard.appliedProduct')}</h3>
                        <p>{farmApplications[0].productName}</p>
                      </div>
                    )}
                    
                    {farmBlocks.length > 0 && farmBlocks[0].data_plantio && (
                      <div>
                        <h3 className="font-medium">{t('dashboard.plantingDate')}</h3>
                        <p>{new Date(farmBlocks[0].data_plantio).toLocaleDateString()}</p>
                      </div>
                    )}
                    
                    {farmApplications.length > 0 && (
                      <div>
                        <h3 className="font-medium">{t('dashboard.applicationDate')}</h3>
                        <p>{new Date(farmApplications[0].applicationDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    
                    {farmBlocks.length > 0 && farmBlocks[0].data_colheita && (
                      <div>
                        <h3 className="font-medium">{t('dashboard.harvestDate')}</h3>
                        <p>{new Date(farmBlocks[0].data_colheita).toLocaleDateString()}</p>
                      </div>
                    )}
                    
                    {farmApplications.length > 0 && (
                      <div>
                        <h3 className="font-medium">{t('dashboard.nextDate')}</h3>
                        <p>{new Date(farmApplications[0].nextApplicationDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="p-8 text-center">
          <h2 className="text-xl font-medium mb-2">{t('dashboard.noFarmSelected')}</h2>
          <p className="text-muted-foreground">{t('dashboard.selectFarm')}</p>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
