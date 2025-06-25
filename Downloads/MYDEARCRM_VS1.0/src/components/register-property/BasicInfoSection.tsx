
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { HashIcon, Home } from "lucide-react";
import LandAndBuiltAreaFields from "./LandAndBuiltAreaFields";

interface BasicInfoSectionProps {
  form: any;
}
const propertyTypes = [
  { value: "Apartment", label: "Apartamento" },
  { value: "House", label: "Casa" },
  { value: "Commercial", label: "Comercial" },
  { value: "Land", label: "Terreno" },
];

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ form }) => {
  const watchedType = form.watch("type");
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 flex items-center">
        <HashIcon className="h-5 w-5 mr-2" />
        Código do Imóvel
      </h2>
      <FormField
        control={form.control}
        name="propertyCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código do Imóvel (gerado automaticamente)</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                readOnly 
                className="bg-gray-100"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <h2 className="text-lg font-semibold text-gray-700 flex items-center mt-6">
        <Home className="h-5 w-5 mr-2" />
        Informações Básicas
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título do Imóvel</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Apartamento Moderno com Vista para o Mar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Imóvel</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de imóvel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {propertyTypes.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {/* Campos específicos para tipos de imóvel */}
      {watchedType === "House" && (
        <LandAndBuiltAreaFields form={form} />
      )}
      {watchedType === "Apartment" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="floor_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Andar (Número)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="Ex: 5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="has_elevator"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Possui elevador?</FormLabel>
                <FormControl>
                  <select
                    className="bg-white border px-3 py-2 rounded-md"
                    value={field.value ?? ""}
                    onChange={e => field.onChange(e.target.value === "true")}
                  >
                    <option value="">Selecione</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="condominium_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taxa de Condomínio</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="Ex: 800" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
      {watchedType === "House" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="has_pool"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Possui Piscina?</FormLabel>
                <FormControl>
                  <select
                    className="bg-white border px-3 py-2 rounded-md"
                    value={field.value ?? ""}
                    onChange={e => field.onChange(e.target.value === "true")}
                  >
                    <option value="">Selecione</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
      {watchedType === "Commercial" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="commercial_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Comercial</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Loja, Sala, Galpão" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="front_width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Largura de Frente (m)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="Ex: 10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zoning"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zoneamento</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Comercial, Misto, Industrial" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
      {watchedType === "Land" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="topography"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Topografia</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Plano, Declive, Aclive" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_corner_lot"
            render={({ field }) => (
              <FormItem>
                <FormLabel>É esquina?</FormLabel>
                <FormControl>
                  <select
                    className="bg-white border px-3 py-2 rounded-md"
                    value={field.value ?? ""}
                    onChange={e => field.onChange(e.target.value === "true")}
                  >
                    <option value="">Selecione</option>
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default BasicInfoSection;

