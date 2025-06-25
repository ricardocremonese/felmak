
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmployeeForm from "@/components/EmployeeForm";
import EmployeeList from "@/components/EmployeeList";
import { ChevronLeft, UserPlus, Search } from "lucide-react";
import { Employee } from "@/types";
import { useEmployees } from "@/hooks/useEmployees";

const EMPLOYEE_ROLES = [
  { value: "all", label: "Todos" },
  { value: "corretor", label: "Corretores" },
  { value: "financeiro", label: "Financeiro" },
  { value: "recepção", label: "Recepção" },
  { value: "jurídico", label: "Jurídico" },
  { value: "vendas", label: "Vendas" },
  { value: "locação", label: "Locação" },
  { value: "manutenção", label: "Manutenção" },
];

const EmployeeManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const {
    employees,
    fetchEmployees,
    addEmployee,
    editEmployee,
    deleteEmployee,
    loading,
    error,
  } = useEmployees();

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filtra os funcionários com base na busca e aba
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.personalEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.creciNumber && employee.creciNumber.includes(searchTerm)) ||
      employee.login.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      employee.role.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  const handleAddEditEmployee = async (employee: Employee) => {
    if (editingEmployee) {
      await editEmployee(employee);
    } else {
      await addEmployee(employee);
    }
    setIsFormOpen(false);
    setEditingEmployee(null);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    await deleteEmployee(id);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6 pt-16 md:p-8 md:pt-8 ml-0 lg:ml-64">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2" 
            onClick={() => navigate("/administration")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Funcionários</h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Buscar por nome, email, login ou CRECI..." 
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            className="w-full md:w-auto"
            onClick={() => {
              setEditingEmployee(null);
              setIsFormOpen(true);
            }}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Funcionário
          </Button>
        </div>

        <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
          <TabsList>
            {EMPLOYEE_ROLES.map(role => (
              <TabsTrigger key={role.value} value={role.value}>{role.label}</TabsTrigger>
            ))}
          </TabsList>
          {EMPLOYEE_ROLES.map(role => (
            <TabsContent key={role.value} value={role.value} className="mt-4">
              <EmployeeList 
                employees={filteredEmployees}
                onEdit={handleEditEmployee}
                onDelete={handleDeleteEmployee}
                loading={loading}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? 'Editar Funcionário' : 'Adicionar Novo Funcionário'}</DialogTitle>
          </DialogHeader>
          <EmployeeForm 
            onSubmit={handleAddEditEmployee} 
            employee={editingEmployee}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManagementPage;
