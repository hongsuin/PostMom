import { getSupabaseBrowserClient } from './supabase';
import type { OnboardingData } from '../store/onboardingStore';

// data 인자 없이 호출하면 session user_metadata에서 직접 읽어 sync
export async function syncUserProfile(data?: Partial<OnboardingData>): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) return;

  const meta = session.user.user_metadata ?? {};
  const ob = (meta.onboarding ?? {}) as Record<string, string>;

  await supabase.from('user_profiles').upsert(
    {
      user_id: session.user.id,
      child_grade: (data?.childGrade ?? ob.childGrade) || null,
      english_level: (data?.englishLevel ?? ob.englishLevel) || null,
      class_type: (data?.classType ?? ob.classType) || null,
      teaching_style: (data?.teachingStyle ?? ob.teachingStyle) || null,
      budget_range: (data?.budgetRange ?? ob.budgetRange) || null,
      distance: (data?.distance ?? ob.distance) || null,
      learning_type: (data?.learningType ?? (meta.learning_type as string)) || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
}
