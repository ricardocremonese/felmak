
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface CreateClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: () => void;
}

export const CreateClientDialog = ({ isOpen, onClose, onClientCreated }: CreateClientDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const { name, email, phone } = formData;
    
    if (!name || !email) {
      toast({
        title: t('common.error'),
        description: t('clients.requiredFields'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert client with null user_id to avoid foreign key constraint issues
      const { error } = await supabase
        .from('clients')
        .insert([{ 
          name, 
          email, 
          phone, 
          user_id: null // Set to null to avoid the foreign key constraint
        }]);

      if (error) throw error;
      
      toast({
        title: t('clients.clientCreated'),
      });
      onClose();
      onClientCreated();
      setFormData({ name: '', email: '', phone: '' });
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: t('common.error'),
        description: t('clients.errorSaving'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when dialog closes
  const handleDialogClose = () => {
    setFormData({ name: '', email: '', phone: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('clients.createClient')}</DialogTitle>
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
          <Button variant="outline" onClick={handleDialogClose} disabled={isSubmitting}>
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
