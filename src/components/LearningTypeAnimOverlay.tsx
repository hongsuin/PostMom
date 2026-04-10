import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useLearningTypeAnimStore } from '../store/learningTypeAnimStore';
import { LEARNING_TYPES } from '../data/learningTypes';

// Card dimensions for the mini card that flies into the icon
const CARD_W = 114;
const CARD_H = 76;

type AnimPhase = 'idle' | 'init' | 'fly';

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function LearningTypeAnimOverlay() {
  const { pending, mode, animating, setAnimating, clear } = useLearningTypeAnimStore();
  const location = useLocation();
  const [phase, setPhase] = useState<AnimPhase>('idle');
  const [iconCenter, setIconCenter] = useState<{ cx: number; cy: number } | null>(null);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Trigger animation when /academies mounts and a pending type exists ──
  useEffect(() => {
    if (!pending || location.pathname !== '/academies') return;
    if (prefersReducedMotion()) {
      clear();
      return;
    }

    // Measure user icon anchor (now rendered inside UserLayout / SiteHeader)
    const anchor = document.getElementById('user-icon-anchor');
    const r = anchor?.getBoundingClientRect();
    const cx = r ? r.left + r.width / 2 : window.innerWidth - 44;
    const cy = r ? r.top + r.height / 2 : 26;
    setIconCenter({ cx, cy });

    setAnimating(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, pending]);

  // ── Run the two-phase CSS transition once animating becomes true ──
  useEffect(() => {
    if (!animating || !iconCenter) return;

    // Phase 1: snap card to init position (no transition)
    setPhase('init');

    // Phase 2: start CSS transition on next paint (double RAF)
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setPhase('fly');
      });
    });

    // Phase 3: clear overlay after animation finishes
    timerRef.current = setTimeout(() => {
      clear();
      setPhase('idle');
    }, 1900);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animating]);

  if (phase === 'idle' || !pending || !iconCenter) return null;

  const typeData = LEARNING_TYPES[pending];

  // ── Position calculations ──
  // The mini card starts just to the LEFT of the user icon, vertically centred on it.
  // left edge of icon = cx - iconW/2 ≈ cx - 11
  // Card sits 16px to the left of the icon's left edge, centred vertically.
  const startX = iconCenter.cx - 11 - CARD_W - 16;  // card right edge 16px left of icon
  const startY = iconCenter.cy - CARD_H / 2 + 25;   // 48px below nav bar

  // On mobile, startX could go negative — clamp to 8px
  const clampedX = Math.max(8, startX);

  // Fly target: centre of card should end up at icon centre.
  // With transform-origin: center, translate (dx, dy) shifts the centre by (dx, dy).
  const dx = iconCenter.cx - (clampedX + CARD_W / 2);
  const dy = iconCenter.cy - (startY + CARD_H / 2);

  const isFly = phase === 'fly';

  const card = (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: clampedX,
        top: startY,
        width: CARD_W,
        height: CARD_H,
        transformOrigin: 'center center',
        transform: isFly
          ? `translate(${dx}px, ${dy}px) scale(0.05) rotate(${mode === 'save' ? 6 : -4}deg)`
          : 'translate(0,0) scale(1)',
        opacity: isFly ? 0 : 1,
        transition: isFly
          ? [
              'transform 700ms cubic-bezier(0.4, 0, 0.2, 1) 1000ms',
              'opacity 200ms ease 1460ms',
            ].join(', ')
          : 'none',
        zIndex: 9999,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
      className="rounded-2xl bg-white text-slate-800 shadow-xl overflow-hidden"
    >
      <div className="flex items-center justify-center h-full px-4">
        <p className="text-sm font-semibold text-center leading-tight">{typeData.name}</p>
      </div>
    </div>
  );

  return createPortal(card, document.body);
}
