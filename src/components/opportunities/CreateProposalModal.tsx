import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  FileText,
  Plus,
  Trash2,
  Building2,
  User,
  Mail,
  Phone,
  Clock,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Database,
  Server,
  Globe,
  Wrench,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info,
  Layers,
} from 'lucide-react';
import {
  OpportunityRecord,
  ProposalRecord,
  ProposalMilestone,
  HostingLineItem,
  ServicesLineItem,
} from '../../types/opportunities';
import { Lead } from '../../types/leads';
import { OpportunitySearchSelect } from '../common/OpportunitySearchSelect';
import { LeadSearchSelect } from '../common/LeadSearchSelect';
import { formatCurrencyINR } from '../../utils/currencyFormatters';

interface CreateProposalModalProps {
  isOpen: boolean;
  opportunity?: OpportunityRecord | null;
  initialProposal?: ProposalRecord | null;
  availableOpportunities?: OpportunityRecord[];
  onClose: () => void;
  onSaveProposal: (proposal: ProposalRecord) => Promise<void> | void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const genId = () => `item_${Date.now()}_${Math.floor(Math.random() * 9999)}`;

const defaultMilestones = (total: number): ProposalMilestone[] => [
  { title: 'Project Kickoff & Technical Architecture Sign-off', percentage: 30, amount: Math.round(total * 0.3) },
  { title: 'Alpha Milestone & Core Modules Build', percentage: 40, amount: Math.round(total * 0.4) },
  { title: 'Production UAT, Cutover & Handover', percentage: 30, amount: Math.round(total * 0.3) },
];

/**
 * Recalculates milestone percentages based on their exact rupee amounts.
 * Uses the Largest Remainder Method (Hare-Niemeyer) to ensure that the
 * resulting integer percentages ALWAYS sum to precisely 100%.
 */
const recalculatePercentages = (items: ProposalMilestone[]): ProposalMilestone[] => {
  const total = items.reduce((s, m) => s + (Number(m.amount) || 0), 0);
  if (total <= 0) {
    return items.map(m => ({ ...m, percentage: 0 }));
  }

  const rawPcts = items.map(m => ((Number(m.amount) || 0) / total) * 100);
  const floors = rawPcts.map(p => Math.floor(p));
  let remainder = 100 - floors.reduce((s, v) => s + v, 0);

  const withFraction = rawPcts.map((raw, idx) => ({ idx, fraction: raw - floors[idx] }));
  withFraction.sort((a, b) => b.fraction - a.fraction);

  const resultPcts = [...floors];
  for (let i = 0; i < remainder && i < withFraction.length; i++) {
    resultPcts[withFraction[i].idx] += 1;
  }

  return items.map((m, idx) => ({
    ...m,
    percentage: resultPcts[idx],
  }));
};


const defaultHostingItems = (): HostingLineItem[] => [
  {
    id: genId(),
    description: 'AWS EC2 t3.medium (2 vCPU / 4 GB RAM) – App Server',
    provider: 'AWS',
    billingCycle: 'monthly',
    unitCost: 4200,
    quantity: 12,
    totalCost: 50400,
    notes: 'On-demand pricing, region: ap-south-1 (Mumbai)',
  },
  {
    id: genId(),
    description: 'Domain Registration (.com / .in)',
    provider: 'Other',
    billingCycle: 'yearly',
    unitCost: 1200,
    quantity: 1,
    totalCost: 1200,
    notes: 'Billed directly to client – charged separately',
  },
];

const defaultServicesItems = (): ServicesLineItem[] => [
  {
    id: genId(),
    description: 'Application Support & Maintenance (AMC)',
    billingCycle: 'monthly',
    unitCost: 15000,
    quantity: 12,
    totalCost: 180000,
    notes: '9×5 support SLA, bug fixes & minor enhancements included',
  },
];

const BILLING_CYCLES = ['monthly', 'yearly', 'quarterly', 'one-time'] as const;
const PROVIDERS = ['AWS', 'GCP', 'Azure', 'DigitalOcean', 'Hostinger', 'Other'] as const;

// ─── Sub-Components ──────────────────────────────────────────────────────────

interface SectionToggleBtnProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  active: boolean;
  badge?: string;
  onClick: () => void;
  color: 'purple' | 'sky' | 'emerald';
}

const colorMap = {
  purple: {
    active: 'bg-[#5B4DB7] text-white border-[#5B4DB7] shadow-md shadow-purple-200/60 dark:shadow-purple-900/30',
    inactive: 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-[#5B4DB7]/50 hover:text-[#5B4DB7]',
    iconActive: 'text-white',
    iconInactive: 'text-[#5B4DB7]',
  },
  sky: {
    active: 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-200/60 dark:shadow-sky-900/30',
    inactive: 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-sky-500/50 hover:text-sky-600',
    iconActive: 'text-white',
    iconInactive: 'text-sky-600',
  },
  emerald: {
    active: 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200/60 dark:shadow-emerald-900/30',
    inactive: 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 hover:text-emerald-600',
    iconActive: 'text-white',
    iconInactive: 'text-emerald-600',
  },
};

const SectionToggleBtn: React.FC<SectionToggleBtnProps> = ({
  icon, label, sublabel, active, badge, onClick, color,
}) => {
  const cm = colorMap[color];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 min-w-[140px] flex flex-col items-start gap-1 px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left ${active ? cm.active : cm.inactive}`}
    >
      <div className="flex items-center gap-2 w-full">
        <span className={`${active ? cm.iconActive : cm.iconInactive}`}>{icon}</span>
        <span className="font-bold text-[12px] leading-tight flex-1">{label}</span>
        {badge && (
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
            {badge}
          </span>
        )}
      </div>
      <span className={`text-[10px] leading-tight ${active ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>{sublabel}</span>
    </button>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isOpen,
  opportunity = null,
  initialProposal = null,
  onClose,
  onSaveProposal,
}) => {
  const isEditMode = Boolean(initialProposal);

  // Source selection
  const [sourceTab, setSourceTab] = useState<'opportunity' | 'lead' | 'manual'>('opportunity');
  const [selectedOppId, setSelectedOppId] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState('');

  // Core fields
  const [proposalCode, setProposalCode] = useState('');
  const [opportunityName, setOpportunityName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [leadCode, setLeadCode] = useState<string | undefined>(undefined);
  const [service, setService] = useState('Custom Software Development');
  const [ownerName, setOwnerName] = useState('');
  const [summary, setSummary] = useState('');
  const [timelineDescription, setTimelineDescription] = useState('12 Weeks delivery schedule');

  // Development section (always on)
  const [devAmount, setDevAmount] = useState(250000);
  const [milestones, setMilestones] = useState<ProposalMilestone[]>(defaultMilestones(250000));
  const [devSectionOpen, setDevSectionOpen] = useState(true);

  // Hosting & Infrastructure section (optional)
  const [hostingEnabled, setHostingEnabled] = useState(false);
  const [hostingNote, setHostingNote] = useState('Hosting and infrastructure charges are billed separately per actual AWS usage. Pricing quoted here is indicative and subject to monthly actuals.');
  const [hostingItems, setHostingItems] = useState<HostingLineItem[]>([]);
  const [hostingSectionOpen, setHostingSectionOpen] = useState(true);

  // Managed Services / AMC section (optional)
  const [servicesEnabled, setServicesEnabled] = useState(false);
  const [servicesNote, setServicesNote] = useState('Post-deployment managed services and AMC charges are optional and quoted separately as per client requirement.');
  const [servicesItems, setServicesItems] = useState<ServicesLineItem[]>([]);
  const [servicesSectionOpen, setServicesSectionOpen] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Computed totals
  const hostingSubtotal = hostingItems.reduce((s, i) => s + i.totalCost, 0);
  const servicesSubtotal = servicesItems.reduce((s, i) => s + i.totalCost, 0);
  const grandTotal = devAmount + (hostingEnabled ? hostingSubtotal : 0) + (servicesEnabled ? servicesSubtotal : 0);

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setFormError(null);

    // Edit mode: pre-fill all fields from the initialProposal record
    if (initialProposal) {
      setProposalCode(initialProposal.proposalCode || '');
      setCompanyName(initialProposal.companyName || '');
      setContactName(initialProposal.contactName || '');
      setContactEmail(initialProposal.contactEmail || '');
      setContactPhone(initialProposal.contactPhone || '');
      setLeadCode(initialProposal.leadCode);
      setOpportunityName(initialProposal.opportunityName || '');
      setSelectedOppId(initialProposal.opportunityId || '');
      setService(initialProposal.service || 'Custom Software Development');
      setOwnerName(initialProposal.ownerName || 'Sales Team');
      const val = initialProposal.amount || 250000;
      setDevAmount(val);
      setMilestones(
        initialProposal.commercialDetails?.milestones && initialProposal.commercialDetails.milestones.length > 0
          ? initialProposal.commercialDetails.milestones
          : defaultMilestones(val)
      );
      setSummary(initialProposal.summary || '');
      setTimelineDescription(initialProposal.timelineDescription || '12 Weeks delivery schedule');
      const hasHosting = Boolean(initialProposal.hostingSection?.enabled && initialProposal.hostingSection.items?.length);
      setHostingEnabled(hasHosting);
      setHostingNote(initialProposal.hostingSection?.note || 'Hosting and infrastructure charges are billed separately per actual AWS usage.');
      setHostingItems(initialProposal.hostingSection?.items || []);
      const hasServices = Boolean(initialProposal.servicesSection?.enabled && initialProposal.servicesSection.items?.length);
      setServicesEnabled(hasServices);
      setServicesNote(initialProposal.servicesSection?.note || 'Post-deployment managed services and AMC charges are optional and quoted separately as per client requirement.');
      setServicesItems(initialProposal.servicesSection?.items || []);
      return;
    }

    const now = new Date();
    const code = `PR-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setProposalCode(code);
    setHostingEnabled(false);
    setServicesEnabled(false);
    setHostingItems([]);
    setServicesItems([]);

    if (opportunity) {
      setSourceTab('opportunity');
      setSelectedOppId(opportunity.id);
      setOpportunityName(opportunity.name);
      setCompanyName(opportunity.companyName);
      setContactName(opportunity.contactName);
      setContactEmail(opportunity.contactEmail || '');
      setContactPhone(opportunity.contactPhone || '');
      setLeadCode(opportunity.leadCode);
      setService(opportunity.service);
      setOwnerName(opportunity.owner?.name || 'Sales Team');
      const val = opportunity.estimatedValue || 250000;
      setDevAmount(val);
      setMilestones(defaultMilestones(val));
      setSummary(opportunity.requirement?.summary || `Commercial quotation and technical scope package for ${opportunity.name} (${opportunity.companyName}).`);
      setTimelineDescription(opportunity.requirement?.timeline || '12 Weeks delivery schedule');
    } else {
      setSourceTab('opportunity');
      setSelectedOppId('');
      setSelectedLeadId('');
      setOpportunityName('');
      setCompanyName('');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setLeadCode(undefined);
      setService('Custom Software Development');
      setOwnerName('Sales Team');
      setDevAmount(250000);
      setMilestones(defaultMilestones(250000));
      setSummary('Formal commercial quotation and technical proposal prepared by TechnoKraft Services LLP.');
      setTimelineDescription('12 Weeks delivery schedule');
    }
  }, [isOpen, opportunity, initialProposal]);

  // ── Source handlers ─────────────────────────────────────────────────────────
  const handleOpportunitySelected = (oppId: string, opp: OpportunityRecord | null) => {
    setSelectedOppId(oppId);
    if (opp) {
      setOpportunityName(opp.name);
      setCompanyName(opp.companyName);
      setContactName(opp.contactName);
      setContactEmail(opp.contactEmail || '');
      setContactPhone((opp as any).contactPhone || '');
      setLeadCode(opp.leadCode);
      setService(opp.service);
      setOwnerName(opp.owner?.name || 'Sales Team');
      const val = opp.estimatedValue || devAmount || 250000;
      handleDevAmountChange(val);
      if (opp.requirement?.summary) setSummary(opp.requirement.summary);
      if (opp.requirement?.timeline) setTimelineDescription(opp.requirement.timeline);
    }
  };

  const handleLeadSelected = (leadIdStr: string, leadObj: Lead | null) => {
    setSelectedLeadId(leadIdStr);
    if (leadObj) {
      setCompanyName(leadObj.company?.name || '');
      setContactName(leadObj.contact?.name || '');
      setContactEmail(leadObj.contact?.email || '');
      setContactPhone((leadObj.contact as any)?.phone || '');
      setLeadCode(leadObj.leadCode);
      setService(leadObj.service || 'Custom Software Development');
      setOpportunityName(`${leadObj.company?.name || 'Client'} - ${leadObj.service || 'Solution'}`);
      setOwnerName(leadObj.assignedEmployee?.name || 'Sales Team');
      if (leadObj.requirement?.summary) setSummary(leadObj.requirement.summary);
      if (leadObj.requirement?.expectedTimeline) setTimelineDescription(leadObj.requirement.expectedTimeline);
    }
  };

  // ── Dev section handlers ────────────────────────────────────────────────────
  const handleDevAmountChange = (newVal: number) => {
    const safeVal = Math.max(0, newVal || 0);
    setDevAmount(safeVal);
    setMilestones(prev => prev.map(m => ({ ...m, amount: Math.round((safeVal * m.percentage) / 100) })));
  };

  const handleMilestoneChange = (
    idx: number,
    field: 'title' | 'percentage' | 'amount',
    val: string | number
  ) => {
    if (field === 'title') {
      setMilestones(prev => {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], title: String(val) };
        return copy;
      });
      return;
    }

    if (field === 'percentage') {
      const pct = Math.max(0, Math.min(100, Number(val) || 0));
      setMilestones(prev => {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          percentage: pct,
          amount: Math.round((devAmount * pct) / 100),
        };
        return copy;
      });
      return;
    }

    if (field === 'amount') {
      const amt = Math.max(0, Number(val) || 0);
      const copy = [...milestones];
      copy[idx] = { ...copy[idx], amount: amt };
      const newTotal = copy.reduce((s, m) => s + (Number(m.amount) || 0), 0);
      setDevAmount(newTotal);
      setMilestones(recalculatePercentages(copy));
      return;
    }
  };

  const addMilestone = () =>
    setMilestones(prev => [...prev, { title: `Deliverable Milestone #${prev.length + 1}`, percentage: 0, amount: 0 }]);

  const removeMilestone = (idx: number) => {
    if (milestones.length <= 1) return;
    const copy = milestones.filter((_, i) => i !== idx);
    const newTotal = copy.reduce((s, m) => s + (Number(m.amount) || 0), 0);
    setDevAmount(newTotal);
    setMilestones(recalculatePercentages(copy));
  };

  const totalPct = milestones.reduce((s, m) => s + m.percentage, 0);
  const milestoneSum = milestones.reduce((s, m) => s + (Number(m.amount) || 0), 0);

  // ── Hosting handlers ────────────────────────────────────────────────────────
  const toggleHosting = () => {
    const next = !hostingEnabled;
    setHostingEnabled(next);
    if (next && hostingItems.length === 0) setHostingItems(defaultHostingItems());
  };

  const addHostingItem = () =>
    setHostingItems(prev => [...prev, {
      id: genId(), description: '', provider: 'AWS', billingCycle: 'monthly',
      unitCost: 0, quantity: 1, totalCost: 0,
    }]);

  const updateHostingItem = useCallback(<K extends keyof HostingLineItem>(id: string, field: K, value: HostingLineItem[K]) => {
    setHostingItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'unitCost' || field === 'quantity') {
        updated.totalCost = (Number(updated.unitCost) || 0) * (Number(updated.quantity) || 0);
      }
      return updated;
    }));
  }, []);

  const removeHostingItem = (id: string) => setHostingItems(prev => prev.filter(i => i.id !== id));

  // ── Services handlers ───────────────────────────────────────────────────────
  const toggleServices = () => {
    const next = !servicesEnabled;
    setServicesEnabled(next);
    if (next && servicesItems.length === 0) setServicesItems(defaultServicesItems());
  };

  const addServicesItem = () =>
    setServicesItems(prev => [...prev, {
      id: genId(), description: '', billingCycle: 'monthly',
      unitCost: 0, quantity: 1, totalCost: 0,
    }]);

  const updateServicesItem = useCallback(<K extends keyof ServicesLineItem>(id: string, field: K, value: ServicesLineItem[K]) => {
    setServicesItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'unitCost' || field === 'quantity') {
        updated.totalCost = (Number(updated.unitCost) || 0) * (Number(updated.quantity) || 0);
      }
      return updated;
    }));
  }, []);

  const removeServicesItem = (id: string) => setServicesItems(prev => prev.filter(i => i.id !== id));

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) { setFormError('Client / Company name is required.'); return; }
    if (!opportunityName.trim()) { setFormError('Opportunity / Deal name is required.'); return; }
    if (devAmount <= 0) { setFormError('Development amount must be greater than zero.'); return; }

    setIsSubmitting(true);
    setFormError(null);
    const nowIso = new Date().toISOString().slice(0, 10);

    const proposalRecord: ProposalRecord = {
      id: initialProposal?.id || String(Date.now()),
      proposalCode,
      opportunityId: initialProposal?.opportunityId || opportunity?.id || selectedOppId || selectedLeadId || String(Date.now()),
      opportunityName: opportunityName.trim(),
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      leadCode: leadCode || undefined,
      service: service as any,
      amount: devAmount,
      createdDate: initialProposal?.createdDate || nowIso,
      sentDate: initialProposal?.sentDate || nowIso,
      status: initialProposal?.status || 'Sent',
      ownerName: ownerName.trim() || 'Sales Team',
      summary: summary.trim(),
      timelineDescription: timelineDescription.trim(),
      commercialDetails: {
        milestones,
        taxes: 'Fixed Scope Commercial Basis',
        hostingSection: hostingEnabled
          ? { enabled: true, note: hostingNote, items: hostingItems, subtotal: hostingSubtotal }
          : undefined,
        servicesSection: servicesEnabled
          ? { enabled: true, note: servicesNote, items: servicesItems, subtotal: servicesSubtotal }
          : undefined,
      },
      hostingSection: hostingEnabled
        ? { enabled: true, note: hostingNote, items: hostingItems, subtotal: hostingSubtotal }
        : undefined,
      servicesSection: servicesEnabled
        ? { enabled: true, note: servicesNote, items: servicesItems, subtotal: servicesSubtotal }
        : undefined,
      activityHistory: [
        ...(initialProposal?.activityHistory || []),
        {
          date: nowIso,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          description: isEditMode
            ? `Proposal ${proposalCode} edited & updated — Dev: ${formatCurrencyINR(devAmount)}${hostingEnabled ? ` + Hosting: ${formatCurrencyINR(hostingSubtotal)}` : ''}${servicesEnabled ? ` + Services: ${formatCurrencyINR(servicesSubtotal)}` : ''}`
            : `Proposal ${proposalCode} created — Dev: ${formatCurrencyINR(devAmount)}${hostingEnabled ? ` + Hosting: ${formatCurrencyINR(hostingSubtotal)}` : ''}${servicesEnabled ? ` + Services: ${formatCurrencyINR(servicesSubtotal)}` : ''}`,
          user: ownerName.trim() || 'Sales Team',
        },
      ],
    };

    try {
      await onSaveProposal(proposalRecord);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 overflow-hidden animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden h-[88vh] max-h-[88vh] flex flex-col">

        {/* ── Fixed Top Header ── */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#5B4DB7]/5 to-purple-50/40 dark:from-slate-950/80 dark:to-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5B4DB7] text-white flex items-center justify-center shadow-md shadow-purple-300/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isEditMode ? 'Edit Commercial Proposal' : 'Generate Commercial Proposal'}
                </h3>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#5B4DB7]/10 text-[#5B4DB7] dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {proposalCode}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isEditMode
                  ? 'Update development milestones, hosting specifications, and managed services scope'
                  : 'Add sections for Dev Quotation, Hosting & Infrastructure, and Managed Services'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Error Banner (Fixed) ── */}
        {formError && (
          <div className="px-6 py-2.5 bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* ── Scrollable Form Body ── */}
        <form id="create-proposal-form" onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300 flex-1 overflow-y-auto overflow-x-hidden min-h-0">

          {/* Section Selector Buttons */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Proposal Sections</span>
              <span className="text-[10px] text-slate-400">— toggle optional sections to include in quotation</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Dev always on — show as "active always" */}
              <SectionToggleBtn
                icon={<FileText className="w-4 h-4" />}
                label="Development Quotation"
                sublabel="Milestones, timelines & dev pricing"
                active={true}
                badge="Required"
                onClick={() => setDevSectionOpen(o => !o)}
                color="purple"
              />
              <SectionToggleBtn
                icon={<Server className="w-4 h-4" />}
                label="Hosting & Infrastructure"
                sublabel="AWS EC2, Domain, SSL — charged separately"
                active={hostingEnabled}
                badge="Optional"
                onClick={toggleHosting}
                color="sky"
              />
              <SectionToggleBtn
                icon={<Wrench className="w-4 h-4" />}
                label="Managed Services / AMC"
                sublabel="Post-launch support & maintenance"
                active={servicesEnabled}
                badge="Optional"
                onClick={toggleServices}
                color="emerald"
              />
            </div>
          </div>

          {/* Source Selector Tabs (Hidden in Edit Mode or when tied to opportunity) */}
          {!opportunity && !isEditMode && (
            <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">Proposal Target Source:</span>
                <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                  <button type="button" onClick={() => setSourceTab('opportunity')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${sourceTab === 'opportunity' ? 'bg-white dark:bg-slate-700 text-[#5B4DB7] dark:text-purple-300 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                    <TrendingUp className="w-3.5 h-3.5" /><span>Active Opportunities</span>
                  </button>
                  <button type="button" onClick={() => setSourceTab('lead')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${sourceTab === 'lead' ? 'bg-white dark:bg-slate-700 text-[#5B4DB7] dark:text-purple-300 shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                    <Database className="w-3.5 h-3.5" /><span>CRM Leads</span>
                  </button>
                </div>
              </div>
              {sourceTab === 'opportunity' && (
                <OpportunitySearchSelect label="Select Opportunity / Deal" value={selectedOppId} onChange={handleOpportunitySelected}
                  placeholder="Type to search active opportunities..." showMetaPreview />
              )}
              {sourceTab === 'lead' && (
                <LeadSearchSelect label="Select Client / Lead" value={selectedLeadId} onChange={handleLeadSelected}
                  placeholder="Type to search leads (10K+ records)..." showMetaPreview />
              )}
            </div>
          )}

          {/* Client & Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
              <Building2 className="w-3.5 h-3.5 text-[#5B4DB7]" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Client & Contact Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Client / Company Name <span className="text-rose-500">*</span>
                </label>
                <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)}
                  placeholder="Enter client / company name"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Opportunity / Deal Name <span className="text-rose-500">*</span>
                </label>
                <input type="text" required value={opportunityName} onChange={e => setOpportunityName(e.target.value)}
                  placeholder="Enter opportunity / deal name"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                  <User className="inline w-3 h-3 mr-1" />Contact Person
                </label>
                <input type="text" value={contactName} onChange={e => setContactName(e.target.value)}
                  placeholder="Enter contact person name"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                  <Mail className="inline w-3 h-3 mr-1" />Contact Email
                </label>
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                  placeholder="Enter contact email address"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                  <Phone className="inline w-3 h-3 mr-1" />Contact Phone
                </label>
                <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)}
                  placeholder="Enter contact phone number"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Service Domain
                </label>
                <input type="text" value={service} onChange={e => setService(e.target.value)}
                  placeholder="Enter service domain (e.g. Custom Software Development)"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">
                  <Clock className="inline w-3 h-3 mr-1" />Delivery Timeline
                </label>
                <input type="text" value={timelineDescription} onChange={e => setTimelineDescription(e.target.value)}
                  placeholder="Enter delivery timeline (e.g. 12 Weeks delivery schedule)"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none" />
              </div>
              <div>
                <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Commercial Lead / Owner</label>
                <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)}
                  placeholder="Enter commercial lead / proposal owner"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Executive Scope Summary</label>
              <textarea rows={2} value={summary} onChange={e => setSummary(e.target.value)}
                placeholder="Enter executive scope summary, key deliverables, and commercial terms..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none resize-none" />
            </div>
          </div>

          {/* ═══ SECTION 1: Development Quotation ═══ */}
          <div className="rounded-xl border-2 border-[#5B4DB7]/30 overflow-hidden">
            <button type="button" onClick={() => setDevSectionOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#5B4DB7]/5 dark:bg-purple-950/30 hover:bg-[#5B4DB7]/10 transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#5B4DB7] text-white flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-[#5B4DB7] dark:text-purple-300 text-xs">Section 1 — Development Quotation</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Milestone-based development pricing (required)</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-[#5B4DB7] text-xs">{formatCurrencyINR(devAmount)}</span>
                {devSectionOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {devSectionOpen && (
              <div className="px-4 py-4 space-y-4">
                <div className="max-w-md">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-600 dark:text-slate-400">
                      Development Amount (₹) <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const sum = milestones.reduce((s, m) => s + (Number(m.amount) || 0), 0);
                        if (sum > 0) {
                          setDevAmount(sum);
                          setMilestones(recalculatePercentages(milestones));
                        }
                      }}
                      className="text-[10px] font-bold text-[#5B4DB7] dark:text-purple-400 hover:underline cursor-pointer flex items-center gap-1"
                      title="Sync total development amount from sum of milestones"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Sync from Milestones ({formatCurrencyINR(milestoneSum)})</span>
                    </button>
                  </div>
                  <input
                    type="number"
                    min={1}
                    required
                    value={devAmount || ''}
                    onChange={e => handleDevAmountChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#5B4DB7] focus:outline-none font-mono"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-[#5B4DB7] dark:text-purple-300 font-bold font-mono">
                      {formatCurrencyINR(devAmount)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Enter total or enter individual milestone amounts below
                    </span>
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">Payment Milestones</span>
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                          totalPct === 100
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                        }`}
                      >
                        {totalPct}%
                      </span>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#5B4DB7]/10 text-[#5B4DB7] dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Sum: {formatCurrencyINR(milestoneSum)}
                      </span>
                      {totalPct !== 100 && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400">
                          — must equal 100%
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={addMilestone}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5B4DB7] dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Milestone</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#5B4DB7]/10 text-[#5B4DB7] dark:text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={m.title}
                          onChange={e => handleMilestoneChange(idx, 'title', e.target.value)}
                          placeholder="Enter milestone deliverable / phase title"
                          className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B4DB7]"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={m.percentage}
                            onChange={e => handleMilestoneChange(idx, 'percentage', e.target.value)}
                            className="w-14 px-2 py-1.5 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B4DB7]"
                            title="Milestone Percentage (%)"
                          />
                          <span className="text-slate-400 text-xs font-bold">%</span>
                        </div>
                        <div className="relative flex items-center w-28 sm:w-36 shrink-0">
                          <span className="absolute left-2.5 text-slate-400 dark:text-slate-500 font-mono font-bold text-xs pointer-events-none select-none">
                            ₹
                          </span>
                          <input
                            type="number"
                            min={0}
                            step={1000}
                            value={m.amount === 0 ? '' : m.amount}
                            onChange={e => handleMilestoneChange(idx, 'amount', e.target.value)}
                            placeholder="Amount (₹)"
                            title="Milestone Amount (₹) — enter amount to calculate final total"
                            className="w-full pl-6 pr-2.5 py-1.5 text-right bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B4DB7]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMilestone(idx)}
                          disabled={milestones.length <= 1}
                          className="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer transition-colors"
                          title="Delete Milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ═══ SECTION 2: Hosting & Infrastructure ═══ */}
          {hostingEnabled && (
            <div className="rounded-xl border-2 border-sky-300/60 dark:border-sky-800/60 overflow-hidden">
              <button type="button" onClick={() => setHostingSectionOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-sky-50/60 dark:bg-sky-950/30 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                    <Server className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-sky-700 dark:text-sky-400 text-xs">Section 2 — Hosting & Infrastructure</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">AWS EC2, Domain, SSL — billed separately per actuals</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sky-700 dark:text-sky-400 text-xs">{formatCurrencyINR(hostingSubtotal)}</span>
                  {hostingSectionOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {hostingSectionOpen && (
                <div className="px-4 py-4 space-y-3">
                  {/* Info note */}
                  <div className="flex items-start gap-2 p-2.5 bg-sky-50 dark:bg-sky-950/30 rounded-lg border border-sky-200 dark:border-sky-800/60">
                    <Info className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                    <textarea rows={2} value={hostingNote} onChange={e => setHostingNote(e.target.value)}
                      className="flex-1 text-[11px] text-sky-800 dark:text-sky-300 bg-transparent resize-none focus:outline-none border-none" />
                  </div>

                  {/* Line items */}
                  <div className="space-y-2">
                    {hostingItems.map(item => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2.5 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        {/* Description */}
                        <div className="col-span-12 sm:col-span-4">
                          <input type="text" value={item.description} onChange={e => updateHostingItem(item.id, 'description', e.target.value)}
                            placeholder="Enter hosting item (e.g. Cloud Server, Domain, SSL)"
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
                        </div>
                        {/* Provider */}
                        <div className="col-span-4 sm:col-span-2">
                          <select value={item.provider} onChange={e => updateHostingItem(item.id, 'provider', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500">
                            {PROVIDERS.map(p => <option key={p}>{p}</option>)}
                          </select>
                        </div>
                        {/* Billing cycle */}
                        <div className="col-span-4 sm:col-span-2">
                          <select value={item.billingCycle} onChange={e => updateHostingItem(item.id, 'billingCycle', e.target.value as any)}
                            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500">
                            {BILLING_CYCLES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                          </select>
                        </div>
                        {/* Unit cost */}
                        <div className="col-span-4 sm:col-span-1">
                          <input type="number" min={0} value={item.unitCost || ''} onChange={e => updateHostingItem(item.id, 'unitCost', Number(e.target.value))}
                            placeholder="Unit cost (₹)"
                            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
                        </div>
                        {/* Qty */}
                        <div className="col-span-3 sm:col-span-1">
                          <input type="number" min={1} value={item.quantity} onChange={e => updateHostingItem(item.id, 'quantity', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-center text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500" />
                        </div>
                        {/* Total */}
                        <div className="col-span-5 sm:col-span-1 text-right font-mono font-bold text-sky-700 dark:text-sky-400 text-xs">
                          {formatCurrencyINR(item.totalCost)}
                        </div>
                        {/* Delete */}
                        <div className="col-span-12 sm:col-span-1 flex justify-end">
                          <button type="button" onClick={() => removeHostingItem(item.id)} className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* Notes (full row) */}
                        <div className="col-span-12">
                          <input type="text" value={item.notes || ''} onChange={e => updateHostingItem(item.id, 'notes', e.target.value)}
                            placeholder="Enter hosting specifications, region, or billing notes"
                            className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-[10px] text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button type="button" onClick={addHostingItem}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /><span>Add Hosting / Infrastructure Item</span>
                    </button>
                    <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 font-mono">
                      Subtotal: {formatCurrencyINR(hostingSubtotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ SECTION 3: Managed Services / AMC ═══ */}
          {servicesEnabled && (
            <div className="rounded-xl border-2 border-emerald-300/60 dark:border-emerald-800/60 overflow-hidden">
              <button type="button" onClick={() => setServicesSectionOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Wrench className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">Section 3 — Managed Services / AMC</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Post-launch support, maintenance & optional managed services</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">{formatCurrencyINR(servicesSubtotal)}</span>
                  {servicesSectionOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {servicesSectionOpen && (
                <div className="px-4 py-4 space-y-3">
                  {/* Info note */}
                  <div className="flex items-start gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                    <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <textarea rows={2} value={servicesNote} onChange={e => setServicesNote(e.target.value)}
                      className="flex-1 text-[11px] text-emerald-800 dark:text-emerald-300 bg-transparent resize-none focus:outline-none border-none" />
                  </div>

                  {/* Line items */}
                  <div className="space-y-2">
                    {servicesItems.map(item => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2.5 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="col-span-12 sm:col-span-5">
                          <input type="text" value={item.description} onChange={e => updateServicesItem(item.id, 'description', e.target.value)}
                            placeholder="Enter managed services / AMC item description"
                            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                        </div>
                        <div className="col-span-5 sm:col-span-2">
                          <select value={item.billingCycle} onChange={e => updateServicesItem(item.id, 'billingCycle', e.target.value as any)}
                            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500">
                            {['monthly', 'quarterly', 'yearly', 'one-time'].map(c => (
                              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <input type="number" min={0} value={item.unitCost || ''} onChange={e => updateServicesItem(item.id, 'unitCost', Number(e.target.value))}
                            placeholder="Unit cost (₹)"
                            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                        </div>
                        <div className="col-span-3 sm:col-span-1 text-center">
                          <input type="number" min={1} value={item.quantity} onChange={e => updateServicesItem(item.id, 'quantity', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-center text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                        </div>
                        <div className="col-span-6 sm:col-span-1 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                          {formatCurrencyINR(item.totalCost)}
                        </div>
                        <div className="col-span-6 sm:col-span-1 flex justify-end">
                          <button type="button" onClick={() => removeServicesItem(item.id)} className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="col-span-12">
                          <input type="text" value={item.notes || ''} onChange={e => updateServicesItem(item.id, 'notes', e.target.value)}
                            placeholder="Enter SLA coverage, inclusions, or contract terms"
                            className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-[10px] text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button type="button" onClick={addServicesItem}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /><span>Add Services / AMC Item</span>
                    </button>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                      Subtotal: {formatCurrencyINR(servicesSubtotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Grand Total Summary */}
          <div className="flex items-stretch gap-3 p-4 bg-gradient-to-r from-[#5B4DB7]/5 to-purple-50/30 dark:from-purple-950/30 dark:to-slate-900/0 rounded-xl border border-[#5B4DB7]/20">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Development Amount:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatCurrencyINR(devAmount)}</span>
              </div>
              {hostingEnabled && (
                <div className="flex justify-between text-xs text-sky-600 dark:text-sky-400">
                  <span>Hosting & Infrastructure:</span>
                  <span className="font-mono font-bold">{formatCurrencyINR(hostingSubtotal)}</span>
                </div>
              )}
              {servicesEnabled && (
                <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
                  <span>Managed Services / AMC:</span>
                  <span className="font-mono font-bold">{formatCurrencyINR(servicesSubtotal)}</span>
                </div>
              )}
              {(hostingEnabled || servicesEnabled) && (
                <div className="border-t border-[#5B4DB7]/20 pt-1 mt-1 flex justify-between font-bold text-xs text-[#5B4DB7] dark:text-purple-300">
                  <span>Grand Total (All Sections):</span>
                  <span className="font-mono text-sm">{formatCurrencyINR(grandTotal)}</span>
                </div>
              )}
            </div>
          </div>

        </form>

        {/* ── Footer ── */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Dev Total: <strong className="text-slate-900 dark:text-white font-mono">{formatCurrencyINR(devAmount)}</strong>
            {(hostingEnabled || servicesEnabled) && (
              <> &bull; Grand: <strong className="text-[#5B4DB7] font-mono">{formatCurrencyINR(grandTotal)}</strong></>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" form="create-proposal-form" disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-[#5B4DB7] hover:bg-[#4D3FA5] text-white transition-all shadow-md shadow-purple-300/30 cursor-pointer disabled:opacity-60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? (isEditMode ? 'Updating...' : 'Generating...') : (isEditMode ? 'Save & Update Proposal' : 'Save & Generate Proposal')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
