
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ReportView: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('reports.title')}</CardTitle>
        <CardDescription>
          {t('common.noData')}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.noData')}</p>
      </CardContent>
    </Card>
  );
};

export default ReportView;
