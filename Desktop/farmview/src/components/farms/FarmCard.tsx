
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Map as MapIcon, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Farm } from '@/types';
import { motion } from 'framer-motion';

interface FarmCardProps {
  farm: Farm;
  onEdit: (farm: Farm) => void;
  getClientName: (clientId: string) => string;
}

export const FarmCard = ({ farm, onEdit, getClientName }: FarmCardProps) => {
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{farm.name}</CardTitle>
            <Button variant="outline" size="icon" onClick={() => onEdit(farm)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm text-muted-foreground">{t('common.address')}:</span>
            <p className="text-sm">{farm.address}</p>
          </div>
          <div className="flex justify-between">
            <div>
              <span className="text-sm text-muted-foreground">{t('farms.caneType')}:</span>
              <p className="text-sm font-medium">{farm.caneType}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">{t('farms.totalArea')}:</span>
              <p className="text-sm font-medium">
                {farm.totalArea} {t('dashboard.acres')}
              </p>
            </div>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">{t('clients.title')}:</span>
            <p className="text-sm font-medium">{getClientName(farm.clientId)}</p>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Link to={`/?fazenda=${farm.id}`} className="w-full">
            <Button variant="outline" className="w-full">
              <MapIcon className="mr-2 h-4 w-4" />
              {t('common.viewDetails')}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
