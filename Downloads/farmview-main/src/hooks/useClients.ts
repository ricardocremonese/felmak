
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Client } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useClients = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: t('common.error'),
        description: t('clients.notAuthenticated'),
        variant: 'destructive',
      });
      navigate('/auth');
    }
    setIsLoading(false);
  };

  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching clients...');
      const { data: clientsData, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error from Supabase:', error);
        throw error;
      }

      console.log('Clients fetched:', clientsData);
      
      const transformedClients: Client[] = (clientsData || []).map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        userId: client.user_id,
        createdAt: client.created_at,
        updatedAt: client.updated_at
      }));

      setClients(transformedClients);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast({
        title: t('common.error'),
        description: t('clients.errorFetching'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchClients();
  }, []);

  return {
    clients,
    isLoading,
    error,
    fetchClients
  };
};
