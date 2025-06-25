
import React, { useState, useRef } from "react";
import { KanbanColumn, Lead, LeadStatus } from "../types";
import LeadCard from "./LeadCard";
import { getColumnColor } from "../data/mockData";
import { Plus, AlignLeft, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KanbanBoardProps {
  columns: KanbanColumn[];
  leads: Lead[];
  onAddLead: () => void;
  onMoveCard: (leadId: string, newStatus: LeadStatus) => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (lead: Lead) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  columns, 
  leads, 
  onAddLead, 
  onMoveCard,
  onEditLead,
  onDeleteLead
}) => {
  const [draggingLeadId, setDraggingLeadId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggingLeadId(leadId);
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
    
    if (e.target instanceof HTMLElement) {
      setTimeout(() => {
        if (e.target instanceof HTMLElement) {
          e.target.style.opacity = "0.4";
        }
      }, 0);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggingLeadId(null);
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = "1";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, columnTitle: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    
    if (leadId && draggingLeadId) {
      const lead = leads.find(l => l.id === leadId);
      if (lead && lead.status !== columnTitle) {
        onMoveCard(leadId, columnTitle);
        toast({
          title: "Lead movido com sucesso",
          description: `${lead.name} foi movido para ${columnTitle}`,
          variant: "default",
        });
      }
    }
    
    setDraggingLeadId(null);
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const scrollSpeed = 10;
    
    if (e.clientX < containerRect.left + 50) {
      container.scrollLeft -= scrollSpeed;
    }
    
    if (e.clientX > containerRect.right - 50) {
      container.scrollLeft += scrollSpeed;
    }
  };

  return (
    <div 
      className="flex-1 overflow-x-auto" 
      ref={scrollContainerRef}
      onDragOver={handleColumnDragOver}
    >
      <div className="flex h-full p-4 space-x-4 min-w-fit pl-[calc(64px+16rem)]">
        {columns.map((column) => {
          const columnLeads = leads.filter(lead => 
            column.leadIds.includes(lead.id)
          );
          
          return (
            <div
              key={column.id}
              className={`flex flex-col w-[280px] shrink-0 rounded-lg ${getColumnColor(column.title)} border p-2`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.title)}
            >
              <div className="flex items-center justify-between mb-2 px-2">
                <h3 className="font-medium flex items-center">
                  <span 
                    className={`h-3 w-3 rounded-full mr-2 ${
                      column.title === "Novo Lead" ? "bg-blue-500" : 
                      column.title === "Contato Realizado" ? "bg-indigo-500" : 
                      column.title === "Visita Agendada" ? "bg-purple-500" : 
                      column.title === "Proposta Enviada" ? "bg-yellow-500" : 
                      column.title === "Negociação" ? "bg-orange-500" : 
                      column.title === "Fechado (Ganho)" ? "bg-green-500" : 
                      "bg-red-500"
                    }`} 
                  />
                  {column.title}
                </h3>
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {columnLeads.length}
                </span>
              </div>
              
              <div className="overflow-y-auto flex-1 px-2">
                {columnLeads.map(lead => (
                  <div key={lead.id} className="relative group">
                    <LeadCard 
                      lead={lead} 
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEditLead && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onEditLead(lead);
                          }}
                          className="bg-amber-500 text-white p-1 rounded-full hover:bg-amber-600"
                          title="Editar Lead"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                      )}
                      {onDeleteLead && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onDeleteLead(lead);
                          }}
                          className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          title="Excluir Lead"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {column.title === "Novo Lead" && (
                <button 
                  onClick={onAddLead}
                  className="mt-2 w-full py-2 bg-white/80 hover:bg-white border border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 text-sm transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Lead
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
