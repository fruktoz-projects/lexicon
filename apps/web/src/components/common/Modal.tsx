import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { audio } from '../../services/audio';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        audio.playClickSound();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 bg-[#160F08]/75 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full ${maxWidths[maxWidth]} bg-[#F5EBD4] border-2 border-[#C5A566] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] relative`}
      >
        {/* Top Accent Line */}
        <div className="h-1.5 bg-[#8B5E3C] w-full shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b-2 border-[#C5A566] bg-[#EAD9B8] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B5E3C] flex items-center justify-center text-white border border-[#6B4226] shadow-sm shrink-0">
              <span className="text-base font-monument font-bold">L</span>
            </div>
            <div>
              {title && <h3 className="text-base sm:text-lg font-monument font-bold text-[#1C150D] tracking-wide">{title}</h3>}
              {subtitle && <p className="text-xs text-[#7A6B55] mt-0.5 font-scribe font-semibold">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={() => {
              audio.playClickSound();
              onClose();
            }}
            className="p-2 rounded-xl text-[#7A6B55] hover:text-[#1C150D] hover:bg-[#F5EBD4] border border-[#C5A566] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 bg-[#F5EBD4]">{children}</div>
      </div>
    </div>
  );
};
