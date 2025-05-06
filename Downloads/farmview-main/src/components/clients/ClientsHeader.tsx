
import { useTranslation } from 'react-i18next';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientsHeaderProps {
  onCreateClick: () => void;
}

export const ClientsHeader = ({ onCreateClick }: ClientsHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">{t('clients.title')}</h1>
      <Button onClick={onCreateClick}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {t('clients.addClient')}
      </Button>
    </div>
  );
};
