
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface BlockColorIndicatorProps {
  color: string;
  name: string;
  product?: string;
}

export const BlockColorIndicator = ({ color, name, product }: BlockColorIndicatorProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div 
          className="w-3 h-3 rounded-full cursor-pointer" 
          style={{ backgroundColor: color || '#4caf50' }}
        />
      </HoverCardTrigger>
      <HoverCardContent className="w-auto">
        <div className="flex justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">{name}</h4>
            <div className="text-xs text-muted-foreground">
              {product || '-'}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
