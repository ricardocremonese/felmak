
import { useState } from 'react';

export interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    house_number?: string;
  };
}

// Dados de exemplo para quando a API falhar
const fallbackSuggestions = [
  {
    display_name: "Avenida Senador Queirós, São Paulo, Brasil",
    lat: "-23.5429",
    lon: "-46.6395",
    address: {
      road: "Avenida Senador Queirós",
      house_number: "123",
      suburb: "Centro",
      city: "São Paulo",
      state: "São Paulo",
      country: "Brasil",
      postcode: "01045-000"
    }
  },
  {
    display_name: "Avenida Senador Pinheiro Machado, Santos, Brasil",
    lat: "-23.9618",
    lon: "-46.3322",
    address: {
      road: "Avenida Senador Pinheiro Machado",
      house_number: "456",
      suburb: "José Menino",
      city: "Santos",
      state: "São Paulo",
      country: "Brasil",
      postcode: "11075-002"
    }
  },
  {
    display_name: "Avenida Senador Vergueiro, São Bernardo do Campo, Brasil",
    lat: "-23.6944",
    lon: "-46.5654",
    address: {
      road: "Avenida Senador Vergueiro",
      house_number: "789",
      suburb: "Centro",
      city: "São Bernardo do Campo",
      state: "São Paulo",
      country: "Brasil",
      postcode: "09750-000"
    }
  }
];

export const useLocationSearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  const searchLocations = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (useFallback) {
        // Usar dados de fallback se API já falhou anteriormente
        const filteredSuggestions = fallbackSuggestions.filter(
          item => item.display_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setTimeout(() => {
          setSuggestions(filteredSuggestions);
          setIsLoading(false);
        }, 300);
        return;
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'User-Agent': 'Sugarcane Management App'
          },
          mode: 'cors'
        }
      );

      if (!response.ok) {
        throw new Error('Falha ao buscar localizações.');
      }

      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error('Erro na busca de localizações:', err);
      setError('Erro ao buscar localizações. Usando sugestões alternativas.');
      
      // Ativar modo fallback e usar dados locais
      setUseFallback(true);
      
      // Filtrar sugestões de fallback com base na consulta
      const filteredSuggestions = fallbackSuggestions.filter(
        item => item.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSuggestions(filteredSuggestions);
    } finally {
      setIsLoading(false);
    }
  };

  // Função específica para buscar por CEP
  const searchByCEP = async (cep: string) => {
    if (!cep || cep.length < 5) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cepWithoutHyphen = cep.replace(/\D/g, '');
      
      if (useFallback || cepWithoutHyphen.length !== 8) {
        // Fallback para quando a API falha
        const suggestion = fallbackSuggestions.find(
          item => item.address.postcode?.replace(/\D/g, '') === cepWithoutHyphen
        );
        
        setIsLoading(false);
        return suggestion || null;
      }

      // Primeiro tentamos usar a API ViaCEP, que é específica para CEPs brasileiros
      try {
        const viaCepResponse = await fetch(
          `https://viacep.com.br/ws/${cepWithoutHyphen}/json/`
        );
        
        if (viaCepResponse.ok) {
          const viaCepData = await viaCepResponse.json();
          
          if (!viaCepData.erro) {
            // Formatar o resultado para o nosso formato padrão
            const result: LocationSuggestion = {
              display_name: `${viaCepData.logradouro}, ${viaCepData.bairro}, ${viaCepData.localidade} - ${viaCepData.uf}, ${viaCepData.cep}`,
              lat: '', // ViaCEP não retorna coordenadas
              lon: '',
              address: {
                road: viaCepData.logradouro,
                suburb: viaCepData.bairro,
                city: viaCepData.localidade,
                state: viaCepData.uf,
                country: 'Brasil',
                postcode: viaCepData.cep
              }
            };
            
            // Se encontrou via ViaCEP, tenta buscar as coordenadas com OpenStreetMap
            try {
              const address = `${viaCepData.logradouro}, ${viaCepData.localidade}, ${viaCepData.uf}, Brasil`;
              const osmResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=1`,
                {
                  headers: {
                    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                    'User-Agent': 'Sugarcane Management App'
                  },
                  mode: 'cors'
                }
              );
              
              if (osmResponse.ok) {
                const osmData = await osmResponse.json();
                if (osmData && osmData.length > 0) {
                  result.lat = osmData[0].lat;
                  result.lon = osmData[0].lon;
                }
              }
            } catch (osmError) {
              console.error('Erro ao buscar coordenadas:', osmError);
            }
            
            setIsLoading(false);
            return result;
          }
        }
      } catch (viaCepError) {
        console.error('Erro na busca ViaCEP:', viaCepError);
      }

      // Se o ViaCEP não funcionou, tentamos o OpenStreetMap
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(
          cepWithoutHyphen
        )}&country=Brazil&format=json&addressdetails=1&limit=1`,
        {
          headers: {
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'User-Agent': 'Sugarcane Management App'
          },
          mode: 'cors'
        }
      );

      if (!response.ok) {
        throw new Error('Falha ao buscar CEP.');
      }

      const data = await response.json();
      setIsLoading(false);
      
      if (data && data.length > 0) {
        return data[0];
      } else {
        return null;
      }
    } catch (err) {
      console.error('Erro na busca de CEP:', err);
      setError('Erro ao buscar CEP. Tente informar o endereço manualmente.');
      setUseFallback(true);
      setIsLoading(false);
      
      // Procurar nos dados de fallback
      const cepWithoutHyphen = cep.replace(/\D/g, '');
      const suggestion = fallbackSuggestions.find(
        item => item.address.postcode?.replace(/\D/g, '') === cepWithoutHyphen
      );
      return suggestion || null;
    }
  };

  return {
    query,
    setQuery,
    suggestions,
    setSuggestions,
    isLoading,
    error,
    searchLocations,
    searchByCEP
  };
};
