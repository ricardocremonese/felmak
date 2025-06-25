import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { formSchema, type FormData } from "@/lib/validation/signupSchema";

const SignUpForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      personType: "fisica",
      document: "",
      email: "",
      whatsapp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const formatWhatsApp = (input: string) => {
    const numbers = input.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatWhatsApp(e.target.value);
    form.setValue("whatsapp", formattedValue);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        }
      });

      if (authError) {
        console.error("Auth Error:", authError);
        
        if (authError.status === 429 || authError.code === 'over_email_send_rate_limit') {
          toast({
            title: "Limite de envio de e-mails excedido",
            description: "Por favor, aguarde alguns minutos antes de tentar novamente.",
            variant: "destructive",
          });
          return;
        }
        
        if (authError.message?.includes("Email signups are disabled")) {
          toast({
            title: "Cadastro por e-mail desativado",
            description: "O cadastro por e-mail está desativado no momento. Por favor, entre em contato com o administrador.",
            variant: "destructive",
          });
          return;
        }
        
        throw authError;
      }

      if (authData.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: authData.user.id,
                full_name: data.fullName,
                email: data.email,
                whatsapp: data.whatsapp
              }
            ]);
  
          if (profileError) {
            console.error("Profile Error:", profileError);
            throw profileError;
          }
        } catch (profileErr) {
          console.error("Profile DB Error:", profileErr);
        }
        
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu e-mail para confirmar o cadastro. Você será redirecionado para a página de login.",
        });
        
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Signup Error:", error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro durante o cadastro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo*</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="personType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Tipo de Pessoa*</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fisica" id="fisica" />
                    <Label htmlFor="fisica">Pessoa Física (CPF)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="juridica" id="juridica" />
                    <Label htmlFor="juridica">Pessoa Jurídica (CNPJ)</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="document"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {form.watch("personType") === "fisica" ? "CPF*" : "CNPJ*"}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder={form.watch("personType") === "fisica" 
                    ? "Digite apenas números (11 dígitos)" 
                    : "Digite apenas números (14 dígitos)"} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail*</FormLabel>
              <FormControl>
                <Input type="email" placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="whatsapp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp (com DDD)*</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(00) 00000-0000" 
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    handleWhatsAppChange(e);
                  }} 
                />
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
              <FormLabel>Senha*</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Sua senha (mínimo 6 caracteres)" {...field} />
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
              <FormLabel>Confirme a Senha*</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Digite sua senha novamente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col space-y-3 pt-4">
          <Button 
            type="submit"
            className="bg-[#512da8] text-white text-xs py-[10px] px-[45px] border border-transparent rounded-lg font-semibold tracking-[0.5px] uppercase cursor-pointer w-full"
            disabled={loading}
          >
            {loading ? "Processando..." : "Cadastrar"}
          </Button>
          
          <Button 
            type="button"
            variant="outline"
            className="text-xs py-[10px] px-[45px] rounded-lg font-semibold tracking-[0.5px] uppercase cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Já tem uma conta? Faça Login
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SignUpForm;
