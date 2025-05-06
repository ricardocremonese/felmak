
import { useTranslation } from 'react-i18next';
import { Block } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { caneTypes, mockFarms } from '@/data/mockData';

interface EditBlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  currentBlock: Block | null;
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCheckboxChange: (checked: boolean) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export const EditBlockDialog = ({
  isOpen,
  onClose,
  onSave,
  currentBlock,
  formData,
  handleInputChange,
  handleCheckboxChange,
  handleSelectChange,
}: EditBlockDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('blocks.editBlock')}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('blocks.name')}</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="farmId">{t('farms.title')}</Label>
            <Select
              value={formData.farmId}
              onValueChange={(value) => handleSelectChange('farmId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('blocks.selectFarm')} />
              </SelectTrigger>
              <SelectContent>
                {mockFarms.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id}>
                    {farm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">{t('blocks.area')} ({t('blocks.acres')})</Label>
            <Input
              id="area"
              name="area"
              type="number"
              value={formData.area}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caneType">{t('blocks.caneType')}</Label>
            <Select
              value={formData.caneType}
              onValueChange={(value) => handleSelectChange('caneType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {caneTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">{t('blocks.color')}</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                name="color"
                type="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-12 h-10 p-1"
              />
              <Input
                value={formData.color}
                onChange={handleInputChange}
                name="color"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2 flex items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasDrainage"
                checked={formData.hasDrainage}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="hasDrainage">{t('blocks.hasDrainage')}</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plantingDate">{t('dashboard.plantingDate')}</Label>
            <Input
              id="plantingDate"
              name="plantingDate"
              type="date"
              value={formData.plantingDate ? formData.plantingDate.substring(0, 10) : ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="harvestDate">{t('dashboard.harvestDate')}</Label>
            <Input
              id="harvestDate"
              name="harvestDate"
              type="date"
              value={formData.harvestDate ? formData.harvestDate.substring(0, 10) : ''}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSave}>{t('common.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
