import React from 'react';
import brandLogoImg from '../../fonts/images/image.png';

interface BrandLogoProps {
  collapsed?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  collapsed = false,
  className = '',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      id="brand-logo-container"
      className={`flex items-center gap-0.5 select-none transition-all duration-200 transform -translate-y-2 ${collapsed ? 'justify-center w-full px-1' : 'px-0'
        } ${className}`}
    >
      {/* Red Triangular TTS Logo Emblem - moved slightly towards top */}
      <div className="relative flex-shrink-0 w-9.5 h-9.5 sm:w-10 sm:h-10 flex items-center justify-center -mt-1 transition-transform duration-200 hover:scale-105">
        <img
          src={brandLogoImg}
          alt="TechnoKraft Emblem"
          className="w-full h-full object-contain filter drop-shadow-xs"
        />
      </div>

      {/* Brand Text: TechnoKraft in Neuropol + right-aligned Services LLP */}
      {!collapsed && (
        <div className="flex flex-col min-w-0 transition-opacity duration-200 justify-center">
          <span
            className={`font-brand text-[14.5px] sm:text-[15.5px] tracking-wide leading-none transition-colors duration-200 ${isDark ? 'text-white' : 'text-[#181C20]'
              }`}
          >
            TechnoKraft
          </span>
          <span
            className={`font-sans font-bold text-[10.5px] sm:text-[11px] tracking-tight text-right self-end mt-0.5 transition-colors duration-200 ${isDark ? 'text-slate-100' : 'text-[#181C20]'
              }`}
          >
            Services LLP
          </span>
        </div>
      )}
    </div>
  );
};
