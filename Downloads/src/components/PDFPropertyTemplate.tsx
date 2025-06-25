
import React from "react";
import { Property } from "@/types";
import { Bed, Bath, Ruler, MapPin, Home, DollarSign, Calendar } from "lucide-react";

interface PDFPropertyTemplateProps {
  property: Property;
}

const PDFPropertyTemplate: React.FC<PDFPropertyTemplateProps> = ({ property }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="font-sans text-gray-800 max-w-full text-xs">
      {/* Cabeçalho com Logo - sempre presente */}
      <div className="p-2 text-center border-b border-gray-100">
        <img 
          src="/lovable-uploads/de09eb36-aec8-4470-ad20-b73f7384abf9.png" 
          alt="MyDear CRM Logo" 
          className="h-8 object-contain mx-auto" 
        />
        <p className="text-[10px] text-gray-500">O jeito inteligente de vender imóveis</p>
      </div>

      {/* Informações do Imóvel - movidas para cima */}
      <div className="mt-2 mb-2 px-3">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-sm font-medium text-gray-700">{property.title}</h2>
            <div className="flex items-center text-[10px] text-gray-500">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{property.address}, {property.city}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800">{formatCurrency(property.price)}</p>
            <p className="text-[10px] text-gray-500">Código: {property.id}</p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-md p-2 mb-2">
          <div className="grid grid-cols-4 gap-1">
            <div className="text-center">
              <Home className="h-3 w-3 mx-auto mb-0.5 text-gray-600" />
              <p className="text-[10px] mb-0.5">Tipo</p>
              <p className="text-[10px] font-medium">{property.type}</p>
            </div>
            <div className="text-center">
              <Ruler className="h-3 w-3 mx-auto mb-0.5 text-gray-600" />
              <p className="text-[10px] mb-0.5">Área</p>
              <p className="text-[10px] font-medium">{property.squareMeters} m²</p>
            </div>
            <div className="text-center">
              <Bed className="h-3 w-3 mx-auto mb-0.5 text-gray-600" />
              <p className="text-[10px] mb-0.5">Quartos</p>
              <p className="text-[10px] font-medium">{property.bedrooms}</p>
            </div>
            <div className="text-center">
              <Bath className="h-3 w-3 mx-auto mb-0.5 text-gray-600" />
              <p className="text-[10px] mb-0.5">Banheiros</p>
              <p className="text-[10px] font-medium">{property.bathrooms || 1}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Galeria de Fotos - ajustada para menor quantidade e melhor aproveitamento */}
      <div className="mb-2 px-3">
        <p className="text-[11px] font-medium mb-1">Fotos</p>
        
        {property.images && property.images.length > 0 && (
          <div className="grid grid-cols-2 gap-1">
            {property.images.slice(0, 2).map((image, index) => (
              <div key={index} className="h-20 rounded overflow-hidden">
                <img
                  src={image}
                  alt={`${property.title} - Imagem ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Descrição - ainda mais compacta */}
      <div className="px-3 mb-3">
        <p className="text-[11px] font-medium mb-1">Descrição</p>
        <p className="text-[10px] text-gray-700 mb-2 leading-tight">
          {property.description && property.description.length > 250 
            ? `${property.description.substring(0, 250)}...` 
            : property.description}
        </p>
      </div>

      {/* Informações do Corretor */}
      <div className="bg-gray-50 p-2 rounded mx-3 mb-2">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
            <span className="text-[9px] font-bold text-gray-500">JD</span>
          </div>
          <div>
            <p className="text-[10px] font-medium">João da Silva</p>
            <p className="text-[9px] text-gray-600">CRECI: 123456-F | (11) 98765-4321</p>
          </div>
        </div>
      </div>

      {/* Rodapé mais compacto */}
      <div className="mt-auto border-t text-center px-3">
        <p className="text-[8px] text-gray-500 my-1">
          Este documento é uma apresentação do imóvel e não constitui parte de contrato.
        </p>
        <div className="flex justify-center items-center">
          <img 
            src="/lovable-uploads/de09eb36-aec8-4470-ad20-b73f7384abf9.png" 
            alt="MyDear CRM Logo" 
            className="h-3 object-contain" 
          />
          <p className="ml-1 text-[8px] font-medium text-gray-600">My Dear CRM</p>
        </div>
        <p className="text-[8px] text-gray-400">Data: {formatDate()}</p>
      </div>
    </div>
  );
};

export default PDFPropertyTemplate;
