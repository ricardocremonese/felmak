
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Sidebar from '../components/Sidebar';
import { Calendar, Clock, MapPin, User, Home, FileText, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ScheduleVisitForm {
  leadId: string;
  propertyId: string;
  date: Date;
  time: string;
  notes: string;
}

const ScheduleVisit = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [upcomingVisits, setUpcomingVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ScheduleVisitForm>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id, name, email, phone');
      
      if (leadsError) throw leadsError;
      
      // Fetch properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, address, city');
      
      if (propertiesError) throw propertiesError;
      
      // Fetch upcoming visits
      const { data: visitsData, error: visitsError } = await supabase
        .from('scheduled_visits')
        .select(`
          *,
          lead:leads(name, email, phone),
          property:properties(title, address, city)
        `)
        .order('scheduled_date', { ascending: true });
      
      if (visitsError) throw visitsError;
      
      setLeads(leadsData || []);
      setProperties(propertiesData || []);
      setUpcomingVisits(visitsData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: error.message || 'Não foi possível carregar os dados necessários',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ScheduleVisitForm) => {
    try {
      // Combine date and time
      const dateTime = new Date(data.date);
      const [hours, minutes] = data.time.split(':').map(Number);
      dateTime.setHours(hours, minutes);
      
      // Create visit in Supabase
      const { data: newVisit, error } = await supabase
        .from('scheduled_visits')
        .insert({
          lead_id: data.leadId,
          property_id: data.propertyId,
          scheduled_date: dateTime.toISOString(),
          notes: data.notes,
          status: 'Agendada'
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: 'Visita agendada com sucesso',
        description: 'A visita foi agendada e o lead será notificado.',
      });
      
      // Reset form and refresh data
      reset();
      fetchData();
    } catch (error: any) {
      console.error('Error scheduling visit:', error);
      toast({
        title: 'Erro ao agendar visita',
        description: error.message || 'Não foi possível agendar a visita',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex h-screen bg-realEstate-lightGray overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 ml-0 lg:ml-64 flex flex-col overflow-y-auto">
        <header className="bg-white p-4 border-b shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">Agendar Visitas</h1>
          <p className="text-gray-500">Agende visitas para seus leads interessados</p>
        </header>
        
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Nova Visita</CardTitle>
                <CardDescription>Preencha os dados para agendar uma visita</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="lead">Lead</Label>
                    <Select onValueChange={(value) => register('leadId').onChange({ target: { value } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um lead" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Leads</SelectLabel>
                          {leads.map(lead => (
                            <SelectItem key={lead.id} value={lead.id}>
                              {lead.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.leadId && <p className="text-sm text-red-500">Lead é obrigatório</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="property">Imóvel</Label>
                    <Select onValueChange={(value) => register('propertyId').onChange({ target: { value } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um imóvel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Imóveis</SelectLabel>
                          {properties.map(property => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.title}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.propertyId && <p className="text-sm text-red-500">Imóvel é obrigatório</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Data</Label>
                      <DatePicker 
                        onChange={(date) => register('date').onChange({ target: { value: date } })}
                      />
                      {errors.date && <p className="text-sm text-red-500">Data é obrigatória</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="time">Horário</Label>
                      <Input
                        type="time"
                        {...register('time', { required: true })}
                      />
                      {errors.time && <p className="text-sm text-red-500">Horário é obrigatório</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      placeholder="Adicione observações para esta visita"
                      {...register('notes')}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar Visita
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
          
          {/* Upcoming Visits Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Próximas Visitas</CardTitle>
                  <CardDescription>Visitas agendadas para os próximos dias</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Carregando visitas...</p>
                  </div>
                ) : upcomingVisits.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhuma visita agendada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingVisits.map((visit) => (
                      <div
                        key={visit.id}
                        className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{visit.property.title}</h3>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            {visit.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            <span>{visit.lead.name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{format(new Date(visit.scheduled_date), "dd/MM/yyyy 'às' HH:mm")}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Home className="h-4 w-4 mr-2" />
                            <span>{visit.property.title}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{visit.property.address}, {visit.property.city}</span>
                          </div>
                        </div>
                        {visit.notes && (
                          <div className="flex items-start text-sm text-gray-600 mt-2 pt-2 border-t">
                            <FileText className="h-4 w-4 mr-2 mt-0.5" />
                            <span>{visit.notes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScheduleVisit;
