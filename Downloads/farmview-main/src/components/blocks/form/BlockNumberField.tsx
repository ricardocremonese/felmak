
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface BlockNumberFieldProps {
  name: string;
  label: string;
  step?: string;
  required?: boolean;
}

export function BlockNumberField({ name, label, step = "0.01" }: BlockNumberFieldProps) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm text-gray-600">{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              step={step}
              {...field}
              onChange={e => field.onChange(parseFloat(e.target.value))}
              className="rounded-md border p-2 w-full"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
