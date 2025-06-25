
import React, { useState } from "react";
import { useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from "@/components/Sidebar";
import { Property } from "@/types";
import { FileText, Download, FileImage, Plus, X } from "lucide-react";
import { properties } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";
import PDFPropertyTemplate from "@/components/PDFPropertyTemplate";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const GeneratePDF = () => {
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePropertySelect = (propertyId: string) => {
    const selectedProperty = properties.find((prop) => prop.id === propertyId);
    if (selectedProperty && !selectedProperties.some(p => p.id === propertyId)) {
      setSelectedProperties([...selectedProperties, selectedProperty]);
    }
  };

  const removeProperty = (propertyId: string) => {
    setSelectedProperties(selectedProperties.filter(prop => prop.id !== propertyId));
  };

  const handleGeneratePDF = async () => {
    if (selectedProperties.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um imóvel para gerar o PDF",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const html2canvas = await import('html2canvas').then(mod => mod.default);
      const jsPDFModule = await import('jspdf');
      
      if (pdfRef.current) {
        const jsPDF = jsPDFModule.default;
        // Create PDF with 25mm margins on all sides
        const pdf = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4',
          compress: true
        });
        
        // Set margins (25mm on all sides)
        const margin = 25; // 25mm margin
        const pageWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const contentWidth = pageWidth - (margin * 2);
        const contentHeight = pageHeight - (margin * 2);
        
        // Process each property one by one
        for (let i = 0; i < selectedProperties.length; i++) {
          const propertyElement = pdfRef.current.children[i] as HTMLElement;
          
          const canvas = await html2canvas(propertyElement, {
            scale: 2,
            useCORS: true,
            logging: false
          });
          
          // Calculate dimensions to maintain aspect ratio
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add new page for all properties except the first one
          if (i > 0) {
            pdf.addPage();
          }
          
          // Add image with proper margins
          const imgData = canvas.toDataURL('image/png');
          pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
          
          // If content overflows, create additional pages for this property
          let remainingHeight = imgHeight;
          let currentPosition = 0;
          
          while (remainingHeight > contentHeight) {
            currentPosition += contentHeight;
            remainingHeight -= contentHeight;
            
            pdf.addPage();
            pdf.addImage(
              imgData, 
              'PNG', 
              margin, // x position (25mm from left)
              margin - currentPosition, // y position (adjust for overflow)
              imgWidth, 
              imgHeight
            );
          }
        }
        
        // Generate a filename based on number of properties
        const filename = selectedProperties.length === 1 
          ? `imovel-${selectedProperties[0].title.replace(/\s+/g, '-').toLowerCase()}.pdf`
          : `imoveis-${selectedProperties.length}-unidades.pdf`;
        
        pdf.save(filename);
        
        toast({
          title: "PDF Gerado com Sucesso",
          description: `O PDF com ${selectedProperties.length} imóvel(is) foi gerado e está pronto para download.`,
        });
      }
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao Gerar PDF",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8 pt-20 lg:pl-72">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Selection Panel */}
            <Card className="w-full md:w-96">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-realEstate-blue" />
                  Gerar PDF de Imóvel
                </CardTitle>
                <CardDescription>
                  Selecione um ou mais imóveis para gerar um PDF completo com todos os detalhes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Selecione um Imóvel</label>
                    <Select onValueChange={handlePropertySelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um imóvel" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties
                          .filter(prop => !selectedProperties.some(p => p.id === prop.id))
                          .map((prop) => (
                            <SelectItem key={prop.id} value={prop.id}>
                              {prop.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedProperties.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Imóveis selecionados</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedProperties.map(property => (
                          <div 
                            key={property.id} 
                            className="flex items-center justify-between bg-gray-50 p-2 rounded-md text-sm"
                          >
                            <span className="truncate">{property.title}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeProperty(property.id)}
                              className="h-6 w-6"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  onClick={handleGeneratePDF} 
                  className="w-full" 
                  disabled={selectedProperties.length === 0 || loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span> Gerando PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" /> Gerar e Baixar PDF
                    </>
                  )}
                </Button>
                <div className="text-xs text-gray-500 text-center">
                  O PDF inclui todos os detalhes de cada imóvel, com margens adequadas para impressão.
                </div>
              </CardFooter>
            </Card>

            {/* Preview Panel */}
            <div className="flex-1">
              {selectedProperties.length > 0 ? (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">Prévia do PDF</h2>
                  <div className="border border-gray-200 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                    <div ref={pdfRef}>
                      {selectedProperties.map(property => (
                        <div key={property.id} className="mb-8 last:mb-0 page-break">
                          <PDFPropertyTemplate property={property} />
                          {/* Divider between properties */}
                          {selectedProperties.indexOf(property) < selectedProperties.length - 1 && (
                            <div className="border-b border-dashed border-gray-300 my-4"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                  <FileImage className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600">Selecione imóveis</h3>
                  <p className="text-gray-500 mt-2">
                    Selecione um ou mais imóveis para visualizar a prévia do PDF.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratePDF;
