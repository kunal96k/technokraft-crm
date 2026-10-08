import { useState, useEffect, useCallback } from 'react';
import { Employee } from '../types/employees';
import { fetchActiveEmployees } from '../services/employeeService';

export function useActiveEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchActiveEmployees();
      setEmployees(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch active employees');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const handleUpdate = () => {
      load();
    };
    window.addEventListener('crm-employees-updated', handleUpdate);
    return () => {
      window.removeEventListener('crm-employees-updated', handleUpdate);
    };
  }, [load]);

  return { employees, isLoading, error, refreshEmployees: load };
}
