import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const TOTAL_STEPS = 5;

interface OnboardingLayoutProps {
  step: number;
  subtitle?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export default function OnboardingLayout({
  step,
  subtitle,
  title,
  description,
  children,
}: OnboardingLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/correctvideo.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 to-white/90" />

      {/* Content */}
      <div className="relative z-10 max-w-lg mx-auto px-5 pt-10 pb-24 overflow-y-auto min-h-screen">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex gap-1.5 mb-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i + 1 <= step ? 'bg-primary' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {step}/{TOTAL_STEPS}
            </p>
            <button
              onClick={() => navigate('/')}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              건너뛰기 →
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          {subtitle && (
            <p className="text-sm text-slate-500 mb-1">{subtitle}</p>
          )}
          <h1 className="font-lora text-2xl font-semibold text-slate-900 leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
