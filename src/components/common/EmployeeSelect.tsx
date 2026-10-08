import React from 'react';
import { useActiveEmployees } from '../../hooks/useActiveEmployees';

export interface EmployeeSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'onChange'> {
  value?: any;
  onChange: (e: React.ChangeEvent<HTMLSelectElement> | string) => void;
  placeholder?: string;
  showAllOption?: string;
  valueField?: 'name' | 'id' | 'employeeCode' | string;
  allowEmpty?: boolean;
  roleFilter?: string;
  departmentFilter?: string;
  customOptions?: Array<{ value: string; label: string }>;
  showRoleInLabel?: boolean;
}

export const EmployeeSelect: React.FC<EmployeeSelectProps> = ({
  value = '',
  onChange,
  placeholder = 'Select Employee',
  showAllOption,
  valueField = 'name',
  allowEmpty = true,
  roleFilter,
  departmentFilter,
  customOptions = [],
  showRoleInLabel = true,
  className = '',
  disabled,
  ...props
}) => {
  const { employees, isLoading } = useActiveEmployees();

  // Normalize value to a string safely and prevent [object Object] leaks
  let rawValue = '';
  const anyVal = value as any;
  if (typeof anyVal === 'string') {
    rawValue = anyVal;
  } else if (anyVal && typeof anyVal === 'object') {
    if (anyVal.target && typeof anyVal.target === 'object' && 'value' in anyVal.target) {
      rawValue = String(anyVal.target.value || '');
    } else if (typeof anyVal.name === 'string') {
      rawValue = anyVal.name;
    } else if (anyVal.id != null) {
      rawValue = String(anyVal.id);
    }
  } else if (anyVal != null && typeof anyVal !== 'function') {
    rawValue = String(anyVal);
  }

  if (rawValue === '[object Object]') {
    rawValue = '';
  }
  const trimmedValue = rawValue.trim();

  // Effective placeholder text (support showAllOption alias)
  const defaultLabel = showAllOption || placeholder;

  // Filter active employees if role or department filter is passed
  const filteredEmployees = employees.filter((emp) => {
    if (roleFilter && emp.role !== roleFilter && emp.accessRole !== roleFilter) return false;
    if (departmentFilter && emp.department !== departmentFilter) return false;
    return true;
  });

  const getOptionValue = (emp: (typeof employees)[0]): string => {
    if (valueField === 'id') return String(emp.id);
    if (valueField === 'employeeCode') return emp.employeeCode || String(emp.id);
    return emp.name;
  };

  // If a value is provided but not in the active filtered list, keep it visible so it is not lost
  const isValueInList =
    !trimmedValue ||
    filteredEmployees.some((e) => getOptionValue(e) === trimmedValue || e.name === trimmedValue);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const strVal = e.target.value;
    // Provide a safe, non-circular synthetic event object that seamlessly works
    // whether the consumer expects e.target.value or raw string value
    const safeEvent: any = {
      target: {
        value: strVal,
        name: (props as any).name || '',
      },
      currentTarget: {
        value: strVal,
      },
      value: strVal,
      toString: () => strVal,
      valueOf: () => strVal,
      toJSON: () => strVal,
      [Symbol.toPrimitive]: () => strVal,
    };
    onChange(safeEvent);
  };

  return (
    <select
      value={trimmedValue}
      onChange={handleChange}
      disabled={disabled || isLoading}
      className={className}
      {...props}
    >
      {allowEmpty && <option value="">{defaultLabel}</option>}

      {!isValueInList && trimmedValue !== '' && (
        <option value={trimmedValue}>{trimmedValue} (Current)</option>
      )}

      {filteredEmployees.map((emp) => {
        const roleText = emp.role || emp.accessRole;
        const label = showRoleInLabel && roleText ? `${emp.name} (${roleText})` : emp.name;
        const optVal = getOptionValue(emp);
        return (
          <option key={emp.id || emp.employeeCode || emp.name} value={optVal}>
            {label}
          </option>
        );
      })}

      {customOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

