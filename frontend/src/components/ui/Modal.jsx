import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${sizes[size]} bg-luxury-card border border-luxury-border
          rounded-t-2xl sm:rounded-2xl max-h-[90dvh] overflow-hidden animate-slide-up`}
      >
        <div className="flex items-center justify-between p-4 border-b border-luxury-border">
          <h2 className="text-lg font-semibold text-luxury-gold">{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-luxury-border text-gray-400"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(90dvh-64px)]">{children}</div>
      </div>
    </div>
  );
}
