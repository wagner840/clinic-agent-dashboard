
-- Criar tabela para armazenar ganhos diários por médico
CREATE TABLE public.doctor_daily_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_email TEXT NOT NULL,
  date DATE NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_appointments INTEGER NOT NULL DEFAULT 0,
  insurance_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  insurance_appointments INTEGER NOT NULL DEFAULT 0,
  private_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  private_appointments INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, doctor_name, date)
);

-- Criar tabela para armazenar ganhos totais por médico (histórico acumulado)
CREATE TABLE public.doctor_total_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_email TEXT NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_appointments INTEGER NOT NULL DEFAULT 0,
  insurance_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  insurance_appointments INTEGER NOT NULL DEFAULT 0,
  private_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  private_appointments INTEGER NOT NULL DEFAULT 0,
  first_appointment_date DATE,
  last_appointment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, doctor_name)
);

-- Adicionar RLS para as tabelas
ALTER TABLE public.doctor_daily_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_total_earnings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para doctor_daily_earnings
CREATE POLICY "Users can view their own doctor daily earnings" 
  ON public.doctor_daily_earnings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own doctor daily earnings" 
  ON public.doctor_daily_earnings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own doctor daily earnings" 
  ON public.doctor_daily_earnings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas RLS para doctor_total_earnings
CREATE POLICY "Users can view their own doctor total earnings" 
  ON public.doctor_total_earnings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own doctor total earnings" 
  ON public.doctor_total_earnings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own doctor total earnings" 
  ON public.doctor_total_earnings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER doctor_daily_earnings_updated_at
  BEFORE UPDATE ON public.doctor_daily_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER doctor_total_earnings_updated_at
  BEFORE UPDATE ON public.doctor_total_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
