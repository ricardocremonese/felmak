
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { FormValues, formSchema } from './types/blockForm';
import { BlockNameField } from './form/BlockNameField';
import { BlockAreaFields } from './form/BlockAreaFields';
import { BlockProductField } from './form/BlockProductField';
import { BlockNumberField } from './form/BlockNumberField';
import { BlockDateField } from './form/BlockDateField';
import { BlockColorField } from './form/BlockColorField';

interface CreateBlockFormProps {
  farmId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateBlockForm = ({ farmId, onSuccess, onCancel }: CreateBlockFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_bloco: '',
      area_acres: 0,
      area_m2: 0,
      produto_usado: '',
      quantidade_litros: 0,
      valor_produto: 0,
      data_plantio: '',
      data_aplicacao: '',
      data_colheita: '',
      proxima_colheita: '',
      proxima_aplicacao: '',
      cor: '#4CAF50',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const { error } = await supabase.from("blocos_fazenda").insert({
        nome_bloco: values.nome_bloco,
        area_acres: values.area_acres,
        area_m2: values.area_m2,
        produto_usado: values.produto_usado,
        quantidade_litros: values.quantidade_litros,
        valor_produto: values.valor_produto,
        data_plantio: values.data_plantio,
        data_aplicacao: values.data_aplicacao,
        data_colheita: values.data_colheita || null,
        proxima_colheita: values.proxima_colheita || null,
        proxima_aplicacao: values.proxima_aplicacao || null,
        cor: values.cor,
        fazenda_id: farmId,
      });

      if (error) throw error;

      toast({
        title: t("blocks.success"),
        description: t("blocks.blockCreated"),
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating block:", error);
      toast({
        title: t("common.error"),
        description: t("blocks.errorCreating"),
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-md"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BlockNameField />
            <BlockAreaFields />
            <BlockProductField />
            <BlockNumberField name="quantidade_litros" label="Quantidade (L)" />
            <BlockNumberField name="valor_produto" label="Valor do Produto" />
            <BlockDateField name="data_plantio" label="Data de Plantio" required />
            <BlockDateField name="data_aplicacao" label="Data da Aplicação" required />
            <BlockDateField name="data_colheita" label="Data da Colheita" />
            <BlockDateField name="proxima_colheita" label="Data da Próxima Colheita" />
            <BlockDateField name="proxima_aplicacao" label="Data da Próxima Aplicação" />
            <BlockColorField />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {t("blocks.saveBlock")}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};
