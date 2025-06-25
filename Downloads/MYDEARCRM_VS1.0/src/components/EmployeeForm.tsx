import React, { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { Camera, Eye, EyeOff, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Employee, EmployeeRole } from "@/types";
import { cn } from "@/lib/utils";

const employeeSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  role: z.enum(["Corretor", "Financeiro", "Recepção", "Jurídico", "Locação", "Vendas", "Manutenção"]),
  cellPhone: z.string().min(8, "Celular é obrigatório"),
  personalEmail: z.string().email("Email inválido"),
  creciNumber: z.string().optional(),
  photoUrl: z.string().optional(),
  hireDateString: z.string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data deve estar no formato DD/MM/AAAA")
    .refine(
      (dateStr) => {
        try {
          const parts = dateStr.split('/');
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          
          const date = new Date(year, month, day);
          return (
            date.getDate() === day && 
            date.getMonth() === month && 
            date.getFullYear() === year
          );
        } catch (e) {
          return false;
        }
      },
      { message: "Data inválida" }
    ),
  supervisor: z.string().min(3, "Supervisor é obrigatório"),
  login: z.string().min(3, "Login é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme sua senha")
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: Employee | null;
  onSubmit: (data: Employee) => void;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ 
  employee, 
  onSubmit,
  onCancel
}) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(employee?.photoUrl || null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const defaultValues: Partial<EmployeeFormValues> = {
    id: employee?.id || "",
    fullName: employee?.fullName || "",
    role: employee?.role || "Corretor",
    cellPhone: employee?.cellPhone || "",
    personalEmail: employee?.personalEmail || "",
    creciNumber: employee?.creciNumber || "",
    photoUrl: employee?.photoUrl || "",
    hireDateString: employee?.hireDate ? format(new Date(employee.hireDate), "dd/MM/yyyy") : format(new Date(), "dd/MM/yyyy"),
    supervisor: employee?.supervisor || "",
    login: employee?.login || "",
    password: employee?.password || "",
    confirmPassword: employee?.password || "",
  };

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  const { watch } = form;
  const selectedRole = watch("role");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = event.target.files?.[0];
    
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic'];
    const fileType = file.type.toLowerCase();
    
    if (!allowedTypes.includes(fileType)) {
      setFileError("Formato inválido. Use apenas JPEG, JPG, HEIC ou PNG.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 500;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const aspectRatio = img.width / img.height;
        let drawWidth = 500;
        let drawHeight = 500;
        let x = 0;
        let y = 0;
        
        if (aspectRatio > 1) {
          drawHeight = 500 / aspectRatio;
          y = (500 - drawHeight) / 2;
        } else {
          drawWidth = 500 * aspectRatio;
          x = (500 - drawWidth) / 2;
        }
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 500, 500);
        
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        
        const optimizedImage = canvas.toDataURL('image/jpeg', 0.9);
        setPhotoPreview(optimizedImage);
        form.setValue("photoUrl", optimizedImage);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 8) {
      value = value.substring(0, 8);
    }
    
    if (value.length > 4) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}/${value.substring(4)}`;
    } else if (value.length > 2) {
      value = `${value.substring(0, 2)}/${value.substring(2)}`;
    }
    
    return value;
  };

  const handleSubmit = (data: EmployeeFormValues) => {
    const { confirmPassword, hireDateString, ...restData } = data;
    
    let dateValue;
    try {
      dateValue = parse(hireDateString, "dd/MM/yyyy", new Date());
      const formattedDate = format(dateValue, "yyyy-MM-dd");
      
      const finalEmployeeData: Employee = {
        id: restData.id || Date.now().toString(),
        fullName: restData.fullName,
        role: restData.role,
        cellPhone: restData.cellPhone,
        personalEmail: restData.personalEmail,
        photoUrl: restData.photoUrl || '/placeholder.svg',
        hireDate: formattedDate,
        supervisor: restData.supervisor,
        login: restData.login,
        password: restData.password,
        creciNumber: restData.creciNumber
      };
      
      onSubmit(finalEmployeeData);
    } catch (error) {
      console.error("Date parsing error:", error);
      form.setError("hireDateString", { 
        type: "manual", 
        message: "Formato de data inválido. Use DD/MM/AAAA" 
      });
    }
  };

  const sampleAvatars = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    "https://images.unsplash.com/photo-1500648767791-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="mb-6">
          <Label className="block mb-2">Foto do Funcionário</Label>
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <img 
                src={photoPreview || "/placeholder.svg"} 
                alt="Preview" 
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
              <Button 
                type="button"
                size="icon"
                className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1"
                onClick={triggerFileInput}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".jpg,.jpeg,.png,.heic"
                onChange={handleImageUpload}
              />
            </div>
            {fileError && (
              <p className="text-sm text-destructive mt-1">{fileError}</p>
            )}
            <div className="w-full max-w-xs mb-4">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full flex items-center justify-center"
                onClick={triggerFileInput}
              >
                <Upload className="h-4 w-4 mr-2" />
                Fazer upload de foto
              </Button>
              <p className="text-xs text-gray-500 mt-1 text-center">
                Formatos aceitos: JPEG, JPG, PNG, HEIC. Tamanho: 500x500px
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {sampleAvatars.map((avatar, index) => (
                <img 
                  key={index}
                  src={avatar}
                  alt={`Avatar ${index + 1}`}
                  className={cn(
                    "w-12 h-12 rounded-full object-cover cursor-pointer border-2",
                    photoPreview === avatar ? "border-primary" : "border-transparent hover:border-gray-300"
                  )}
                  onClick={() => {
                    setPhotoPreview(avatar);
                    form.setValue("photoUrl", avatar);
                  }}
                />
              ))}
            </div>
            <input type="hidden" {...form.register("photoUrl")} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do funcionário" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cargo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Corretor">Corretor</SelectItem>
                    <SelectItem value="Financeiro">Financeiro</SelectItem>
                    <SelectItem value="Recepção">Recepção</SelectItem>
                    <SelectItem value="Jurídico">Jurídico</SelectItem>
                    <SelectItem value="Locação">Locação</SelectItem>
                    <SelectItem value="Vendas">Vendas</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cellPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Celular</FormLabel>
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="personalEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Pessoal</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="email@exemplo.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedRole === "Corretor" && (
            <FormField
              control={form.control}
              name="creciNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do CRECI</FormLabel>
                  <FormControl>
                    <Input placeholder="00000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="hireDateString"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Admissão</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="DD/MM/AAAA" 
                    {...field}
                    onChange={(e) => {
                      const formattedValue = handleDateInput(e);
                      field.onChange(formattedValue);
                    }}
                    maxLength={10}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supervisor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supervisor</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do supervisor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="login"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Login para o CRM</FormLabel>
                <FormControl>
                  <Input placeholder="login" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="******" 
                      {...field} 
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="******" 
                      {...field} 
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {employee ? 'Salvar Alterações' : 'Cadastrar Funcionário'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmployeeForm;
