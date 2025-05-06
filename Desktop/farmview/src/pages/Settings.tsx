
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Database,
  Upload,
  Download,
  Settings as SettingsIcon
} from 'lucide-react';

const Settings = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useSettings();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportData = () => {
    setIsExporting(true);
    
    // Simulate export delay
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: t('settings.exportData'),
        description: 'data-export.json',
      });
    }, 1500);
  };

  const handleImportData = () => {
    setIsImporting(true);
    
    // Simulate import delay
    setTimeout(() => {
      setIsImporting(false);
      toast({
        title: t('settings.importData'),
        description: 'Data imported successfully',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
      </div>

      <Tabs defaultValue="language" className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="language">{t('settings.languageSettings')}</TabsTrigger>
          <TabsTrigger value="users">{t('settings.userManagement')}</TabsTrigger>
          <TabsTrigger value="backup">{t('settings.dataBackup')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="language" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.languageSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">{t('settings.language')}</h3>
                <RadioGroup 
                  value={language}
                  onValueChange={(value) => setLanguage(value as 'en' | 'pt-BR')}
                  className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="en" />
                    <Label htmlFor="en">{t('settings.english')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pt-BR" id="pt-BR" />
                    <Label htmlFor="pt-BR">{t('settings.portugueseBR')}</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <motion.div
                key={language}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-4 bg-muted rounded-md"
              >
                <p className="font-medium">{t('app.name')}</p>
                <p className="text-sm text-muted-foreground">{t('app.tagline')}</p>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.userManagement')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-10">
                <SettingsIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {t('common.noData')}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('settings.users')}
                </p>
                
                <Button className="mt-6" variant="outline">
                  {t('settings.addUser')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.dataBackup')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="p-4 border rounded-md">
                  <div className="flex items-center mb-4">
                    <div className="mr-4">
                      <Database className="h-8 w-8 text-muted-foreground/70" />
                    </div>
                    <div>
                      <h3 className="font-medium">{t('settings.backup')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.lastBackup')}: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="default" 
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="sm:flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {isExporting ? t('common.loading') : t('settings.exportData')}
                    </Button>
                    
                    <Button
                      variant="outline" 
                      onClick={handleImportData}
                      disabled={isImporting}
                      className="sm:flex-1"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {isImporting ? t('common.loading') : t('settings.importData')}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
