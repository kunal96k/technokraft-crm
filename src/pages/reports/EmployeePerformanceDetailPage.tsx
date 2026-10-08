import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EmployeePerformanceDetailView } from '../../components/reports/EmployeePerformanceDetailView';
import { EmployeePerformanceRecord } from '../../types/reports';
import { fetchEmployeePerformanceById } from '../../services/reportService';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export const EmployeePerformanceDetailPage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [employee, setEmployee] = useState<EmployeePerformanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!employeeId) return;

    let isMounted = true;
    setIsLoading(true);

    fetchEmployeePerformanceById(employeeId)
      .then((res) => {
        if (isMounted && res) {
          setEmployee(res);
        }
      })
      .catch((err) => {
        console.error('Failed to load employee performance detail:', err);
        if (isMounted) {
          setEmployee(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [employeeId]);

  if (isLoading && !employee) {
    return (
      <div className="p-16 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Loader2 className="w-8 h-8 text-[#5B4DB7] animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Loading employee performance profile from CRM database...
        </p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Employee Record Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The requested sales performance record does not exist or has been archived.
        </p>
        <Link
          to="/reports/performance"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5B4DB7] text-white text-xs font-semibold rounded-lg hover:bg-[#4E41A2] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Performance Report</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <EmployeePerformanceDetailView employee={employee} isModal={false} />
    </div>
  );
};

