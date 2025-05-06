
import { FarmCard } from './FarmCard';
import type { Farm } from '@/types';

interface FarmsListProps {
  farms: Farm[];
  onEdit: (farm: Farm) => void;
  getClientName: (clientId: string) => string;
}

export const FarmsList = ({ farms, onEdit, getClientName }: FarmsListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {farms.map((farm) => (
        <FarmCard
          key={farm.id}
          farm={farm}
          onEdit={onEdit}
          getClientName={getClientName}
        />
      ))}
    </div>
  );
};
