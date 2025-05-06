
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';
import { ClientsHeader } from '@/components/clients/ClientsHeader';
import { ClientsTable } from '@/components/clients/ClientsTable';
import { CreateClientDialog } from '@/components/clients/CreateClientDialog';
import { EditClientDialog } from '@/components/clients/EditClientDialog';

const Clients = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { clients, isLoading, fetchClients } = useClients();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);

  const handleEditClient = (client: Client) => {
    setCurrentClient(client);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: t('clients.clientDeleted'),
      });
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: t('common.error'),
        description: t('clients.errorDeleting'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClientsHeader onCreateClick={() => setIsCreateDialogOpen(true)} />
      
      <ClientsTable
        clients={clients}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
      />

      <CreateClientDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onClientCreated={fetchClients}
      />

      <EditClientDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onClientUpdated={fetchClients}
        client={currentClient}
      />
    </div>
  );
};

export default Clients;
