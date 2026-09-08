import React from 'react';
import { Sliders, User, Tag, Calendar, Clock, DollarSign } from 'lucide-react';
import { CrmPreferencesData } from '../../../types/settings';
import { INITIAL_EMPLOYEES } from '../../../data/mockEmployees';

interface CRMSettingsProps {
  data: CrmPreferencesData;
  onChange: (updated: CrmPreferencesData) => void;
}

export const CRMSettings: React.FC<CRMSettingsProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          CRM Preferences
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Default baseline values applied to incoming leads, newly created opportunities and pipeline forecasting.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Default Lead Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Default Inbound Lead Status
          </label>
          <div className="relative">
            <select
              value={data.defaultLeadStatus}
              onChange={(e) => onChange({ ...data, defaultLeadStatus: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="New">New (Fresh inbound)</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Qualified">Qualified</option>
            </select>
            <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Assigned automatically to leads imported via CSV or captured from website forms.
          </p>
        </div>

        {/* Default Lead Owner */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Default Lead Owner / Fallback Assignee
          </label>
          <div className="relative">
            <select
              value={data.defaultLeadOwner}
              onChange={(e) => onChange({ ...data, defaultLeadOwner: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              {INITIAL_EMPLOYEES.map((emp) => (
                <option key={emp.id} value={emp.name}>
                  {emp.name} ({emp.role})
                </option>
              ))}
            </select>
            <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Referred when round-robin routing rules are inactive or unassigned.
          </p>
        </div>

        {/* Default Opportunity Stage */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Default Opportunity Stage
          </label>
          <div className="relative">
            <select
              value={data.defaultOpportunityStage}
              onChange={(e) => onChange({ ...data, defaultOpportunityStage: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="Qualified">Qualified (Initial discovery)</option>
              <option value="Requirement Received">Requirement Received</option>
              <option value="Proposal">Proposal</option>
            </select>
            <Sliders className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Stage selected upon converting a qualified lead to an opportunity deal.
          </p>
        </div>

        {/* Default Currency */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Default Deal Currency
          </label>
          <div className="relative">
            <select
              value={data.defaultCurrency}
              onChange={(e) => onChange({ ...data, defaultCurrency: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="INR (₹)">INR ₹ (Indian Rupee)</option>
              <option value="USD ($)">USD $ (United States Dollar)</option>
              <option value="EUR (€)">EUR € (Euro)</option>
              <option value="AED">AED (UAE Dirham)</option>
            </select>
            <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Standard currency symbol and formatting for pipeline valuations and commercial proposals.
          </p>
        </div>

        {/* Date Format */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Default Date Display
          </label>
          <div className="relative">
            <select
              value={data.defaultDateFormat}
              onChange={(e) => onChange({ ...data, defaultDateFormat: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            System Operating Timezone
          </label>
          <div className="relative">
            <select
              value={data.defaultTimezone}
              onChange={(e) => onChange({ ...data, defaultTimezone: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="America/New_York">America/New_York (EST)</option>
            </select>
            <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
};
