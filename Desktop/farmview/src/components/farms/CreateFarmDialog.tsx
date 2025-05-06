
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FarmFormFields } from './form/FarmFormFields';
import { useFarmForm } from './hooks/useFarmForm';
import type { CreateFarmDialogProps } from './types/farmForm';
import { BlockNameField } from '../blocks/form/BlockNameField';
import { BlockAreaFields } from '../blocks/form/BlockAreaFields';
import { BlockProductField } from '../blocks/form/BlockProductField';
import { BlockNumberField } from '../blocks/form/BlockNumberField';
import { BlockDateField } from '../blocks/form/BlockDateField';
import { BlockColorField } from '../blocks/form/BlockColorField';
import { Form } from '@/components/ui/form';

export const CreateFarmDialog = ({ isOpen, onClose, onFarmCreated }: CreateFarmDialogProps) => {
  const { t } = useTranslation();
  const {
    form,
    formData,
    isSubmitting,
    handleInputChange,
    handleSelectChange,
    handleLocationSelect,
    handleZipCodeSelect,
    handleSave,
    resetForm
  } = useFarmForm(onFarmCreated);

  const handleDialogClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('farms.createFarm')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">{t('farms.farmDetails')}</h3>
                <FarmFormFields
                  formData={formData}
                  onInputChange={handleInputChange}
                  onSelectChange={handleSelectChange}
                  onLocationSelect={handleLocationSelect}
                  onZipCodeSelect={handleZipCodeSelect}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">{t('blocks.blockDetails')}</h3>
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
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={handleDialogClose} disabled={isSubmitting}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('common.saving') : t('common.save')}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
