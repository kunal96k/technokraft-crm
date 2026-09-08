import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="crm-application-footer"
      className="w-full bg-white dark:bg-[#0F172A] border-t border-slate-200/80 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 select-none transition-colors duration-200"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        {/* Left: Copyright */}
        <div>
          <p className="font-normal text-slate-500 dark:text-slate-400">
            © 2026 <span className="font-semibold text-slate-700 dark:text-slate-200">TechnoKraft Services LLP</span>. All rights reserved.
          </p>
        </div>

        {/* Right: Operational Links & App Version */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-slate-500 dark:text-slate-400">
          <button
            type="button"
            className="hover:text-[#5B4DB7] dark:hover:text-purple-400 transition-colors focus:outline-none cursor-pointer"
            onClick={() => console.log('Privacy Policy clicked')}
          >
            Privacy Policy
          </button>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <button
            type="button"
            className="hover:text-[#5B4DB7] dark:hover:text-purple-400 transition-colors focus:outline-none cursor-pointer"
            onClick={() => console.log('Terms of Use clicked')}
          >
            Terms of Use
          </button>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <button
            type="button"
            className="hover:text-[#5B4DB7] dark:hover:text-purple-400 transition-colors focus:outline-none cursor-pointer"
            onClick={() => console.log('Support clicked')}
          >
            Support
          </button>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            v1.0.0
          </span>
        </div>
      </div>
    </footer>
  );
};

