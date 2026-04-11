import { create } from 'zustand';
import { getSupabaseBrowserClient } from '../lib/supabase';

export interface Consultation {
  id?: string;
  academyId: string;
  academyName: string;
  parentName: string;
  phone: string;
  grade: string;
  message?: string;
  requestType: '상담' | '레벨테스트';
  status?: '신규' | '진행중' | '완료';
  createdAt?: string;
}

interface ConsultationStore {
  myConsultations: Consultation[];
  loading: boolean;

  addConsultation: (consultation: Consultation, userId?: string) => Promise<void>;
  fetchMyConsultations: (userId: string) => Promise<void>;
}

export const useConsultationStore = create<ConsultationStore>((set) => ({
  myConsultations: [],
  loading: false,

  addConsultation: async (consultation, userId) => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('consultations')
      .insert({
        user_id: userId ?? null,
        academy_id: consultation.academyId,
        academy_name: consultation.academyName,
        parent_name: consultation.parentName,
        phone: consultation.phone,
        grade: consultation.grade,
        message: consultation.message ?? null,
        request_type: consultation.requestType,
        status: '신규',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (data) {
      const saved: Consultation = {
        id: data.id as string,
        academyId: data.academy_id as string,
        academyName: data.academy_name as string,
        parentName: data.parent_name as string,
        phone: data.phone as string,
        grade: data.grade as string,
        message: data.message as string | undefined,
        requestType: data.request_type as '상담' | '레벨테스트',
        status: data.status as '신규' | '진행중' | '완료',
        createdAt: data.created_at as string,
      };
      set((s) => ({ myConsultations: [saved, ...s.myConsultations] }));
    }
  },

  fetchMyConsultations: async (userId) => {
    set({ loading: true });
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const list: Consultation[] = data.map((r) => ({
        id: r.id as string,
        academyId: r.academy_id as string,
        academyName: r.academy_name as string,
        parentName: r.parent_name as string,
        phone: r.phone as string,
        grade: r.grade as string,
        message: r.message as string | undefined,
        requestType: r.request_type as '상담' | '레벨테스트',
        status: r.status as '신규' | '진행중' | '완료',
        createdAt: r.created_at as string,
      }));
      set({ myConsultations: list, loading: false });
    } else {
      set({ loading: false });
      if (error) console.error('[consultationStore] fetchMyConsultations error:', error.message);
    }
  },
}));
