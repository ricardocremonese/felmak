
import { useTranslation } from 'react-i18next';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlocksHeaderProps {
  onCreateBlock: () => void;
}

export function BlocksHeader({ onCreateBlock }: BlocksHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('blocks.title')}</h1>
        <p className="text-muted-foreground">
          {t('blocks.description')}
        </p>
      </div>

      <Button onClick={onCreateBlock}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {t('blocks.addBlock')}
      </Button>
    </div>
  );
}
