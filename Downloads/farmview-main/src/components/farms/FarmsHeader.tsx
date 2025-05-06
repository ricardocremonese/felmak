
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FarmsHeaderProps {
  onCreateFarm: () => void;
}

export const FarmsHeader = ({ onCreateFarm }: FarmsHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">{t('farms.title')}</h1>
      <Button onClick={onCreateFarm}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {t('farms.addFarm')}
      </Button>
    </div>
  );
};
