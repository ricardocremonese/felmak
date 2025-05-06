
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Farm } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useFarms = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFarms = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching farms...');
      const { data: farmsData, error } = await supabase
        .from('farms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error from Supabase:', error);
        throw error;
      }

      console.log('Farms fetched:', farmsData);
      
      // Transform the data to match our Farm type
      const transformedFarms: Farm[] = farmsData?.map(farm => ({
        id: farm.id,
        name: farm.name,
        address: farm.address || '',
        caneType: farm.cane_type || '',
        totalArea: Number(farm.total_area),
        plantedArea: Number(farm.planted_area),
        latitude: Number(farm.latitude) || 0,
        longitude: Number(farm.longitude) || 0,
        clientId: farm.client_id || '',
        localizacao: farm.localizacao || '',
        cep: farm.cep !== null ? String(farm.cep) : undefined, // Convert number to string for UI
        createdAt: farm.created_at || '',
        userId: farm.user_id || null
      })) || [];
      
      setFarms(transformedFarms);
    } catch (err) {
      console.error('Error fetching farms:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      toast({
        title: t('common.error'),
        description: t('farms.errorFetching'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  return {
    farms,
    isLoading,
    error,
    fetchFarms
  };
};
