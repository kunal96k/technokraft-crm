import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  MoreVertical,
  Eye,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { FollowUpRecord } from '../../types/followUps';

interface FollowUpActionMenuProps {
  followUp: FollowUpRecord;
  onOpenDetails: (item: FollowUpRecord) => void;
  onOpenComplete: (item: FollowUpRecord) => void;
  onOpenReschedule: (item: FollowUpRecord) => void;
  onCancel: (id: string) => void;
}

export const FollowUpActionMenu: React.FC<FollowUpActionMenuProps> = ({
  followUp,
  onOpenDetails,
  onOpenComplete,
  onOpenReschedule,
  onCancel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 180;
    const menuHeight = followUp.status === 'COMPLETED' ? 140 : 200;

    // Check if there is enough space below the button in the viewport
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldOpenUpwards = spaceBelow < menuHeight && rect.top > menuHeight;

    const top = shouldOpenUpwards ? rect.top - menuHeight : rect.bottom + 4;
    const left = Math.max(10, rect.right - menuWidth);

    setMenuStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 9999,
      width: `${menuWidth}px`,
    });
  }, [followUp.status]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      calculatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5B4DB7]/30 cursor-pointer ${
          isOpen ? 'bg-slate-100 dark:bg-slate-800 text-[#5B4DB7] dark:text-purple-400 ring-2 ring-[#5B4DB7]/20' : ''
        }`}
        aria-label="Follow-up actions"
        title="More actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 animate-in fade-in zoom-in-95 duration-150 select-none text-left text-xs"
          >
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenDetails(followUp);
              }}
              className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#5B4DB7] dark:hover:text-purple-300 text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>View Details</span>
            </button>

            {followUp.status !== 'COMPLETED' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenComplete(followUp);
                  }}
                  className="w-full px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenReschedule(followUp);
                  }}
                  className="w-full px-3 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-[#5B4DB7] dark:text-purple-300 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reschedule</span>
                </button>
              </>
            )}

            {followUp.leadId && (
              <Link
                to={`/leads/${followUp.leadId}`}
                onClick={() => setIsOpen(false)}
                className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#5B4DB7] dark:hover:text-purple-300 text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>Open Lead</span>
              </Link>
            )}

            {followUp.status !== 'CANCELLED' && (
              <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onCancel(followUp.id);
                  }}
                  className="w-full px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 cursor-pointer transition-colors font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancel Follow-up</span>
                </button>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
};
