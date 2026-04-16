import { create } from 'zustand';
import type { TypeKey } from '../data/learningTypes';

interface LearningTypeAnimStore {
  /** Set when save/skip is clicked. Cleared after animation ends. */
  pending: TypeKey | null;
  mode: 'save' | 'skip';
  animating: boolean;
  setPending: (typeKey: TypeKey, mode: 'save' | 'skip') => void;
  setAnimating: (v: boolean) => void;
  clear: () => void;
}

export const useLearningTypeAnimStore = create<LearningTypeAnimStore>((set) => ({
  pending: null,
  mode: 'save',
  animating: false,
  setPending: (typeKey, mode) => set({ pending: typeKey, mode, animating: false }),
  setAnimating: (v) => set({ animating: v }),
  clear: () => set({ pending: null, animating: false }),
}));
