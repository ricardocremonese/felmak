
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Block } from '@/types';

export function useBlocksData(farmId: string | null) {
  const { t } = useTranslation();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState('nome_bloco');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (farmId) {
      fetchBlocks();
    }
  }, [farmId, sortField, sortDirection]);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using an efficient JOIN query
      const { data, error } = await supabase
        .from('blocos_fazenda')
        .select(`
          *,
          farms:farms(name)
        `)
        .eq('fazenda_id', farmId)
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;
      
      const processedBlocks = data?.map(block => ({
        ...block,
        farm_name: block.farms?.name
      })) || [];
      
      setBlocks(processedBlocks);
    } catch (error) {
      console.error('Error fetching blocks:', error);
      toast({
        title: t('common.error'),
        description: t('blocks.errorFetching'),
        variant: 'destructive',
      });
      setError(t('blocks.errorFetching'));
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    setSortDirection(current => 
      sortField === field 
        ? current === 'asc' ? 'desc' : 'asc' 
        : 'asc'
    );
    setSortField(field);
  };

  return {
    blocks,
    loading,
    error,
    sortField,
    sortDirection,
    handleSort,
    fetchBlocks
  };
}
