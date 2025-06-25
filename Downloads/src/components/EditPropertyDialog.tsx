
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

// Mock properties data - in a real app, this would come from an API or state management
const mockProperties = [
  { id: 1, title: "Apartamento no Centro", address: "Rua das Flores, 123", city: "São Paulo", propertyCode: "SP-APT-001" },
  { id: 2, title: "Casa na Praia", address: "Av. Beira-mar, 456", city: "Rio de Janeiro", propertyCode: "RJ-CSA-002" },
  { id: 3, title: "Cobertura Duplex", address: "Rua dos Pinheiros, 789", city: "Belo Horizonte", propertyCode: "BH-COB-003" },
  { id: 4, title: "Kitnet Mobiliada", address: "Rua Augusta, 1011", city: "São Paulo", propertyCode: "SP-KIT-004" }
];

interface EditPropertyDialogProps {
  onPropertySelect: (property: any) => void;
}

const EditPropertyDialog: React.FC<EditPropertyDialogProps> = ({ onPropertySelect }) => {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleSelect = () => {
    if (!selectedProperty) {
      toast({
        title: "Selecione um imóvel",
        description: "Você precisa selecionar um imóvel para editar",
        variant: "destructive"
      });
      return;
    }
    
    const property = mockProperties.find(p => p.id.toString() === selectedProperty);
    if (property) {
      onPropertySelect(property);
      setOpen(false);
      toast({
        title: "Imóvel selecionado para edição",
        description: `${property.title} (Código: ${property.propertyCode}) carregado no formulário`
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Pencil className="h-4 w-4" />
          Editar Imóvel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Imóvel</DialogTitle>
          <DialogDescription>
            Selecione um imóvel para editar suas informações.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="property" className="text-sm font-medium">
              Imóvel
            </label>
            <Select
              value={selectedProperty}
              onValueChange={setSelectedProperty}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um imóvel" />
              </SelectTrigger>
              <SelectContent>
                {mockProperties.map((property) => (
                  <SelectItem key={property.id} value={property.id.toString()}>
                    {property.propertyCode} - {property.title} - {property.address}, {property.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSelect}>Selecionar para Edição</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPropertyDialog;
