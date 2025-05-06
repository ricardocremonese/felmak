
import React, { useState, useEffect } from 'react';
import { mockClients } from '@/data/mockData';
import { Farm, Block } from '@/types';
import { FarmsHeader } from '@/components/farms/FarmsHeader';
import { FarmsList } from '@/components/farms/FarmsList';
import { CreateFarmDialog } from '@/components/farms/CreateFarmDialog';
import { EditFarmDialog } from '@/components/farms/EditFarmDialog';
import { useFarms } from '@/hooks/useFarms';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const Farms = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { farms, fetchFarms } = useFarms();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentFarm, setCurrentFarm] = useState<Farm | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    cane_type: '',
    total_area: '',
    planted_area: '',
    latitude: '',
    longitude: '',
    client_id: '',
    localizacao: '',
    cep: ''
  });

  const handleCreateFarm = () => {
    setFormData({
      name: '',
      address: '',
      cane_type: '',
      total_area: '',
      planted_area: '',
      latitude: '',
      longitude: '',
      client_id: '',
      localizacao: '',
      cep: ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditFarm = (farm: Farm) => {
    setCurrentFarm(farm);
    setFormData({
      name: farm.name,
      address: farm.address || '',
      cane_type: farm.caneType || '',
      total_area: farm.totalArea.toString(),
      planted_area: farm.plantedArea.toString(),
      latitude: farm.latitude?.toString() || '',
      longitude: farm.longitude?.toString() || '',
      client_id: farm.clientId || '',
      localizacao: farm.localizacao || '',
      cep: farm.cep || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveFarm = async () => {
    if (!currentFarm) return;
    
    setIsSubmitting(true);

    try {
      // Convert CEP to number for database storage
      const cepNumber = formData.cep ? Number(formData.cep.replace(/\D/g, '')) : null;
      
      const { error } = await supabase
        .from('farms')
        .update({
          name: formData.name,
          address: formData.address,
          localizacao: formData.localizacao || formData.address,
          cane_type: formData.cane_type,
          total_area: Number(formData.total_area),
          planted_area: Number(formData.planted_area),
          latitude: formData.latitude ? Number(formData.latitude) : null,
          longitude: formData.longitude ? Number(formData.longitude) : null,
          client_id: formData.client_id || null,
          cep: cepNumber
        })
        .eq('id', currentFarm.id);

      if (error) throw error;
      
      toast({
        title: t('farms.farmUpdated'),
      });
      
      setIsEditDialogOpen(false);
      fetchFarms();
    } catch (error) {
      console.error('Error updating farm:', error);
      toast({
        title: t('common.error'),
        description: t('farms.errorSaving'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getClientName = (clientId: string) => {
    const client = mockClients.find((client) => client.id === clientId);
    return client ? client.name : '-';
  };

  const handleFarmCreated = () => {
    fetchFarms();
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <FarmsHeader onCreateFarm={handleCreateFarm} />
      <FarmsList 
        farms={farms} 
        onEdit={handleEditFarm} 
        getClientName={getClientName}
      />

      <CreateFarmDialog 
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onFarmCreated={handleFarmCreated}
      />

      <EditFarmDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        formData={formData}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onSave={handleSaveFarm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Farms;
