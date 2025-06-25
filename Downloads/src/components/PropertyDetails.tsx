
import React from "react";
import { Property } from "../types";
import { Home, Ruler, Bed, Bath, Tag, MapPin } from "lucide-react";

interface PropertyDetailsProps {
  property: Property;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="relative h-40 mb-4 overflow-hidden rounded-md">
        <img
          src={property.images[0] || "/placeholder.svg"}
          alt={property.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute top-0 left-0 bg-realEstate-blue text-white px-2 py-1 text-xs font-medium rounded-br-md">
          {property.type}
        </div>
      </div>

      <h3 className="text-lg font-medium mb-2">{property.title}</h3>
      
      <div className="flex items-center text-gray-600 mb-2 text-sm">
        <MapPin className="h-4 w-4 mr-2" />
        <span>{property.address}, {property.city}</span>
      </div>
      
      <div className="text-xl font-bold text-realEstate-blue mb-4">
        {formatCurrency(property.price)}
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="border border-gray-200 rounded-md p-2 text-center">
          <Bed className="h-4 w-4 mx-auto mb-1" />
          <p className="text-sm font-medium">{property.bedrooms}</p>
          <p className="text-xs text-gray-500">Quartos</p>
        </div>
        <div className="border border-gray-200 rounded-md p-2 text-center">
          <Bath className="h-4 w-4 mx-auto mb-1" />
          <p className="text-sm font-medium">{property.bathrooms}</p>
          <p className="text-xs text-gray-500">Banheiros</p>
        </div>
        <div className="border border-gray-200 rounded-md p-2 text-center">
          <Ruler className="h-4 w-4 mx-auto mb-1" />
          <p className="text-sm font-medium">{property.squareMeters}</p>
          <p className="text-xs text-gray-500">m²</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        {property.description}
      </p>
      
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Contato do Proprietário Oculto</p>
          <button className="bg-realEstate-blue text-white text-sm px-3 py-1 rounded-md hover:bg-blue-700 transition-colors">
            Solicitar Informações
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
