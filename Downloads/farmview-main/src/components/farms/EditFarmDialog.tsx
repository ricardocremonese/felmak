
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FarmFormFields } from './form/FarmFormFields';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FarmFormData } from './types/farmForm';

interface EditFarmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FarmFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onSave: () => void;
  isSubmitting?: boolean;
}

export const EditFarmDialog = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onSelectChange,
  onSave,
  isSubmitting = false,
}: EditFarmDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [locationSelected, setLocationSelected] = useState(true); // Assume location is valid initially

  const handleLocationSelect = (location: string, lat: string, lon: string) => {
    // Update form data in parent component
    onInputChange({ target: { name: 'address', value: location } } as React.ChangeEvent<HTMLInputElement>);
    onInputChange({ target: { name: 'latitude', value: lat } } as React.ChangeEvent<HTMLInputElement>);
    onInputChange({ target: { name: 'longitude', value: lon } } as React.ChangeEvent<HTMLInputElement>);
    
    // Mark location as selected
    setLocationSelected(true);
  };

  const handleZipCodeSelect = (location: string, lat: string, lon: string, cep: string) => {
    // Update form data in parent component
    onInputChange({ target: { name: 'address', value: location } } as React.ChangeEvent<HTMLInputElement>);
    onInputChange({ target: { name: 'latitude', value: lat } } as React.ChangeEvent<HTMLInputElement>);
    onInputChange({ target: { name: 'longitude', value: lon } } as React.ChangeEvent<HTMLInputElement>);
    onInputChange({ target: { name: 'cep', value: cep } } as React.ChangeEvent<HTMLInputElement>);
    
    // Mark location as selected
    setLocationSelected(true);
  };

  const handleSave = async () => {
    if (formData.address && !locationSelected) {
      toast({
        title: t('common.error'),
        description: t('farms.selectValidLocation'),
        variant: 'destructive',
      });
      return;
    }
    
    onSave();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('farms.editFarm')}</DialogTitle>
        </DialogHeader>
        <FarmFormFields
          formData={formData}
          onInputChange={onInputChange}
          onSelectChange={onSelectChange}
          onLocationSelect={handleLocationSelect}
          onZipCodeSelect={handleZipCodeSelect}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
