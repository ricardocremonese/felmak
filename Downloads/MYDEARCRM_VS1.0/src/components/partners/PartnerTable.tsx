
import React from "react";
import { Partner } from "@/types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Mail, Phone, Users, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PartnerTableProps {
  partners: Partner[];
  onEdit: (partner: Partner) => void;
  onDelete: (id: string) => void;
  formatCurrency: (value: number) => string;
}

const PartnerTable: React.FC<PartnerTableProps> = ({ partners, onEdit, onDelete, formatCurrency }) => (
  <div className="min-w-[800px]">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Especialização</TableHead>
          <TableHead>Total de Vendas</TableHead>
          <TableHead>Comissão Total</TableHead>
          <TableHead>Regiões</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {partners.map((partner) => (
          <TableRow key={partner.id}>
            <TableCell className="font-medium">
              <div className="flex flex-col">
                {partner.name}
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Mail className="h-3 w-3 mr-1" />
                  {partner.email}
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Phone className="h-3 w-3 mr-1" />
                  {partner.phone}
                </div>
                {partner.licenseNumber && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Users className="h-3 w-3 mr-1" />
                    {partner.partnerType === "Corretor" ? "CRECI: " : "CRECI-PJ: "}
                    {partner.licenseNumber}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>{partner.partnerType}</TableCell>
            <TableCell>{partner.specialization}</TableCell>
            <TableCell>{partner.totalSales}</TableCell>
            <TableCell>{formatCurrency(partner.totalCommission)}</TableCell>
            <TableCell>
              <div className="flex items-start gap-1 flex-wrap">
                {partner.regions.map((region, index) => (
                  <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {region}
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(partner)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(partner.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default PartnerTable;
