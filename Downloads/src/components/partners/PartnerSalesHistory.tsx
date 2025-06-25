
import React from "react";
import { Partner } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PartnerSalesHistoryProps {
  partners: Partner[];
  formatCurrency: (value: number) => string;
}

const PartnerSalesHistory: React.FC<PartnerSalesHistoryProps> = ({ partners, formatCurrency }) => (
  <div className="min-w-[800px]">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Imóvel</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Comissão Total (6%)</TableHead>
          <TableHead>Parceiros</TableHead>
          <TableHead>Comissão por Parceiro</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {partners.flatMap(partner =>
          partner.completedSales.map(sale => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">{sale.propertyTitle}</TableCell>
              <TableCell>{new Date(sale.date).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell>{formatCurrency(sale.propertyPrice)}</TableCell>
              <TableCell>{formatCurrency(sale.commission)}</TableCell>
              <TableCell>
                {sale.partners.map((partnerId) => {
                  const partnerInfo = partners.find(p => p.id === partnerId);
                  return partnerInfo ? partnerInfo.name : 'Desconhecido';
                }).join(', ')}
              </TableCell>
              <TableCell>{formatCurrency(sale.commissionPerPartner)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </div>
);

export default PartnerSalesHistory;
