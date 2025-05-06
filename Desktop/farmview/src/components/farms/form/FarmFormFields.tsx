import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { caneTypes } from '@/data/mockData';
import { useTranslation } from 'react-i18next';
import { useClientsList } from '@/hooks/useClientsList';
import type { FarmFormFieldsProps } from '../types/farmForm';
import { LocationSearchField } from './LocationSearchField';
import { ZipCodeField } from './ZipCodeField';

export const FarmFormFields = ({
  formData,
  onInputChange,
  onSelectChange,
  onLocationSelect,
  onZipCodeSelect,
}: FarmFormFieldsProps) => {
  const { t } = useTranslation();
  const { clients, isLoading } = useClientsList();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t('farms.name')}</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder={t('farms.namePlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cep">CEP</Label>
        <ZipCodeField
          value={formData.cep}
          onZipCodeSelect={onZipCodeSelect}
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <LocationSearchField
          value={formData.address}
          onChange={(location, lat, lon) => onLocationSelect(location, lat, lon)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="latitude">Latitude</Label>
        <Input
          id="latitude"
          name="latitude"
          type="number"
          step="0.000001"
          value={formData.latitude}
          onChange={onInputChange}
          placeholder="Ex: -23.550520"
          readOnly
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="longitude">Longitude</Label>
        <Input
          id="longitude"
          name="longitude"
          type="number"
          step="0.000001"
          value={formData.longitude}
          onChange={onInputChange}
          placeholder="Ex: -46.633308"
          readOnly
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">{t('common.address')}</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={onInputChange}
          placeholder={t('farms.addressPlaceholder')}
          readOnly
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="caneType">{t('farms.caneType')}</Label>
        <Select
          value={formData.cane_type}
          onValueChange={(value) => onSelectChange('cane_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('farms.selectCaneType')} />
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
        <Label htmlFor="totalArea">{t('farms.totalArea')}</Label>
        <Input
          id="totalArea"
          name="total_area"
          type="number"
          step="0.01"
          value={formData.total_area}
          onChange={onInputChange}
          placeholder="Ex: 100.50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="plantedArea">{t('farms.plantedArea')}</Label>
        <Input
          id="plantedArea"
          name="planted_area"
          type="number"
          step="0.01"
          value={formData.planted_area}
          onChange={onInputChange}
          placeholder="Ex: 80.25"
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="clientId">{t('clients.title')}</Label>
        <Select
          value={formData.client_id}
          onValueChange={(value) => onSelectChange('client_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('farms.selectClient')} />
          </SelectTrigger>
          <SelectContent>
            {isLoading ? (
              <SelectItem value="loading">{t('common.loading')}</SelectItem>
            ) : clients.length > 0 ? (
              clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-clients">{t('clients.noClients')}</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
