
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Farm } from '@/types';

interface FarmInfoCardsProps {
  farm: Farm;
}

export function FarmInfoCards({ farm }: FarmInfoCardsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t('farms.name')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{farm.name}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t('farms.totalArea')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{farm.totalArea} ha</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t('farms.plantedArea')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{farm.plantedArea} ha</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t('farms.caneType')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{farm.caneType}</p>
        </CardContent>
      </Card>
    </div>
  );
}
