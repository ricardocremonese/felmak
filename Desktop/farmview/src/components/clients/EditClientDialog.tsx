
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Client } from '@/types';

interface EditClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onClientUpdated: () => void;
  client: Client | null;
}

export const EditClientDialog = ({ isOpen, onClose, onClientUpdated, client }: EditClientDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone || '',
      });
    }
  }, [client]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!client) return;
    
    const { name, email, phone } = formData;
    
    if (!name || !email) {
      toast({
        title: t('common.error'),
        description: t('clients.requiredFields'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('clients')
        .update({ name, email, phone })
        .eq('id', client.id);

      if (error) throw error;
      
      toast({
        title: t('clients.clientUpdated'),
      });
      onClose();
      onClientUpdated();
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: t('common.error'),
        description: t('clients.errorSaving'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('clients.editClient')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('common.name')}</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('common.email')}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t('common.phone')}</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave}>{t('common.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
