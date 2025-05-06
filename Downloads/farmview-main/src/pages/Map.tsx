
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { mockFarms } from '@/data/mockData';
import { Farm } from '@/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Pencil, 
  PaintBucket, 
  Calculator, 
  Edit, 
  Image, 
  ImageOff,
  Save,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

// The URL for the external map iframe
const MAP_IFRAME_URL = "https://placeholder-map-iframe.example.com";

const Map = () => {
  const { t } = useTranslation();
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [mapMode, setMapMode] = useState<'view' | 'edit'>('view');
  const [clearBackground, setClearBackground] = useState(false);
  const [iframeElement, setIframeElement] = useState<HTMLIFrameElement | null>(null);

  useEffect(() => {
    // Find the iframe element
    const iframe = document.getElementById('map-iframe') as HTMLIFrameElement;
    if (iframe) {
      setIframeElement(iframe);
    }
  }, []);

  useEffect(() => {
    if (iframeElement && selectedFarm) {
      // Post message to the iframe to update the map center
      iframeElement.contentWindow?.postMessage(
        {
          type: 'SET_CENTER',
          lat: selectedFarm.latitude,
          lng: selectedFarm.longitude,
          zoom: 16
        },
        '*'
      );
    }
  }, [selectedFarm, iframeElement]);

  const handleFarmChange = (farmId: string) => {
    const farm = mockFarms.find((f) => f.id === farmId);
    setSelectedFarm(farm || null);
  };

  const toggleMapMode = () => {
    setMapMode(mapMode === 'view' ? 'edit' : 'view');
  };

  const toggleBackground = () => {
    setClearBackground(!clearBackground);
    
    // Send message to iframe to toggle background
    if (iframeElement) {
      iframeElement.contentWindow?.postMessage(
        {
          type: 'TOGGLE_BACKGROUND',
          clear: !clearBackground
        },
        '*'
      );
    }
  };

  const handleMapAction = (action: string) => {
    // Send message to iframe with the action
    if (iframeElement) {
      iframeElement.contentWindow?.postMessage(
        {
          type: action
        },
        '*'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">{t('map.title')}</h1>

        <div className="flex items-center gap-2">
          <Select
            value={selectedFarm?.id || ''}
            onValueChange={handleFarmChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('blocks.selectFarm')} />
            </SelectTrigger>
            <SelectContent>
              {mockFarms.map((farm) => (
                <SelectItem key={farm.id} value={farm.id}>
                  {farm.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={mapMode === 'edit' ? 'default' : 'outline'}
            onClick={toggleMapMode}
          >
            <Pencil className="mr-2 h-4 w-4" />
            {t('blocks.editMap')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Map Toolbar - Only visible in edit mode */}
        {mapMode === 'edit' && (
          <motion.div
            className="col-span-12 md:col-span-2 space-y-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-4 space-y-4">
                <h3 className="font-medium text-sm">{t('map.title')} {t('common.actions')}</h3>
                
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleMapAction('DRAW_POLYGON')}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('map.drawPolygon')}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleMapAction('APPLY_COLOR')}
                  >
                    <PaintBucket className="mr-2 h-4 w-4" />
                    {t('map.applyColor')}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleMapAction('CALCULATE_AREA')}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    {t('map.calculateArea')}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => handleMapAction('EDIT_DATA')}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {t('map.editData')}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={toggleBackground}
                  >
                    {clearBackground ? (
                      <>
                        <Image className="mr-2 h-4 w-4" />
                        {t('map.restoreBackground')}
                      </>
                    ) : (
                      <>
                        <ImageOff className="mr-2 h-4 w-4" />
                        {t('map.clearBackground')}
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="default" 
                    className="flex-1"
                    onClick={() => handleMapAction('SAVE_CHANGES')}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {t('map.saveChanges')}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleMapAction('DISCARD_CHANGES')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    {t('map.discardChanges')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Map Container */}
        <div 
          className={`${
            mapMode === 'edit' ? 'col-span-12 md:col-span-10' : 'col-span-12'
          } h-[70vh] rounded-md overflow-hidden border`}
        >
          <iframe
            id="map-iframe"
            src={MAP_IFRAME_URL}
            className="w-full h-full border-0"
            title="Farm Map"
          />
          
          {/* Overlay when no farm is selected */}
          {!selectedFarm && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="text-center p-6">
                <h2 className="text-xl font-medium mb-2">{t('dashboard.noFarmSelected')}</h2>
                <p className="text-muted-foreground">{t('dashboard.selectFarm')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;
