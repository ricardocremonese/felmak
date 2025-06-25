
import React, { useMemo, useState } from "react";
import { properties } from "@/data/mockData";
import { Property } from "@/types";
import Sidebar from "@/components/Sidebar";
import PropertyDetails from "@/components/PropertyDetails";
import { Share2, Search, MapPin, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface GroupedProperties {
  [state: string]: {
    [city: string]: Property[];
  };
}

interface FilterForm {
  state: string;
  city: string;
  searchQuery: string;
  propertyCode: string; // Added property code field
}

const ViewProperties: React.FC = () => {
  const { toast } = useToast();
  const form = useForm<FilterForm>({
    defaultValues: {
      state: "",
      city: "",
      searchQuery: "",
      propertyCode: "", // Initialize property code field
    },
  });

  // Group properties by state and city
  const groupedProperties = useMemo(() => {
    const grouped: GroupedProperties = {};

    // For this demo, we'll extract state from city since our mock data doesn't have separate state
    properties.forEach((property) => {
      // Create a mapping of cities to states (in a real app, you would have this data properly structured)
      const stateMapping: {[city: string]: string} = {
        "São Paulo": "SP",
        "Rio de Janeiro": "RJ",
        "Curitiba": "PR",
        "Salvador": "BA",
        "Belo Horizonte": "MG"
      };
      
      const state = stateMapping[property.city] || "Outro";
      const city = property.city;

      if (!grouped[state]) {
        grouped[state] = {};
      }
      
      if (!grouped[state][city]) {
        grouped[state][city] = [];
      }
      
      grouped[state][city].push(property);
    });
    
    return grouped;
  }, []);

  // Extract unique states and cities for filters
  const states = useMemo(() => {
    return Object.keys(groupedProperties).sort();
  }, [groupedProperties]);

  const cities = useMemo(() => {
    const selectedState = form.watch("state");
    if (!selectedState) return Object.keys(
      Object.values(groupedProperties).reduce((acc, stateData) => {
        return { ...acc, ...stateData };
      }, {})
    ).sort();
    
    return selectedState ? Object.keys(groupedProperties[selectedState] || {}).sort() : [];
  }, [groupedProperties, form.watch("state")]);

  // Filter properties based on search criteria
  const filteredProperties = useMemo(() => {
    let filtered = { ...groupedProperties };
    const formValues = form.getValues();
    
    // Filter by property code (this takes precedence if specified)
    if (formValues.propertyCode) {
      const propertyCodeLower = formValues.propertyCode.toLowerCase();
      const result: GroupedProperties = {};
      
      Object.entries(filtered).forEach(([state, cityData]) => {
        result[state] = {};
        
        Object.entries(cityData).forEach(([city, props]) => {
          const matchingProps = props.filter(property => 
            property.propertyCode?.toLowerCase().includes(propertyCodeLower)
          );
          
          if (matchingProps.length > 0) {
            result[state][city] = matchingProps;
          }
        });
        
        // Remove empty states
        if (Object.keys(result[state]).length === 0) {
          delete result[state];
        }
      });
      
      return result;
    }
    
    // If no property code specified, continue with other filters
    
    // Filter by state
    if (formValues.state) {
      filtered = {
        [formValues.state]: filtered[formValues.state] || {},
      };
    }
    
    // Filter by city
    if (formValues.state && formValues.city) {
      filtered = {
        [formValues.state]: {
          [formValues.city]: filtered[formValues.state][formValues.city] || [],
        },
      };
    }
    
    // Filter by search query
    if (formValues.searchQuery) {
      const query = formValues.searchQuery.toLowerCase();
      const result: GroupedProperties = {};
      
      Object.entries(filtered).forEach(([state, cityData]) => {
        result[state] = {};
        
        Object.entries(cityData).forEach(([city, props]) => {
          // Check if state or city match the query
          if (
            state.toLowerCase().includes(query) || 
            city.toLowerCase().includes(query)
          ) {
            result[state][city] = props;
          }
        });
        
        // Remove empty states
        if (Object.keys(result[state]).length === 0) {
          delete result[state];
        }
      });
      
      filtered = result;
    }
    
    return filtered;
  }, [groupedProperties, form.watch()]);

  const sharePropertyOnWhatsApp = (property: Property) => {
    // Create a message with property details
    const message = `
*${property.title}*
${property.address}, ${property.city}
*Preço:* ${formatCurrency(property.price)}
*Detalhes:* ${property.bedrooms} quartos, ${property.bathrooms} banheiros, ${property.squareMeters}m²
*Descrição:* ${property.description}
    `;
    
    // Encode for WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    // Notify user
    toast({
      title: "Link do WhatsApp criado",
      description: "Compartilhe este imóvel com seus clientes!",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleResetFilters = () => {
    form.reset({
      state: "",
      city: "",
      searchQuery: "",
      propertyCode: "", // Also reset property code
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6 ml-64 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Imóveis Disponíveis</h1>
          
          {/* Search and filter section */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <Form {...form}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Property Code Search Field */}
                <FormField
                  control={form.control}
                  name="propertyCode"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            {...field}
                            className="pl-10"
                            placeholder="Buscar por código do imóvel (ex: SP-APT-001)"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Reset city when state changes
                            form.setValue("city", "");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all_states">Todos os Estados</SelectItem>
                            {states.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!form.watch("state")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar Cidade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all_cities">Todas as Cidades</SelectItem>
                            {cities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="searchQuery"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            {...field}
                            className="pl-10"
                            placeholder="Buscar por estado ou cidade"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={handleResetFilters}
                    className="w-full"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </Form>
          </div>
          
          {/* Display properties */}
          {Object.keys(filteredProperties).length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium mb-2">Nenhum imóvel encontrado</h3>
              <p className="text-gray-500">
                Tente ajustar seus filtros de busca ou limpar para ver todos os imóveis disponíveis.
              </p>
            </div>
          ) : (
            <>
              {/* Iterate through states */}
              {Object.entries(filteredProperties).map(([state, cities]) => (
                <div key={state} className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 bg-realEstate-blue/10 p-2 rounded-md">
                    Estado: {state}
                  </h2>
                  
                  {/* Iterate through cities in each state */}
                  {Object.entries(cities).map(([city, cityProperties]) => (
                    <div key={city} className="mb-6">
                      <h3 className="text-lg font-medium mb-3 border-b pb-2">
                        Cidade: {city} ({cityProperties.length} imóveis)
                      </h3>
                      
                      {/* Display properties grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cityProperties.map((property) => (
                          <div key={property.id} className="relative">
                            <PropertyDetails property={property} />
                            <Button 
                              variant="outline"
                              size="sm"
                              className="absolute top-4 right-4 bg-white"
                              onClick={() => sharePropertyOnWhatsApp(property)}
                            >
                              <Share2 className="h-4 w-4 mr-1" />
                              Compartilhar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewProperties;
