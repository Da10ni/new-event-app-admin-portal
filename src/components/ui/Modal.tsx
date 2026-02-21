import type { ReactNode } from 'react';
import { useEffect, useCallback } from 'react';
import { MdClose } from 'react-icons/md';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  children: ReactNode;
  footer?: ReactNode;
  closeOnOverlay?: boolean;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
};

const Modal = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  closeOnOverlay = true,
}: ModalProps) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
      />

      {/* Modal Content */}
      <div
        className={`
          relative w-full ${sizeStyles[size]} bg-white rounded-2xl shadow-modal
          animate-slide-up max-h-[90vh] flex flex-col
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 flex-shrink-0">
            <h2 className="text-lg font-semibold text-neutral-600">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
