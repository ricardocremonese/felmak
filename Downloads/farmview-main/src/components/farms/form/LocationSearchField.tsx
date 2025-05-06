
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocationSearch, LocationSuggestion } from '@/hooks/useLocationSearch';
import { useTranslation } from 'react-i18next';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface LocationSearchFieldProps {
  value: string;
  onChange: (location: string, lat: string, lon: string) => void;
}

export const LocationSearchField = ({ value, onChange }: LocationSearchFieldProps) => {
  const { t } = useTranslation();
  const {
    query,
    setQuery,
    suggestions,
    setSuggestions,
    isLoading,
    error,
    searchLocations,
  } = useLocationSearch();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Close suggestions when clicking outside
  useOnClickOutside(searchContainerRef, () => {
    setShowSuggestions(false);
  });

  // Inicializa o query com o valor atual, se houver
  useEffect(() => {
    if (value && !query) {
      setQuery(value);
    }
  }, [value, query, setQuery]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query) {
        searchLocations(query);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, searchLocations]);

  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    onChange(suggestion.display_name, suggestion.lat, suggestion.lon);
    setQuery(suggestion.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleInputFocus = () => {
    if (query && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="space-y-2 relative" ref={searchContainerRef}>
      <Label htmlFor="location">{t('farms.location')}</Label>
      <div className="relative">
        <Input
          id="location"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={t('farms.searchLocation')}
          className="pr-10"
          autoComplete="off"
        />
        <div className="absolute right-3 top-2.5 text-gray-400">
          <Search size={18} />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg"
          >
            {isLoading ? (
              <div className="p-3 text-sm text-gray-500">{t('common.loading')}</div>
            ) : (
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                    className="cursor-pointer hover:bg-blue-100 transition-colors duration-150 p-3 border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSelectLocation(suggestion)}
                  >
                    <p className="font-medium text-gray-800">{suggestion.display_name}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {suggestion.address.city && <span>{suggestion.address.city}, </span>}
                      {suggestion.address.state && <span>{suggestion.address.state}, </span>}
                      {suggestion.address.country && <span>{suggestion.address.country}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
