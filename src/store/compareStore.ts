import { create } from 'zustand';
import type { Academy } from '../data/mockData';

interface CompareStore {
  selectedIds: string[];
  selectedAcademies: Academy[];
  setSelected: (ids: string[], academies: Academy[]) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareStore>((set) => ({
  selectedIds: [],
  selectedAcademies: [],
  setSelected: (ids, academies) => set({ selectedIds: ids, selectedAcademies: academies }),
  clear: () => set({ selectedIds: [], selectedAcademies: [] }),
}));
