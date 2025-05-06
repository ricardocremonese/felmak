import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mockApplications, mockFarms, mockBlocks } from '@/data/mockData';
import { Application, Farm, Block } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Applications = () => {
  const { t } = useTranslation();
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [selectedFarm, setSelectedFarm] = useState<string>('');
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<Application | null>(null);
  const [formData, setFormData] = useState({
    farmId: '',
    blockId: '',
    productName: '',
    applicationDate: '',
    nextApplicationDate: '',
    litersApplied: '',
    productValue: '',
  });

  // Filter applications based on selected farm and block
  const filteredApplications = applications.filter((application) => {
    if (selectedFarm && application.farmId !== selectedFarm) {
      return false;
    }
    if (selectedBlock && application.blockId !== selectedBlock) {
      return false;
    }
    return true;
  });

  // Get blocks for selected farm
  const blocksForFarm = selectedFarm
    ? mockBlocks.filter((block) => block.fazenda_id === selectedFarm)
    : [];

  const handleCreateApplication = () => {
    setFormData({
      farmId: selectedFarm,
      blockId: selectedBlock,
      productName: '',
      applicationDate: '',
      nextApplicationDate: '',
      litersApplied: '',
      productValue: '',
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditApplication = (application: Application) => {
    setCurrentApplication(application);
    setFormData({
      farmId: application.farmId,
      blockId: application.blockId,
      productName: application.productName,
      applicationDate: application.applicationDate ? application.applicationDate.substring(0, 10) : '',
      nextApplicationDate: application.nextApplicationDate ? application.nextApplicationDate.substring(0, 10) : '',
      litersApplied: application.litersApplied.toString(),
      productValue: application.productValue.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteApplication = (applicationId: string) => {
    setApplications(applications.filter((app) => app.id !== applicationId));
    toast({
      title: t('applications.applicationDeleted'),
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'farmId') {
      // Reset blockId when farmId changes
      setFormData((prev) => ({ ...prev, farmId: value, blockId: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFarmFilter = (value: string) => {
    setSelectedFarm(value);
    setSelectedBlock(''); // Reset block filter when farm changes
  };

  const handleBlockFilter = (value: string) => {
    setSelectedBlock(value);
  };

  const handleSaveApplication = () => {
    const {
      farmId,
      blockId,
      productName,
      applicationDate,
      nextApplicationDate,
      litersApplied,
      productValue,
    } = formData;

    if (
      !farmId ||
      !blockId ||
      !productName ||
      !applicationDate ||
      !nextApplicationDate ||
      !litersApplied ||
      !productValue
    ) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    // Convert dates to ISO format
    const formattedApplicationDate = new Date(applicationDate).toISOString();
    const formattedNextApplicationDate = new Date(nextApplicationDate).toISOString();

    if (isCreateDialogOpen) {
      // Create new application
      const newApplication: Application = {
        id: `${applications.length + 1}`,
        farmId,
        blockId,
        productName,
        applicationDate: formattedApplicationDate,
        nextApplicationDate: formattedNextApplicationDate,
        litersApplied: parseFloat(litersApplied),
        productValue: parseFloat(productValue),
        createdAt: new Date().toISOString(),
      };

      setApplications([...applications, newApplication]);
      toast({
        title: t('applications.applicationCreated'),
      });
      setIsCreateDialogOpen(false);
    } else if (isEditDialogOpen && currentApplication) {
      // Update existing application
      const updatedApplications = applications.map((app) =>
        app.id === currentApplication.id
          ? {
              ...app,
              farmId,
              blockId,
              productName,
              applicationDate: formattedApplicationDate,
              nextApplicationDate: formattedNextApplicationDate,
              litersApplied: parseFloat(litersApplied),
              productValue: parseFloat(productValue),
            }
          : app
      );

      setApplications(updatedApplications);
      toast({
        title: t('applications.applicationUpdated'),
      });
      setIsEditDialogOpen(false);
    }
  };

  // Helper functions to get names
  const getFarmName = (farmId: string): string => {
    const farm = mockFarms.find((farm) => farm.id === farmId);
    return farm ? farm.name : '';
  };

  const getBlockName = (blockId: string): string => {
    const block = mockBlocks.find((block) => block.id === blockId);
    return block ? block.nome_bloco : '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">{t('applications.title')}</h1>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedFarm} onValueChange={handleFarmFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('applications.selectFarm')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('common.all')}</SelectItem>
                {mockFarms.map((farm) => (
                  <SelectItem key={farm.id} value={farm.id}>
                    {farm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedBlock}
              onValueChange={handleBlockFilter}
              disabled={!selectedFarm}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('applications.selectBlock')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('common.all')}</SelectItem>
                {blocksForFarm.map((block) => (
                  <SelectItem key={block.id} value={block.id}>
                    {block.nome_bloco}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCreateApplication}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t('applications.addApplication')}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('applications.productName')}</TableHead>
              <TableHead>{t('farms.title')}</TableHead>
              <TableHead>{t('blocks.title')}</TableHead>
              <TableHead>{t('applications.applicationDate')}</TableHead>
              <TableHead>{t('applications.nextApplicationDate')}</TableHead>
              <TableHead>{t('applications.appliedLiters')}</TableHead>
              <TableHead>{t('applications.productValue')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <motion.tr
                  key={application.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="transition-all hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    {application.productName}
                  </TableCell>
                  <TableCell>{getFarmName(application.farmId)}</TableCell>
                  <TableCell>{getBlockName(application.blockId)}</TableCell>
                  <TableCell>
                    {new Date(application.applicationDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(application.nextApplicationDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{application.litersApplied} L</TableCell>
                  <TableCell>${application.productValue.toFixed(2)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditApplication(application)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteApplication(application.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {t('common.noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Application Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('applications.createApplication')}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="farmId">{t('farms.title')}</Label>
              <Select
                value={formData.farmId}
                onValueChange={(value) => handleSelectChange('farmId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('applications.selectFarm')} />
                </SelectTrigger>
                <SelectContent>
                  {mockFarms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id}>
                      {farm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blockId">{t('blocks.title')}</Label>
              <Select
                value={formData.blockId}
                onValueChange={(value) => handleSelectChange('blockId', value)}
                disabled={!formData.farmId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('applications.selectBlock')} />
                </SelectTrigger>
                <SelectContent>
                  {mockBlocks
                    .filter((block) => block.fazenda_id === formData.farmId)
                    .map((block) => (
                      <SelectItem key={block.id} value={block.id}>
                        {block.nome_bloco}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="productName">{t('applications.productName')}</Label>
              <Input
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicationDate">{t('applications.applicationDate')}</Label>
              <Input
                id="applicationDate"
                name="applicationDate"
                type="date"
                value={formData.applicationDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextApplicationDate">{t('applications.nextApplicationDate')}</Label>
              <Input
                id="nextApplicationDate"
                name="nextApplicationDate"
                type="date"
                value={formData.nextApplicationDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="litersApplied">{t('applications.appliedLiters')}</Label>
              <Input
                id="litersApplied"
                name="litersApplied"
                type="number"
                value={formData.litersApplied}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productValue">{t('applications.productValue')} ($)</Label>
              <Input
                id="productValue"
                name="productValue"
                type="number"
                value={formData.productValue}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveApplication}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Application Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('applications.editApplication')}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="farmId">{t('farms.title')}</Label>
              <Select
                value={formData.farmId}
                onValueChange={(value) => handleSelectChange('farmId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('applications.selectFarm')} />
                </SelectTrigger>
                <SelectContent>
                  {mockFarms.map((farm) => (
                    <SelectItem key={farm.id} value={farm.id}>
                      {farm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="blockId">{t('blocks.title')}</Label>
              <Select
                value={formData.blockId}
                onValueChange={(value) => handleSelectChange('blockId', value)}
                disabled={!formData.farmId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('applications.selectBlock')} />
                </SelectTrigger>
                <SelectContent>
                  {mockBlocks
                    .filter((block) => block.fazenda_id === formData.farmId)
                    .map((block) => (
                      <SelectItem key={block.id} value={block.id}>
                        {block.nome_bloco}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="productName">{t('applications.productName')}</Label>
              <Input
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicationDate">{t('applications.applicationDate')}</Label>
              <Input
                id="applicationDate"
                name="applicationDate"
                type="date"
                value={formData.applicationDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextApplicationDate">{t('applications.nextApplicationDate')}</Label>
              <Input
                id="nextApplicationDate"
                name="nextApplicationDate"
                type="date"
                value={formData.nextApplicationDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="litersApplied">{t('applications.appliedLiters')}</Label>
              <Input
                id="litersApplied"
                name="litersApplied"
                type="number"
                value={formData.litersApplied}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productValue">{t('applications.productValue')} ($)</Label>
              <Input
                id="productValue"
                name="productValue"
                type="number"
                value={formData.productValue}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveApplication}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;
