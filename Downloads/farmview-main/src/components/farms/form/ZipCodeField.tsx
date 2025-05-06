
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

interface ZipCodeFieldProps {
  value: string;
  onZipCodeSelect: (location: string, lat: string, lon: string, cep: string) => void;
}

export const ZipCodeField = ({ value, onZipCodeSelect }: ZipCodeFieldProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [cepInput, setCepInput] = useState(value);
  const { searchByCEP, isLoading } = useLocationSearch();

  const formatCEP = (cep: string): string => {
    // Remove todos os caracteres não numéricos
    const numbersOnly = cep.replace(/\D/g, '');
    
    // Formata com o hífen se tiver comprimento adequado
    if (numbersOnly.length <= 5) {
      return numbersOnly;
    } else {
      return `${numbersOnly.slice(0, 5)}-${numbersOnly.slice(5, 8)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCEP = formatCEP(e.target.value);
    setCepInput(formattedCEP);
    
    // Se o CEP estiver completo (8 dígitos), busca automaticamente
    if (formattedCEP.replace(/\D/g, '').length === 8) {
      handleSearch(formattedCEP);
    }
  };

  const handleSearch = async (cep: string = cepInput) => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      toast({
        title: t('common.error'),
        description: t('farms.invalidZipCode'),
        variant: 'destructive',
      });
      return;
    }

    const result = await searchByCEP(cep);
    
    if (result) {
      onZipCodeSelect(
        result.display_name, 
        result.lat, 
        result.lon, 
        result.address.postcode || cep
      );
      
      toast({
        title: t('farms.zipCodeFound'),
        description: result.display_name,
      });
    } else {
      toast({
        title: t('common.error'),
        description: t('farms.zipCodeNotFound'),
        variant: 'destructive',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <Input
        id="cep"
        name="cep"
        value={cepInput}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={t('farms.zipCodePlaceholder')}
        className="pr-10"
        maxLength={9}
        disabled={isLoading}
      />
      <div 
        className={`absolute right-3 top-2.5 ${isLoading ? 'text-gray-300' : 'text-gray-400 cursor-pointer'}`}
        onClick={!isLoading ? () => handleSearch() : undefined}
      >
        <Search size={18} />
      </div>
    </div>
  );
};
