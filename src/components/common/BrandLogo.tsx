import React from 'react';
import { TECHNOKRAFT_LOGO_BASE64 } from '../../assets/brandLogoBase64';
import brandLogoImg from '../../fonts/images/image.png';

interface BrandLogoProps {
  collapsed?: boolean;
  className?: string;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  collapsed = false,
  className = '',
  theme = 'dark',
  size = 'md',
}) => {
  const isDark = theme === 'dark';

  const emblemSize =
    size === 'lg'
      ? 'w-12 h-12 sm:w-14 sm:h-14'
      : size === 'sm'
      ? 'w-8 h-8 sm:w-8.5 sm:h-8.5'
      : 'w-9.5 h-9.5 sm:w-10 sm:h-10';

  const titleSize =
    size === 'lg'
      ? 'text-[20px] sm:text-[23px]'
      : size === 'sm'
      ? 'text-[13px] sm:text-[14px]'
      : 'text-[14.5px] sm:text-[15.5px]';

  const subtitleSize =
    size === 'lg'
      ? 'text-[12.5px] sm:text-[13.5px]'
      : size === 'sm'
      ? 'text-[9.5px] sm:text-[10px]'
      : 'text-[10.5px] sm:text-[11px]';

  return (
    <div
      id="brand-logo-container"
      className={`flex items-center gap-1 select-none transition-all duration-200 ${
        collapsed ? 'justify-center w-full px-1' : 'px-0'
      } ${className}`}
    >
      {/* Red Triangular TTS Logo Emblem */}
      <div className={`relative flex-shrink-0 ${emblemSize} flex items-center justify-center transition-transform duration-200 hover:scale-105`}>
        <img
          src={TECHNOKRAFT_LOGO_BASE64 || brandLogoImg}
          alt="TechnoKraft Emblem"
          className="w-full h-full object-contain transform -translate-y-1"
        />
      </div>

      {/* Brand Text: TechnoKraft in Neuropol + right-aligned Services LLP */}
      {!collapsed && (
        <div className="flex flex-col min-w-0 transition-opacity duration-200 justify-center">
          <span
            className={`font-brand ${titleSize} tracking-wide leading-none transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-[#181C20]'
            }`}
          >
            TechnoKraft
          </span>
          <span
            className={`font-sans font-bold ${subtitleSize} tracking-tight text-right self-end mt-0.5 transition-colors duration-200 ${
              isDark ? 'text-slate-100' : 'text-[#181C20]'
            }`}
          >
            Services LLP
          </span>
        </div>
      )}
    </div>
  );
};
