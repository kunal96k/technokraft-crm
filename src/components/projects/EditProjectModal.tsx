import React, { useState, useEffect } from 'react';
import {
  X,
  Briefcase,
  Layers,
  Calendar,
  IndianRupee,
  UserCheck,
  Globe,
  GitBranch,
  FileText,
  Loader2,
  Check,
  AlertCircle,
  Building2,
  Mail,
  Phone,
} from 'lucide-react';
import { DeliveryProjectRecord, ProjectPriority, ProjectStatus } from '../../types/projects';
import { EmployeeSelect } from '../common/EmployeeSelect';
import { EmployeeAvatar } from '../common/EmployeeAvatar';
import { updateProject } from '../../services/projectService';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: DeliveryProjectRecord | null;
  onUpdated: (project: DeliveryProjectRecord) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdated,
}) => {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [serviceType, setServiceType] = useState('Web App Development');
  const [status, setStatus] = useState<ProjectStatus>('PLANNING');
  const [priority, setPriority] = useState<ProjectPriority>('MEDIUM');
  const [budget, setBudget] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [projectManagerId, setProjectManagerId] = useState<number | undefined>();
  const [projectManagerName, setProjectManagerName] = useState<string>('');
  const [projectManagerAvatar, setProjectManagerAvatar] = useState<string | undefined>();
  const [description, setDescription] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [stagingUrl, setStagingUrl] = useState('');
  const [productionUrl, setProductionUrl] = useState('');
  const [ciCdNotes, setCiCdNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever the selected project changes
  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setCompanyName(project.companyName || '');
      setClientName(project.clientName || '');
      setClientEmail(project.clientEmail || '');
      setClientPhone(project.clientPhone || '');
      setServiceType(project.serviceType || 'Web App Development');
      setStatus(project.status || 'PLANNING');
      setPriority(project.priority || 'MEDIUM');
      setBudget(project.budget !== undefined && project.budget !== null ? String(project.budget) : '');
      setStartDate(project.startDate ? project.startDate.split('T')[0] : '');
      setTargetDate(project.targetDate ? project.targetDate.split('T')[0] : '');
      setProjectManagerId(project.projectManagerId);
      setProjectManagerName(project.projectManagerName || '');
      setProjectManagerAvatar(project.projectManagerAvatar);
      setDescription(project.description || '');
      setRepositoryUrl(project.repositoryUrl || '');
      setStagingUrl(project.stagingUrl || '');
      setProductionUrl(project.productionUrl || '');
      setCiCdNotes(project.ciCdNotes || '');
      setError(null);
    }
  }, [project, isOpen]);

  if (!isOpen || !project) return null;

  const handlePmSelect = (emp: any) => {
    if (!emp) {
      setProjectManagerId(undefined);
      setProjectManagerName('');
      setProjectManagerAvatar(undefined);
      return;
    }
    if (typeof emp === 'object' && emp.id) {
      setProjectManagerId(Number(emp.id));
      setProjectManagerName(emp.name || '');
      setProjectManagerAvatar(emp.avatar || undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project Name is required');
      return;
    }
    if (!companyName.trim()) {
      setError('Client Company Name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: Partial<DeliveryProjectRecord> = {
        name: name.trim(),
        companyName: companyName.trim(),
        clientName: clientName.trim() || undefined,
        clientEmail: clientEmail.trim() || undefined,
        clientPhone: clientPhone.trim() || undefined,
        serviceType,
        status,
        priority,
        budget: budget ? parseFloat(budget) : 0,
        startDate: startDate || undefined,
        targetDate: targetDate || undefined,
        projectManagerId: projectManagerId || undefined,
        projectManagerName: projectManagerName || undefined,
        projectManagerAvatar: projectManagerAvatar || undefined,
        description: description.trim() || undefined,
        repositoryUrl: repositoryUrl.trim() || undefined,
        stagingUrl: stagingUrl.trim() || undefined,
        productionUrl: productionUrl.trim() || undefined,
        ciCdNotes: ciCdNotes.trim() || undefined,
      };

      const updated = await updateProject(project.id, payload);
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      console.error('Failed to update project:', err);
      setError(err?.message || 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-[#5B4DB7] dark:text-purple-300">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Delivery Project</h3>
                <span className="font-mono text-xs font-bold text-[#5B4DB7] dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-900">
                  {project.projectCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update deliverables, status, timeline, and assigned project manager
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Project & Client Identification
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>Project Name</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. TirthaPurohit Puja Booking - Web Development"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Client / Company Name</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company name"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Primary Contact Person
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Client Email</span>
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Client Phone</span>
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Execution Status, Priority & PM */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Execution, Stage & Leadership
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>Project Status</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
                >
                  <option value="PLANNING">Planning & Architecture</option>
                  <option value="ACTIVE">In Development</option>
                  <option value="CLIENT_REVIEW">QA & Client Review</option>
                  <option value="COMPLETED">Delivered / Live</option>
                  <option value="ON_HOLD">On Hold</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Service Type
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] cursor-pointer"
                >
                  <option value="Web App Development">Web App Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Full Stack Custom Solution">Full Stack Custom Solution</option>
                  <option value="Cloud & DevOps Infrastructure">Cloud & DevOps Infrastructure</option>
                  <option value="UI/UX Product Design">UI/UX Product Design</option>
                  <option value="Maintenance & SLA Support">Maintenance & SLA Support</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                  <span>Budget Amount (₹ INR)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs select-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Start Date</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target Due Date</span>
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>
            </div>

            {/* Project Manager Selection with Avatar Preview */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#5B4DB7]" />
                <span>Assigned Project Manager (PM)</span>
              </label>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <EmployeeSelect
                    value={projectManagerId ? String(projectManagerId) : ''}
                    valueField="id"
                    placeholder="Search and select Project Manager..."
                    allowEmpty={true}
                    onSelectEmployee={handlePmSelect}
                    onChange={() => {}}
                  />
                </div>
                {projectManagerName && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl">
                    <EmployeeAvatar name={projectManagerName} avatar={projectManagerAvatar} size="xs" />
                    <span className="text-xs font-bold text-[#5B4DB7] dark:text-purple-300 truncate max-w-[140px]">
                      {projectManagerName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Description */}
          <div className="space-y-1.5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Scope & Architecture Description</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline project deliverables, high-level scope, tech stack, and milestone expectations..."
              className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7] leading-relaxed"
            />
          </div>

          {/* Section 4: Repository & Deployment Links */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Repositories & Deployment Endpoints
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                  <span>Git Repository URL</span>
                </label>
                <input
                  type="url"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/org/repo"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Staging URL</span>
                </label>
                <input
                  type="url"
                  value={stagingUrl}
                  onChange={(e) => setStagingUrl(e.target.value)}
                  placeholder="https://staging.domain.com"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Production Live URL</span>
                </label>
                <input
                  type="url"
                  value={productionUrl}
                  onChange={(e) => setProductionUrl(e.target.value)}
                  placeholder="https://app.clientdomain.com"
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                CI/CD & Pipeline Notes
              </label>
              <input
                type="text"
                value={ciCdNotes}
                onChange={(e) => setCiCdNotes(e.target.value)}
                placeholder="e.g. Docker + AWS ECS GitHub Actions workflow; auto-deploy on main push"
                className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 hover:shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save Project Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
