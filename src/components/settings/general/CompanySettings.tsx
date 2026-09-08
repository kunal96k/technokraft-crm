import React, { useState } from 'react';
import { Building, Upload, Check, Globe, Phone, Mail, MapPin, Clock, DollarSign, Image } from 'lucide-react';
import { CompanySettingsData } from '../../../types/settings';

interface CompanySettingsProps {
  data: CompanySettingsData;
  onChange: (updated: CompanySettingsData) => void;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({ data, onChange }) => {
  const [logoPreview, setLogoPreview] = useState<string>(data.logoUrl);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        onChange({ ...data, logoUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Company Information
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          General corporate identity, headquarters address, and default localization.
        </p>
      </div>

      {/* Company Logo Section */}
      <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-xs overflow-hidden border border-purple-500/30">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="tracking-wider">TK</span>
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              Company Brandmark
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Used in customer emails, generated PDF proposals, and system invoices.
            </p>
            <span className="text-[10px] text-slate-400 font-mono">
              Recommended: PNG or SVG with transparent background (max 2MB)
            </span>
          </div>
        </div>

        <div>
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs transition-colors">
            <Upload className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Upload New Logo
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Corporate Details Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Company Legal Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.companyName}
              onChange={(e) => onChange({ ...data, companyName: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Official Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={data.companyEmail}
              onChange={(e) => onChange({ ...data, companyEmail: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Corporate Phone Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.companyPhone}
              onChange={(e) => onChange({ ...data, companyPhone: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Corporate Website URL
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.website}
              onChange={(e) => onChange({ ...data, website: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Address */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Headquarters Office Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={data.address}
              onChange={(e) => onChange({ ...data, address: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            City
          </label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            State / Province
          </label>
          <input
            type="text"
            value={data.state}
            onChange={(e) => onChange({ ...data, state: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Country
          </label>
          <input
            type="text"
            value={data.country}
            onChange={(e) => onChange({ ...data, country: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Default Timezone
          </label>
          <div className="relative">
            <select
              value={data.timezone}
              onChange={(e) => onChange({ ...data, timezone: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST - UTC+04:00)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT - UTC+08:00)</option>
            </select>
            <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            System Currency
          </label>
          <div className="relative">
            <select
              value={data.currency}
              onChange={(e) => onChange({ ...data, currency: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="INR (₹)">Indian Rupee (INR ₹)</option>
              <option value="USD ($)">US Dollar (USD $)</option>
              <option value="EUR (€)">Euro (EUR €)</option>
              <option value="GBP (£)">British Pound (GBP £)</option>
              <option value="AED (د.إ)">UAE Dirham (AED)</option>
            </select>
            <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Date Format
          </label>
          <select
            value={data.dateFormat}
            onChange={(e) => onChange({ ...data, dateFormat: e.target.value })}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 07/09/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/07/2026)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
            <option value="DD MMM YYYY">DD MMM YYYY (e.g. 07 Sep 2026)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
