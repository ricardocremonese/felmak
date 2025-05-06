
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function BlockNameField() {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="nome_bloco"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm text-gray-600">Nome do Bloco</FormLabel>
          <FormControl>
            <Input {...field} className="rounded-md border p-2 w-full" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
