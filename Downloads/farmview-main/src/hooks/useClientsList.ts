
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export const useClientsList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('name');

        if (error) throw error;

        const transformedClients: Client[] = data.map(client => ({
          id: client.id,
          name: client.name,
          email: client.email,
          phone: client.phone || '',
          userId: client.user_id,
          createdAt: client.created_at,
          updatedAt: client.updated_at
        }));

        setClients(transformedClients);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast({
          title: t('common.error'),
          description: t('clients.errorFetching'),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [toast, t]);

  return { clients, isLoading };
};
