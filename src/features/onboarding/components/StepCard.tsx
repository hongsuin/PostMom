import type { ReactNode } from 'react';

interface StepCardProps {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

export default function StepCard({
  selected,
  onClick,
  children,
  className = '',
}: StepCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200
        hover:border-primary/50 hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-primary/30
        ${selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-slate-200 bg-white'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}
