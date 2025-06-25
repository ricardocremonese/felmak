
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Employee, EmployeeRole } from "@/types";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Utilitário para mapear os dados do banco para o Employee do front
  function mapEmployeeFromDb(e: any): Employee {
    return {
      id: e.id,
      fullName: e.full_name,
      role: (e.role as EmployeeRole) ?? "Corretor",
      cellPhone: e.cell_phone,
      personalEmail: e.personal_email,
      photoUrl: e.photo_url ?? "",
      creciNumber: e.creci_number ?? "",
      hireDate: e.hire_date,
      supervisor: typeof e.supervisor === "string" ? e.supervisor : "",
      login: e.login,
      password: e.password,
    }
  }

  // Carrega todos os funcionários
  async function fetchEmployees() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*");
      if (error) throw error;
      setEmployees(
        (data ?? []).map(mapEmployeeFromDb)
      );
    } catch (err: any) {
      setError(err.message);
      console.error("Erro ao buscar funcionários:", err);
    } finally {
      setLoading(false);
    }
  }

  // Adiciona um funcionário
  async function addEmployee(employee: Employee) {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from("employees").insert([
        {
          full_name: employee.fullName,
          role: employee.role,
          cell_phone: employee.cellPhone,
          personal_email: employee.personalEmail,
          photo_url: employee.photoUrl,
          creci_number: employee.creciNumber,
          hire_date: employee.hireDate,
          supervisor: employee.supervisor,
          login: employee.login,
          password: employee.password,
        }
      ]);
      if (error) throw error;
      await fetchEmployees();
    } catch (err: any) {
      setError(err.message);
      console.error("Erro ao adicionar funcionário:", err);
    } finally {
      setLoading(false);
    }
  }

  // Edita um funcionário
  async function editEmployee(employee: Employee) {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("employees")
        .update({
          full_name: employee.fullName,
          role: employee.role,
          cell_phone: employee.cellPhone,
          personal_email: employee.personalEmail,
          photo_url: employee.photoUrl,
          creci_number: employee.creciNumber,
          hire_date: employee.hireDate,
          supervisor: employee.supervisor,
          login: employee.login,
          password: employee.password,
        })
        .eq("id", employee.id);
      
      if (error) throw error;
      await fetchEmployees();
    } catch (err: any) {
      setError(err.message);
      console.error("Erro ao editar funcionário:", err);
    } finally {
      setLoading(false);
    }
  }

  // Remove funcionário
  async function deleteEmployee(id: string) {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      await fetchEmployees();
    } catch (err: any) {
      setError(err.message);
      console.error("Erro ao excluir funcionário:", err);
    } finally {
      setLoading(false);
    }
  }

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
    editEmployee,
    deleteEmployee,
  };
}
