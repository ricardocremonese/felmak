
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema, FarmFormData } from '../types/farmForm';

const initialFormData: FarmFormData = {
  name: '',
  address: '',
  cane_type: '',
  total_area: '',
  planted_area: '',
  latitude: '',
  longitude: '',
  client_id: '',
  localizacao: '',
  cep: '',
};

export const useFarmForm = (onSuccess: () => void) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FarmFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationSelected, setLocationSelected] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Farm fields
      name: '',
      address: '',
      cane_type: '',
      total_area: 0,
      planted_area: 0,
      latitude: '',
      longitude: '',
      client_id: '',
      localizacao: '',
      cep: '',
      // Block fields
      nome_bloco: '',
      area_acres: 0,
      area_m2: 0,
      produto_usado: '',
      quantidade_litros: 0,
      valor_produto: 0,
      data_plantio: '',
      data_aplicacao: '',
      data_colheita: '',
      proxima_colheita: '',
      proxima_aplicacao: '',
      cor: '#4CAF50',
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If user manually edits address field, require location selection again
    if (name === 'address') {
      setLocationSelected(false);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLocationSelect = (location: string, lat: string, lon: string) => {
    setFormData(prev => ({
      ...prev,
      address: location,
      localizacao: location,
      latitude: lat,
      longitude: lon,
    }));
    setLocationSelected(true);
  };

  const handleZipCodeSelect = (location: string, lat: string, lon: string, cep: string) => {
    setFormData(prev => ({
      ...prev,
      address: location,
      localizacao: location,
      latitude: lat,
      longitude: lon,
      cep,
    }));
    setLocationSelected(true);
  };

  const handleSave = async (values: any) => {
    setIsSubmitting(true);

    try {
      // Convert CEP to number or null, and ensure numeric fields are properly converted
      const cepNumber = formData.cep ? Number(formData.cep.replace(/\D/g, '')) : null;
      
      // First save the farm
      const { data: farmData, error: farmError } = await supabase
        .from('farms')
        .insert({
          name: values.name,
          address: formData.address,
          localizacao: formData.localizacao,
          cane_type: values.cane_type,
          total_area: Number(values.total_area),
          planted_area: Number(values.planted_area),
          latitude: formData.latitude ? Number(formData.latitude) : null,
          longitude: formData.longitude ? Number(formData.longitude) : null,
          client_id: values.client_id || null,
          cep: cepNumber
        })
        .select();

      if (farmError) throw farmError;
      
      if (!farmData || farmData.length === 0) {
        throw new Error('Failed to create farm');
      }

      const farmId = farmData[0].id;

      // Then save the block associated with the farm
      const { error: blockError } = await supabase.from("blocos_fazenda").insert({
        nome_bloco: values.nome_bloco,
        area_acres: values.area_acres,
        area_m2: values.area_m2,
        produto_usado: values.produto_usado,
        quantidade_litros: values.quantidade_litros,
        valor_produto: values.valor_produto,
        data_plantio: values.data_plantio,
        data_aplicacao: values.data_aplicacao,
        data_colheita: values.data_colheita || null,
        proxima_colheita: values.proxima_colheita || null,
        proxima_aplicacao: values.proxima_aplicacao || null,
        cor: values.cor,
        fazenda_id: farmId,
      });

      if (blockError) throw blockError;
      
      toast({
        title: t('farms.farmCreated'),
        description: t('blocks.blockCreated'),
      });
      
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error saving farm and block:', error);
      toast({
        title: t('common.error'),
        description: t('farms.errorSaving'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setLocationSelected(false);
    form.reset();
  };

  return {
    form,
    formData,
    isSubmitting,
    handleInputChange,
    handleSelectChange,
    handleLocationSelect,
    handleZipCodeSelect,
    locationSelected,
    handleSave,
    resetForm
  };
};
