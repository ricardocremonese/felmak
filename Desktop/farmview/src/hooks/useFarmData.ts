
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Farm } from '@/types';

export function useFarmData(farmId: string | null) {
  const { t } = useTranslation();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (farmId) {
      fetchFarmData();
    }
  }, [farmId]);

  const fetchFarmData = async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('id', farmId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: t('common.error'),
            description: t('farms.notFound'),
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      }
      
      if (data) {
        setFarm({
          id: data.id,
          name: data.name,
          address: data.address || '',
          caneType: data.cane_type || '',
          totalArea: Number(data.total_area),
          plantedArea: Number(data.planted_area),
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          clientId: data.client_id || '',
          createdAt: data.created_at || '',
          userId: data.user_id
        });
      }
    } catch (error) {
      console.error('Error fetching farm:', error);
      toast({
        title: t('common.error'),
        description: t('farms.errorFetching'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { farm, isLoading };
}
