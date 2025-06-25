
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface LandAndBuiltAreaFieldsProps {
  form: any;
}

const LandAndBuiltAreaFields: React.FC<LandAndBuiltAreaFieldsProps> = ({ form }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormField
      control={form.control}
      name="landArea"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Área total do terreno (m²){" "}
            <span className="text-gray-400">(Opcional)</span>
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              min={0}
              placeholder="Ex: 250"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="builtArea"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Área construída (m²){" "}
            <span className="text-gray-400">(Opcional)</span>
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              min={0}
              placeholder="Ex: 120"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
);

export default LandAndBuiltAreaFields;
