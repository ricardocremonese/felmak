
import React from "react";
import { Employee } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onEdit, onDelete, loading }) => {
  if (loading) {
    return <div className="text-center py-10">Carregando funcionários...</div>;
  }
  if (employees.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-lg border">
        <p className="text-gray-500">Nenhum funcionário encontrado.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {employees.map((employee) => (
        <Card key={employee.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="flex items-start p-4">
              <img 
                src={employee.photoUrl || "/placeholder.svg"} 
                alt={employee.fullName}
                className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-gray-200"
              />
              <div className="flex-1">
                <h3 className="text-lg font-medium truncate">{employee.fullName}</h3>
                <p className="text-sm text-gray-500">{employee.role}</p>
                <div className="mt-1 space-y-1">
                  <p className="text-sm">{employee.cellPhone}</p>
                  <p className="text-sm truncate">{employee.personalEmail}</p>
                  <p className="text-sm truncate">Login: {employee.login}</p>
                  {employee.creciNumber && (
                    <p className="text-sm">CRECI: {employee.creciNumber}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="border-t flex">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 rounded-none py-2 h-10 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={() => onEdit(employee)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <div className="w-px bg-gray-200" />
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 rounded-none py-2 h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(employee.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EmployeeList;
