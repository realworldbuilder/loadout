'use client';

import { useEffect, useState } from 'react';
import { X, RotateCcw } from 'lucide-react';

interface DraftRestoredToastProps {
  show: boolean;
  onClose: () => void;
  onUndo?: () => void;
  message?: string;
  duration?: number;
}

export default function DraftRestoredToast({ 
  show, 
  onClose, 
  onUndo, 
  message = "Draft restored from previous session",
  duration = 5000 
}: DraftRestoredToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm bg-[#111] border border-emerald-500/30 rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center mt-0.5">
          <RotateCcw size={12} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium lowercase">
            {message}
          </p>
          <p className="text-xs text-white/60 mt-1 lowercase">
            your work was automatically saved
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {onUndo && (
            <button
              onClick={() => {
                onUndo();
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-500/10 transition-colors lowercase"
            >
              undo
            </button>
          )}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-white/40 hover:text-white/60 p-1 rounded hover:bg-white/5 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}