import React from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import {
  Plus,
  Download,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Search,
  Sidebar as SidebarIcon,
  Maximize2,
  Sun,
  Moon,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/navigation';

interface LayoutContext {
  currentUser: UserProfile;
  sidebarTheme: 'dark' | 'light';
  setSidebarTheme: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
}

export const DashboardPage: React.FC = () => {
  const { currentUser, sidebarTheme, setSidebarTheme } = useOutletContext<LayoutContext>();

  return (
    <div className="space-y-6">
      {/* Reusable Page Header with Screenshot Parity */}
      <PageHeader
        title={`Welcome Back, ${currentUser.name}! 👋`}
        description="Here's a summary of your workspace leads, pipelines, and upcoming schedules."
        showDateBadge={true}
        actions={
          <>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
            <Link
              to="/leads/add"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#5B4DB7] hover:bg-[#4E41A2] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Lead</span>
            </Link>
          </>
        }
      />

      {/* CRM Shell Architectural Validation Banner */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#5B4DB7] flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  TechnoKraft B2B CRM Application Shell
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Production Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                The layout shell is designed for high-density B2B operations. It features a collapsible navigation drawer, dynamic breadcrumbs, global CRM search modal, quick-add dropdown, notification center, and role-based access control.
              </p>
            </div>
          </div>

          {/* Quick Interactive Shell Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Sidebar Theme Switcher */}
            <button
              type="button"
              onClick={() =>
                setSidebarTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
              }
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
              title="Toggle sidebar between Dark Navy and White (Screenshot Parity)"
            >
              {sidebarTheme === 'dark' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-purple-600" />
                  <span>Sidebar: Navy Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sidebar: Light</span>
                </>
              )}
            </button>

            {/* Role indicator pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5B4DB7]" />
              <span>Role: {currentUser.role}</span>
            </div>
          </div>
        </div>

        {/* Feature Checkpoints Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
              <SidebarIcon className="w-4 h-4 text-[#5B4DB7]" />
              <h3>Responsive Sidebar</h3>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              250px expanded, 76px icon collapse with hover tooltips, and 280px off-canvas drawer on mobile.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
              <Search className="w-4 h-4 text-[#5B4DB7]" />
              <h3>Global Search (Ctrl+K)</h3>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              Keyboard shortcut activated dialog indexing Leads, Companies, Contacts, Tasks, and Proposals.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-[#5B4DB7]" />
              <h3>RBAC Navigation</h3>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              Dynamically hides or reveals modules (Employees, Settings) based on the current user's profile role.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-1">
              <Maximize2 className="w-4 h-4 text-[#5B4DB7]" />
              <h3>Overflow Guard</h3>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              Main content uses flex min-w-0 container ensuring zero page-level horizontal overflow across all viewports.
            </p>
          </div>
        </div>
      </div>

      {/* Module Slots Demonstration (Placeholder layout showing how future tables/charts will fit) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Placeholder Module Slot 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Module Slot 1
              </span>
              <span className="text-xs font-medium text-[#5B4DB7]">Lead Pipeline</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Future KPI & Metrics Slot
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Reserved container for summary stats, pipeline conversion charts, and team targets.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Container status: Ready</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* Placeholder Module Slot 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Module Slot 2
              </span>
              <span className="text-xs font-medium text-[#5B4DB7]">Communication</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Future Activity Feed Slot
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Reserved container for WhatsApp messages, automated email follow-ups, and call logs.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Container status: Ready</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        {/* Placeholder Module Slot 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Module Slot 3
              </span>
              <span className="text-xs font-medium text-[#5B4DB7]">Activity & Tasks</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Future Follow-ups & Calendar
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Reserved container for client meetings, daily tasks, and proposal dispatch deadlines.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Container status: Ready</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Demonstration of Wide Table Container Handling with Internal Horizontal Scroll */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Table Layout Container Test (Internal Horizontal Scroll Safety)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Demonstrates that wide B2B CRM tables scroll safely within their own container without causing whole-page overflow.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Scroll horizontally on small viewports →
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[700px]">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Lead ID</th>
                <th className="py-3 px-4 font-semibold">Company / Client</th>
                <th className="py-3 px-4 font-semibold">Contact Person</th>
                <th className="py-3 px-4 font-semibold">Pipeline Stage</th>
                <th className="py-3 px-4 font-semibold">Deal Value</th>
                <th className="py-3 px-4 font-semibold">Assigned Manager</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-slate-900">#TK-1082</td>
                <td className="py-3 px-4 font-semibold text-slate-800">ABC Technologies</td>
                <td className="py-3 px-4">Rahul Patil</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium text-[11px]">
                    Proposal
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-900">₹42.5 L</td>
                <td className="py-3 px-4">Manager (Sales)</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium text-[11px]">
                    Pending Follow-up
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-mono font-medium text-slate-900">#TK-1083</td>
                <td className="py-3 px-4 font-semibold text-slate-800">XYZ Solutions Ltd</td>
                <td className="py-3 px-4">Priya Sharma</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium text-[11px]">
                    Interested
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-900">₹18.0 L</td>
                <td className="py-3 px-4">Priya Sharma</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[11px]">
                    Meeting Confirmed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
