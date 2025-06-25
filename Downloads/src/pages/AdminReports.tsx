
import React, { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, DownloadIcon, RefreshCw, FileText, CheckCircle, AlertCircle, Users, DollarSign, Clock, Home, Building } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { jsPDF } from "jspdf";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const leadsByStatusData = [
  { name: "Novo Lead", value: 12, color: "#3b82f6" }, // blue
  { name: "Contato Realizado", value: 8, color: "#6366f1" }, // indigo
  { name: "Visita Agendada", value: 6, color: "#a855f7" }, // purple
  { name: "Proposta Enviada", value: 4, color: "#eab308" }, // yellow
  { name: "Negociação", value: 3, color: "#f97316" }, // orange
  { name: "Fechado (Ganho)", value: 5, color: "#22c55e" }, // green
  { name: "Perdido", value: 2, color: "#ef4444" }, // red
];

const leadsMonthlyData = [
  { name: "Jan", leads: 18 },
  { name: "Fev", leads: 22 },
  { name: "Mar", leads: 25 },
  { name: "Abr", leads: 30 },
  { name: "Mai", leads: 28 },
  { name: "Jun", leads: 35 },
  { name: "Jul", leads: 40 },
];

const mockReportData = {
  approvedProposals: {
    total: 28,
    value: 4850000,
  },
  leads: {
    total: 142,
    newLeads: 38,
    conversionRate: 19.7,
  },
  properties: {
    total: 76,
    forSale: 52,
    forRent: 24,
  },
  commissions: {
    total: 242500,
    pending: 78500,
    paid: 164000,
  },
  topAgents: [
    { name: "Ana Silva", approvedProposals: 8, value: 1450000, commission: 72500 },
    { name: "Carlos Oliveira", approvedProposals: 6, value: 980000, commission: 49000 },
    { name: "Mariana Santos", approvedProposals: 5, value: 850000, commission: 42500 },
    { name: "Roberto Almeida", approvedProposals: 5, value: 790000, commission: 39500 },
    { name: "Juliana Costa", approvedProposals: 4, value: 780000, commission: 39000 },
  ]
};

const AdminReports = () => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  const handleGenerateReport = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Relatório gerado com sucesso",
        description: "Os dados foram carregados para o período selecionado.",
        variant: "default",
      });
    }, 1500);
  };

  const generatePDF = () => {
    setIsGeneratingPDF(true);
    
    setTimeout(() => {
      try {
        const doc = new jsPDF({
          orientation: 'p',
          unit: 'mm',
          format: 'a4',
          compress: true
        });
        
        const margin = 25;
        const pageWidth = 210;
        const pageHeight = 297;
        const contentWidth = pageWidth - (margin * 2);
        
        const primaryColor = [43, 58, 103];
        const secondaryColor = [155, 135, 245];
        const accentColor = [34, 197, 94];
        const textColor = [30, 30, 30];
        const lightGrayColor = [100, 100, 100];
        
        let yPos = margin;
        
        // Center the logo on first page only
        doc.addImage("/lovable-uploads/a281e089-ceb2-4226-8a69-53b1d6f7d785.png", "PNG", pageWidth / 2 - 25, yPos, 50, 20);
        yPos += 25;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("Relatório Administrativo", pageWidth / 2, yPos, { align: "center" });
        yPos += 10;
        
        const dateRange = `Período: ${dateFrom ? format(dateFrom, "dd/MM/yyyy") : "N/A"} até ${dateTo ? format(dateTo, "dd/MM/yyyy") : "N/A"}`;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(dateRange, pageWidth / 2, yPos, { align: "center" });
        yPos += 15;
        
        doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("Resumo Geral", margin, yPos);
        yPos += 8;
        
        doc.setFillColor(245, 247, 250);
        doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'F');
        yPos += 8;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        
        const col1X = margin + 10;
        const col2X = margin + contentWidth/2 + 10;
        
        doc.setFont("helvetica", "bold");
        doc.text("Propostas Aprovadas:", col1X, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${mockReportData.approvedProposals.total}`, col1X + 45, yPos);
        
        doc.setFont("helvetica", "bold");
        doc.text("Leads Cadastrados:", col2X, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${mockReportData.leads.total}`, col2X + 45, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "bold");
        doc.text("Valor Total:", col1X, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${formatCurrency(mockReportData.approvedProposals.value)}`, col1X + 45, yPos);
        
        doc.setFont("helvetica", "bold");
        doc.text("Taxa de Conversão:", col2X, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${mockReportData.leads.conversionRate}%`, col2X + 45, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "bold");
        doc.text("Comissões Totais:", col1X, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${formatCurrency(mockReportData.commissions.total)}`, col1X + 45, yPos);
        
        doc.setFont("helvetica", "bold");
        doc.text("Imóveis Cadastrados:", col2X, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(`${mockReportData.properties.total}`, col2X + 45, yPos);
        
        yPos += 20;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("Ranking de Corretores", margin, yPos);
        yPos += 8;
        
        let tableTop = yPos;
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(margin, yPos, contentWidth, 8, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text("Corretor", margin + 5, yPos + 5.5);
        doc.text("Propostas", margin + contentWidth * 0.4, yPos + 5.5);
        doc.text("Valor Total", margin + contentWidth * 0.6, yPos + 5.5);
        doc.text("Comissão", margin + contentWidth * 0.8, yPos + 5.5);
        yPos += 8;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        
        mockReportData.topAgents.forEach((agent, index) => {
          if (index % 2 === 0) {
            doc.setFillColor(245, 247, 250);
            doc.rect(margin, yPos, contentWidth, 8, 'F');
          }
          
          doc.text(agent.name, margin + 5, yPos + 5.5);
          doc.text(agent.approvedProposals.toString(), margin + contentWidth * 0.4, yPos + 5.5);
          doc.text(formatCurrency(agent.value), margin + contentWidth * 0.6, yPos + 5.5);
          doc.text(formatCurrency(agent.commission), margin + contentWidth * 0.8, yPos + 5.5);
          yPos += 8;
          
          if (yPos > (pageHeight - margin - 20) && index < mockReportData.topAgents.length - 1) {
            doc.setDrawColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
            doc.setLineWidth(0.3);
            doc.rect(margin, tableTop, contentWidth, yPos - tableTop, 'S');
            
            doc.setFontSize(8);
            doc.setTextColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
            doc.text(`Página 1 de 2`, pageWidth - margin, pageHeight - 10, { align: 'right' });
            
            doc.addPage();
            
            yPos = margin;
            
            // No logo on continuation pages
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.text("Relatório Administrativo", pageWidth / 2, yPos, { align: "center" });
            yPos += 8;
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
            doc.text(dateRange, pageWidth / 2, yPos, { align: "center" });
            
            yPos += 20;
            doc.setDrawColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
            doc.setLineWidth(0.3);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.text("Ranking de Corretores (Continuação)", margin, yPos);
            yPos += 8;
            
            let newTableTop = yPos;
            doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.rect(margin, yPos, contentWidth, 8, 'F');
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(10);
            doc.text("Corretor", margin + 5, yPos + 5.5);
            doc.text("Propostas", margin + contentWidth * 0.4, yPos + 5.5);
            doc.text("Valor Total", margin + contentWidth * 0.6, yPos + 5.5);
            doc.text("Comissão", margin + contentWidth * 0.8, yPos + 5.5);
            yPos += 8;
            
            tableTop = newTableTop;
          }
        });
        
        doc.setDrawColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
        doc.setLineWidth(0.3);
        doc.rect(margin, tableTop, contentWidth, yPos - tableTop, 'S');
        
        if (yPos > (pageHeight - margin - 100)) {
          doc.setFontSize(8);
          doc.setTextColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
          doc.text(`Página 2 de 3`, pageWidth - margin, pageHeight - 10, { align: 'right' });
          
          doc.addPage();
          yPos = margin;
          
          // No logo on additional pages
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.text("Relatório Administrativo", pageWidth / 2, yPos, { align: "center" });
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
          doc.text(dateRange, pageWidth / 2, yPos + 8, { align: "center" });
          
          yPos += 20;
          doc.setDrawColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
          doc.setLineWidth(0.3);
          doc.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 10;
        } else {
          yPos += 15;
        }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("Análise Gráfica", margin, yPos);
        yPos += 15;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text("Distribuição de Leads por Status", margin, yPos);
        yPos += 8;

        let statusTableStart = yPos;
        
        leadsByStatusData.forEach((item, index) => {
          const hexColor = item.color.replace("#", "");
          const r = parseInt(hexColor.substring(0, 2), 16);
          const g = parseInt(hexColor.substring(2, 4), 16);
          const b = parseInt(hexColor.substring(4, 6), 16);
          doc.setFillColor(r, g, b);
          doc.rect(margin, yPos, 5, 5, 'F');
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          const percentage = ((item.value / leadsByStatusData.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(1);
          doc.text(`${item.name}: ${item.value} leads (${percentage}%)`, margin + 10, yPos + 4);
          yPos += 8;
        });
        
        doc.setDrawColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
        doc.setLineWidth(0.3);
        doc.rect(margin, statusTableStart - 4, contentWidth, yPos - statusTableStart + 4, 'S');
        
        yPos += 10;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text("Evolução Mensal de Leads", margin, yPos);
        yPos += 8;
        
        let monthlyTableStart = yPos;
        
        leadsMonthlyData.forEach((item, index) => {
          if (index % 2 === 0) {
            doc.setFillColor(245, 247, 250);
            doc.rect(margin, yPos, contentWidth, 8, 'F');
          }
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          doc.text(`${item.name}`, margin + 10, yPos + 5);
          doc.text(`${item.leads} leads`, margin + 50, yPos + 5);
          
          const maxLeads = Math.max(...leadsMonthlyData.map(item => item.leads));
          const barWidth = (item.leads / maxLeads) * (contentWidth - 120);
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.rect(margin + 80, yPos + 1, barWidth, 6, 'F');
          
          yPos += 8;
        });
        
        doc.setDrawColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
        doc.setLineWidth(0.3);
        doc.rect(margin, monthlyTableStart - 4, contentWidth, yPos - monthlyTableStart + 4, 'S');
        
        const currentPage = doc.getNumberOfPages();
        for (let i = 1; i <= currentPage; i++) {
          doc.setPage(i);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
          doc.text(`Página ${i} de ${currentPage}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
          
          if (i === currentPage) {
            doc.text(`Relatório gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, margin, pageHeight - 10);
          }
        }
        
        const pdfName = `mydear-crm-relatorio-${format(new Date(), "dd-MM-yyyy")}.pdf`;
        doc.save(pdfName);
        
        toast({
          title: "PDF gerado com sucesso",
          description: "O relatório foi baixado para o seu dispositivo.",
          variant: "default",
        });
      } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        toast({
          title: "Erro ao gerar PDF",
          description: "Ocorreu um erro ao tentar gerar o relatório em PDF.",
          variant: "destructive",
        });
      } finally {
        setIsGeneratingPDF(false);
      }
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6 pt-16 md:p-8 md:pt-8 ml-0 lg:ml-64" ref={reportRef}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Administrativos</h1>
          <p className="text-gray-600 mt-2">
            Visualize dados importantes da imobiliária em um período específico
          </p>
        </div>

        <Card className="mb-8 border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle>Filtrar por Período</CardTitle>
            <CardDescription>Selecione o intervalo de datas para o relatório</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Inicial</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "dd/MM/yyyy") : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                      disabled={(date) => date > new Date() || (dateTo ? date > dateTo : false)}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Final</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "dd/MM/yyyy") : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      disabled={(date) => date > new Date() || (dateFrom ? date < dateFrom : false)}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  onClick={handleGenerateReport}
                  disabled={isLoading || !dateFrom || !dateTo}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Gerar Relatório
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={generatePDF}
                  disabled={isGeneratingPDF || isLoading}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  {isGeneratingPDF ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Gerando PDF...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Baixar em PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-white to-blue-50 border-none shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Propostas Aprovadas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{mockReportData.approvedProposals.total}</div>
              <div className="mt-1 text-lg font-medium">{formatCurrency(mockReportData.approvedProposals.value)}</div>
              <div className="text-sm text-gray-500 mt-1">Valor total</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white to-indigo-50 border-none shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <CardTitle className="text-lg">Leads Cadastrados</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-600">{mockReportData.leads.total}</div>
              <div className="mt-1">
                <span className="text-sm font-medium text-gray-600">Novos: </span>
                <span className="text-lg font-medium">{mockReportData.leads.newLeads}</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Taxa de conversão: {mockReportData.leads.conversionRate}%
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white to-purple-50 border-none shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Building className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Imóveis Cadastrados</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{mockReportData.properties.total}</div>
              <div className="mt-1">
                <span className="text-sm font-medium text-gray-600">Venda: </span>
                <span className="text-lg font-medium">{mockReportData.properties.forSale}</span>
              </div>
              <div className="mt-1">
                <span className="text-sm font-medium text-gray-600">Locação: </span>
                <span className="text-lg font-medium">{mockReportData.properties.forRent}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-white to-green-50 border-none shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-full">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg">Comissões</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{formatCurrency(mockReportData.commissions.total)}</div>
              <div className="mt-1">
                <span className="text-sm font-medium text-gray-600">Pagas: </span>
                <span className="text-lg font-medium">{formatCurrency(mockReportData.commissions.paid)}</span>
              </div>
              <div className="mt-1">
                <span className="text-sm font-medium text-gray-600">Pendentes: </span>
                <span className="text-lg font-medium">{formatCurrency(mockReportData.commissions.pending)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle>Leads por Status</CardTitle>
              <CardDescription>Distribuição atual de leads por etapa do funil</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadsByStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                      {leadsByStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value} leads`, 'Quantidade']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
              <CardTitle>Leads por Mês</CardTitle>
              <CardDescription>Evolução mensal da captação de leads</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={leadsMonthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [`${value} leads`, 'Quantidade']} />
                    <Bar dataKey="leads" fill="#3b82f6" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-lg mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Corretores com Melhor Desempenho</CardTitle>
                <CardDescription>
                  Classificação por número de propostas aprovadas
                </CardDescription>
              </div>
              <Button variant="outline" onClick={generatePDF} disabled={isGeneratingPDF} className="border-blue-600 text-blue-600 hover:bg-blue-50">
                {isGeneratingPDF ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <DownloadIcon className="h-4 w-4 mr-2" />
                )}
                Baixar Relatório
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Corretor</TableHead>
                  <TableHead className="text-right font-semibold">Propostas Aprovadas</TableHead>
                  <TableHead className="text-right font-semibold">Valor Total</TableHead>
                  <TableHead className="text-right font-semibold">Comissão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReportData.topAgents.map((agent, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <TableCell className="font-medium">{agent.name}</TableCell>
                    <TableCell className="text-right">{agent.approvedProposals}</TableCell>
                    <TableCell className="text-right">{formatCurrency(agent.value)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(agent.commission)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReports;
