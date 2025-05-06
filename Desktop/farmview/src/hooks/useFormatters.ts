
import { useSettings } from '@/contexts/SettingsContext';

export function useFormatters() {
  const { language } = useSettings();

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    
    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    const currency = language === 'pt-BR' ? 'BRL' : 'USD';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const locale = language === 'pt-BR' ? 'pt-BR' : 'en-US';
    
    return new Intl.DateTimeFormat(locale).format(date);
  };

  const formatArea = (area: number) => {
    return `${area.toFixed(2)} ha`;
  };

  return {
    formatCurrency,
    formatDate,
    formatArea
  };
}
