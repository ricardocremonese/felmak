-- Create ordens_servico table for service orders
CREATE TABLE public.ordens_servico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_os SERIAL UNIQUE NOT NULL,
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT,
  cliente_email TEXT,
  cliente_endereco TEXT,
  cliente_bairro TEXT,
  cliente_cidade TEXT,
  cliente_estado TEXT,
  cliente_cep TEXT,
  equipamento_tipo TEXT NOT NULL,
  equipamento_marca TEXT,
  equipamento_modelo TEXT,
  equipamento_serie TEXT,
  defeito_relatado TEXT NOT NULL,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'aberta',
  prioridade TEXT NOT NULL DEFAULT 'normal',
  tecnico_responsavel TEXT,
  data_entrada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_previsao TIMESTAMP WITH TIME ZONE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  valor_servico DECIMAL(10,2) DEFAULT 0,
  valor_pecas DECIMAL(10,2) DEFAULT 0,
  valor_total DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pecas_materiais table for parts and materials
CREATE TABLE public.pecas_materiais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  peca_nome TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  preco_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user authentication and roles
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pecas_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ordens_servico (allow all operations for authenticated users)
CREATE POLICY "Authenticated users can view all service orders" 
ON public.ordens_servico 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can create service orders" 
ON public.ordens_servico 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update service orders" 
ON public.ordens_servico 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete service orders" 
ON public.ordens_servico 
FOR DELETE 
TO authenticated 
USING (true);

-- Create RLS policies for pecas_materiais
CREATE POLICY "Authenticated users can view all parts" 
ON public.pecas_materiais 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can create parts" 
ON public.pecas_materiais 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update parts" 
ON public.pecas_materiais 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete parts" 
ON public.pecas_materiais 
FOR DELETE 
TO authenticated 
USING (true);

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_ordens_servico_updated_at
BEFORE UPDATE ON public.ordens_servico
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN NEW.email = 'admin@felmak.com.br' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profiles
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();