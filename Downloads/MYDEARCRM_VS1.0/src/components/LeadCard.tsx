
import React from "react";
import { Lead } from "../types";
import { getStatusColor } from "../data/mockData";
import { Phone, Mail, Home, Calendar, DollarSign, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LeadCardProps {
  lead: Lead;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onDragStart, onDragEnd }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const propertyInfo = lead.propertyInterest 
      ? `\nInteresse: ${lead.propertyInterest.title} - ${formatCurrency(lead.propertyInterest.price)}` 
      : '';
    
    const message = `Informações do Lead:\nNome: ${lead.name}\nEmail: ${lead.email}\nTelefone: ${lead.phone}${propertyInfo}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onDragEnd={onDragEnd}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-3 cursor-grab hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium truncate">{lead.name}</h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleWhatsAppShare}
            className="text-green-600 hover:text-green-800 p-1"
            title="Compartilhar via WhatsApp"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12.043 21.806h-.004a9.866 9.866 0 01-5.032-1.378l-.36-.214-3.742.982.999-3.648-.236-.374a9.87 9.87 0 01-1.511-5.26c.003-5.45 4.437-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.884 9.884z" fill="none" stroke="currentColor"/>
            </svg>
          </button>
          <span
            className={`${getStatusColor(
              lead.status
            )} text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap`}
          >
            {lead.status}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <Mail className="h-4 w-4 mr-2" />
          <span className="truncate">{lead.email}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Phone className="h-4 w-4 mr-2" />
          <span>{lead.phone}</span>
        </div>

        {lead.propertyInterest && (
          <div className="mt-3 border-t pt-2">
            <div className="flex items-start mt-1">
              <Home className="h-4 w-4 mr-2 text-gray-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-800">{lead.propertyInterest.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {lead.propertyInterest.city}, {lead.propertyInterest.bedrooms} quartos, {lead.propertyInterest.bathrooms} banheiros
                </p>
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3 text-realEstate-blue" />
                  <p className="text-sm font-medium text-realEstate-blue">
                    {formatCurrency(lead.propertyInterest.price)}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lead.propertyInterest.transactionType || "Venda"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-2 border-t">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{formatDistanceToNow(new Date(lead.lastContactDate), { addSuffix: true })}</span>
          </div>
          <div className="flex items-center">
            <User className="h-3 w-3 mr-1" />
            <span className="bg-gray-100 px-2 py-1 rounded-md">{lead.assignedAgent}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
