
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function BlockAreaFields() {
  const form = useFormContext();
  const acres = form.watch("area_acres");

  // Convert acres to square meters whenever acres changes
  useEffect(() => {
    if (acres) {
      const m2 = Number(acres) * 4046.86;
      form.setValue("area_m2", m2);
    }
  }, [acres, form]);

  return (
    <>
      <FormField
        control={form.control}
        name="area_acres"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-gray-600">Área (acres)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                {...field} 
                onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                className="rounded-md border p-2 w-full" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="area_m2"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm text-gray-600">Área (m²)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                {...field} 
                onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                className="rounded-md border p-2 w-full" 
                disabled
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
