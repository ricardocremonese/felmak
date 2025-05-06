
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Farm {
  id: string;
  name: string;
}

interface FarmSelectorProps {
  selectedFarm: string;
  onFarmChange: (value: string) => void;
}

export const FarmSelector = ({ selectedFarm, onFarmChange }: FarmSelectorProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const { data, error } = await supabase
          .from('farms')
          .select('id, name')
          .order('name');

        if (error) throw error;
        setFarms(data || []);
      } catch (error) {
        console.error('Error fetching farms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarms();
  }, []);

  const handleChange = (value: string) => {
    onFarmChange(value);
    navigate(`/blocks?fazenda=${value}`);
  };

  return (
    <Select
      value={selectedFarm}
      onValueChange={handleChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder={t('blocks.selectFarm')} />
      </SelectTrigger>
      <SelectContent>
        {farms.map((farm) => (
          <SelectItem key={farm.id} value={farm.id}>
            {farm.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
