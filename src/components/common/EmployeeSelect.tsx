import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, ChevronDown, Check, X, User, Loader2, Sparkles, Building2 } from 'lucide-react';
import { useActiveEmployees } from '../../hooks/useActiveEmployees';
import { EmployeeAvatar } from './EmployeeAvatar';
import { Employee } from '../../types/employees';

export interface EmployeeSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'onChange'> {
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement> | string) => void;
  placeholder?: string;
  showAllOption?: string;
  valueField?: 'name' | 'id' | 'employeeCode' | string;
  allowEmpty?: boolean;
  roleFilter?: string;
  departmentFilter?: string;
  customOptions?: Array<{ value: string; label: string }>;
  showRoleInLabel?: boolean;
  className?: string;
  containerClassName?: string;
  align?: 'left' | 'right' | 'auto' | 'full';
  dropdownClassName?: string;
  onSelectEmployee?: (employee: Employee | null) => void;
}

export const EmployeeSelect: React.FC<EmployeeSelectProps> = ({
  value = '',
  onChange,
  placeholder = 'Select Active Employee',
  showAllOption,
  valueField = 'name',
  allowEmpty = true,
  roleFilter,
  departmentFilter,
  customOptions = [],
  showRoleInLabel = true,
  className = '',
  containerClassName = '',
  align = 'auto',
  dropdownClassName = '',
  onSelectEmployee,
  disabled = false,
  name = '',
  id,
}) => {
  const { employees, isLoading } = useActiveEmployees();

  // Dropdown open state
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownAlign, setDropdownAlign] = useState<'left' | 'right' | 'full'>('full');
  const [openUpward, setOpenUpward] = useState(false);
  // Real-time search query for the input
  const [searchQuery, setSearchQuery] = useState('');
  // Debounced search query (250ms debounce for responsive typing)
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Normalize string value safely
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

  // Debounce search input by 250ms
  useEffect(() => {
    setIsDebouncing(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
      setIsDebouncing(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-align, smart vertical flip, and focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      if (align === 'full') {
        setDropdownAlign('full');
      } else if (align === 'right') {
        setDropdownAlign('right');
      } else if (align === 'left') {
        setDropdownAlign('left');
      } else if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // If container width is wide enough (>= 260px) and align is auto, span full width to match trigger input
        if (rect.width >= 260) {
          setDropdownAlign('full');
        } else {
          const spaceOnRight = window.innerWidth - rect.left;
          if (spaceOnRight < 300 || rect.right > window.innerWidth - 60 || rect.left > window.innerWidth / 2) {
            setDropdownAlign('right');
          } else {
            setDropdownAlign('left');
          }
        }

        // Smart vertical flip detection
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 280 && spaceAbove > spaceBelow) {
          setOpenUpward(true);
        } else {
          setOpenUpward(false);
        }
      }

      setSearchQuery('');
      setDebouncedQuery('');
      setHighlightedIndex(-1);
      setTimeout(() => {
        searchInputRef.current?.focus({ preventScroll: true });
      }, 50);
    }
  }, [isOpen, align]);

  // Handle outside click to close dropdown
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 1. FILTER TO ACTIVE EMPLOYEES ONLY (Strictly exclude Inactive, Suspended, or Deleted)
  const activeEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const isActive =
        (emp.status === 'Active' || !emp.status) &&
        !emp.isDeleted &&
        emp.status !== 'Inactive' &&
        emp.status !== 'Suspended';
      if (!isActive) return false;
      if (roleFilter && emp.role !== roleFilter && emp.accessRole !== roleFilter) return false;
      if (departmentFilter && emp.department !== departmentFilter) return false;
      return true;
    });
  }, [employees, roleFilter, departmentFilter]);

  const getOptionValue = useCallback(
    (emp: Employee): string => {
      if (valueField === 'id') return String(emp.id);
      if (valueField === 'employeeCode') return emp.employeeCode || String(emp.id);
      return emp.name;
    },
    [valueField]
  );

  // 2. SEARCH FILTERING (Matches name, code, role, department, email)
  const filteredActiveEmployees = useMemo(() => {
    if (!debouncedQuery) return activeEmployees;
    return activeEmployees.filter((emp) => {
      const q = debouncedQuery;
      const nameMatch = emp.name?.toLowerCase().includes(q);
      const codeMatch = emp.employeeCode?.toLowerCase().includes(q);
      const roleMatch = emp.role?.toLowerCase().includes(q) || emp.accessRole?.toLowerCase().includes(q);
      const deptMatch = emp.department?.toLowerCase().includes(q);
      const emailMatch = emp.email?.toLowerCase().includes(q);
      return Boolean(nameMatch || codeMatch || roleMatch || deptMatch || emailMatch);
    });
  }, [activeEmployees, debouncedQuery]);

  // Find currently selected employee
  const selectedEmployee = useMemo(() => {
    if (!trimmedValue) return null;
    return (
      activeEmployees.find(
        (e) =>
          getOptionValue(e).toLowerCase() === trimmedValue.toLowerCase() ||
          e.name.toLowerCase() === trimmedValue.toLowerCase() ||
          String(e.id) === trimmedValue ||
          (e.employeeCode && e.employeeCode.toLowerCase() === trimmedValue.toLowerCase())
      ) || null
    );
  }, [activeEmployees, trimmedValue, getOptionValue]);

  // Find if matching custom option
  const selectedCustomOption = useMemo(() => {
    if (!trimmedValue) return null;
    return customOptions.find((opt) => opt.value === trimmedValue) || null;
  }, [customOptions, trimmedValue]);

  // Emit synthetic event compatible with both HTML select listeners and raw string consumers
  const emitChange = useCallback(
    (newValue: string) => {
      const matchedEmp = newValue
        ? activeEmployees.find(
            (e) =>
              getOptionValue(e).toLowerCase() === newValue.toLowerCase() ||
              e.name.toLowerCase() === newValue.toLowerCase() ||
              String(e.id) === newValue ||
              (e.employeeCode && e.employeeCode.toLowerCase() === newValue.toLowerCase())
          ) || null
        : null;

      const safeEvent: any = {
        target: {
          value: newValue,
          name: name || '',
        },
        currentTarget: {
          value: newValue,
          name: name || '',
        },
        value: newValue,
        id: matchedEmp ? matchedEmp.id : undefined,
        name: matchedEmp ? matchedEmp.name : '',
        role: matchedEmp ? matchedEmp.role : '',
        avatar: matchedEmp ? (matchedEmp.avatar || '') : '',
        employee: matchedEmp,
        toString: () => newValue,
        valueOf: () => newValue,
        toJSON: () => newValue,
        [Symbol.toPrimitive]: () => newValue,
      };

      if (onSelectEmployee) {
        onSelectEmployee(matchedEmp);
      }
      if (typeof onChange === 'function') {
        onChange(safeEvent);
      }
    },
    [onChange, onSelectEmployee, name, activeEmployees, getOptionValue]
  );

  const handleSelectOption = (optVal: string) => {
    emitChange(optVal);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    emitChange('');
    setIsOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const totalItems = (allowEmpty ? 1 : 0) + filteredActiveEmployees.length + customOptions.length;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < totalItems ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        let currentIndex = 0;
        if (allowEmpty) {
          if (highlightedIndex === 0) {
            handleSelectOption('');
            return;
          }
          currentIndex++;
        }
        const empIndex = highlightedIndex - currentIndex;
        if (empIndex >= 0 && empIndex < filteredActiveEmployees.length) {
          handleSelectOption(getOptionValue(filteredActiveEmployees[empIndex]));
          return;
        }
        const customIndex = empIndex - filteredActiveEmployees.length;
        if (customIndex >= 0 && customIndex < customOptions.length) {
          handleSelectOption(customOptions[customIndex].value);
        }
      }
    }
  };

  const defaultLabel = showAllOption || placeholder;

  const widthClasses = className
    .split(/\s+/)
    .filter((c) => c.startsWith('max-w-') || c.startsWith('w-') || c.startsWith('min-w-'))
    .join(' ');
  const effectiveContainerClass = containerClassName || (widthClasses ? `relative ${widthClasses}` : 'relative w-full');

  return (
    <div ref={containerRef} className={effectiveContainerClass} onKeyDown={handleKeyDown}>
      {/* Hidden native input for form submissions */}
      <input type="hidden" name={name} value={trimmedValue} id={id} />

      {/* Main Select Button Trigger */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs rounded-lg border transition-all cursor-pointer ${disabled
          ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
          : isOpen
            ? 'bg-white dark:bg-slate-900 border-[#5B4DB7] dark:border-purple-500 ring-2 ring-[#5B4DB7]/20 text-slate-900 dark:text-slate-100 shadow-xs'
            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-slate-900 dark:text-slate-100 shadow-2xs'
          } ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          {selectedEmployee ? (
            <>
              <EmployeeAvatar
                name={selectedEmployee.name}
                avatar={selectedEmployee.avatar}
                profilePhoto={selectedEmployee.profilePhoto}
                email={selectedEmployee.email}
                size="xs"
              />
              <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate min-w-0 shrink">
                  {selectedEmployee.name}
                </span>
                {selectedEmployee.employeeCode && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-[#5B4DB7] dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 shrink-0">
                    {selectedEmployee.employeeCode}
                  </span>
                )}
                {showRoleInLabel && selectedEmployee.role && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate min-w-0 shrink hidden md:inline">
                    • {selectedEmployee.role}
                  </span>
                )}
              </div>
            </>
          ) : selectedCustomOption ? (
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {selectedCustomOption.label}
            </span>
          ) : trimmedValue ? (
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{trimmedValue}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 truncate">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{defaultLabel}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {allowEmpty && trimmedValue && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  emitChange('');
                  setIsOpen(false);
                }
              }}
              className="p-1 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center justify-center"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-150 ${isOpen ? 'rotate-180 text-[#5B4DB7]' : ''}`}
          />
        </div>
      </button>

      {/* Floating Typeahead Dropdown */}
      {isOpen && (
        <div
          className={`absolute z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${
            dropdownAlign === 'full'
              ? 'left-0 right-0 w-full min-w-full'
              : dropdownAlign === 'right'
              ? 'right-0 left-auto min-w-[270px] sm:min-w-[300px] max-w-[min(380px,calc(100vw-1.5rem))]'
              : 'left-0 right-auto min-w-[270px] sm:min-w-[300px] max-w-[min(380px,calc(100vw-1.5rem))]'
          } ${dropdownClassName}`}
        >
          {/* Debounced Search Input Header */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50">
            <div className="relative">
              {isDebouncing ? (
                <Loader2 className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400 absolute left-2.5 top-1/2 -translate-y-1/2 animate-spin pointer-events-none" />
              ) : (
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type name, code, role or department..."
                className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#5B4DB7]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between px-1 pt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Active Employees Only
              </span>
              <span>
                {filteredActiveEmployees.length} of {activeEmployees.length} available
              </span>
            </div>
          </div>

          {/* Options List */}
          <div ref={listRef} className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {/* Empty / Reset Option */}
            {allowEmpty && (
              <button
                type="button"
                onClick={() => handleSelectOption('')}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${!trimmedValue
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <span className="italic">{defaultLabel}</span>
                {!trimmedValue && <Check className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />}
              </button>
            )}

            {/* Custom Options (e.g. Unassigned) */}
            {customOptions.map((opt) => {
              const isSelected = trimmedValue === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${isSelected
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#5B4DB7] dark:text-purple-400" />}
                </button>
              );
            })}

            {/* Active Employees List */}
            {filteredActiveEmployees.length > 0 ? (
              filteredActiveEmployees.map((emp) => {
                const optVal = getOptionValue(emp);
                const isSelected =
                  trimmedValue === optVal ||
                  trimmedValue.toLowerCase() === emp.name.toLowerCase() ||
                  trimmedValue === String(emp.id);

                return (
                  <button
                    key={emp.id || emp.employeeCode || emp.name}
                    type="button"
                    onClick={() => handleSelectOption(optVal)}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between gap-2.5 transition-colors cursor-pointer group ${isSelected
                      ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 text-purple-900 dark:text-purple-100'
                      : 'hover:bg-slate-100/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <EmployeeAvatar
                        name={emp.name}
                        avatar={emp.avatar}
                        profilePhoto={emp.profilePhoto}
                        email={emp.email}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 dark:text-white truncate">
                            {emp.name}
                          </span>
                          {emp.employeeCode && (
                            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                              {emp.employeeCode}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          <span className="truncate">{emp.role || emp.accessRole || 'Team Member'}</span>
                          {emp.department && (
                            <>
                              <span>•</span>
                              <span className="truncate">{emp.department}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#5B4DB7] dark:text-purple-400 shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                <User className="w-6 h-6 mx-auto mb-1.5 text-slate-300 dark:text-slate-600" />
                <p className="font-medium text-slate-600 dark:text-slate-300">No active employees found</p>
                {debouncedQuery && (
                  <p className="text-[11px] mt-0.5 text-slate-400">
                    No results for &ldquo;{debouncedQuery}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
