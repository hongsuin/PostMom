import { create } from 'zustand';

const DM_COST = 1000;

interface BizMoneyStore {
  balance: number;
  dmsSent: Set<string>;
  charge: (amount: number) => void;
  sendDM: (authorKey: string) => 'success' | 'insufficient' | 'already_sent';
}

export const useBizMoneyStore = create<BizMoneyStore>((set, get) => ({
  balance: 0,
  dmsSent: new Set(),

  charge: (amount) => set((s) => ({ balance: s.balance + amount })),

  sendDM: (authorKey) => {
    const { balance, dmsSent } = get();
    if (dmsSent.has(authorKey)) return 'already_sent';
    if (balance < DM_COST) return 'insufficient';
    set((s) => ({
      balance: s.balance - DM_COST,
      dmsSent: new Set([...s.dmsSent, authorKey]),
    }));
    return 'success';
  },
}));
