import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { EmployeePerformanceDetailView } from '../../components/reports/EmployeePerformanceDetailView';
import { MOCK_EMPLOYEES } from '../../data/mockReports';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const EmployeePerformanceDetailPage: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();

  const employee =
    MOCK_EMPLOYEES.find((e) => e.id === employeeId) || MOCK_EMPLOYEES[0];

  if (!employee) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Employee Record Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested sales performance ID does not exist or has been archived.
        </p>
        <Link
          to="/reports/performance"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5B4DB7] text-white text-xs font-semibold rounded-lg"
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
