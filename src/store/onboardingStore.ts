import { create } from 'zustand';

/** Priority keys for AI engine - must match backend */
export type PriorityKey =
  | 'fun_enjoyment'
  | 'skill_improvement'
  | 'grade_test_performance'
  | 'teacher_kindness_passion'
  | 'detailed_feedback'
  | 'structured_curriculum'
  | 'confidence_interest'
  | 'personalized_teaching';

export interface OnboardingData {
  // Step 1: Child Profile
  childGrade: '' | 'elementary' | 'middle' | 'high';
  englishLevel: '' | 'beginner' | 'average' | 'advanced';
  difficulties: string[];

  // Step 2: Priorities (ordered top 3 → converted to weights)
  priorities: PriorityKey[];

  // Step 3: Learning Style
  classType: '' | 'small_group' | 'one_on_one' | 'no_preference';
  teachingStyle: '' | 'fun' | 'systematic' | 'balanced';

  // Step 4: Practical Constraints
  budgetRange: string;
  distance: string;

  // Step 5: Trust Trigger
  trustFactor: string;

  // Optional
  childName?: string;
}

export interface WeightedSignals {
  [key: string]: number;
}

interface OnboardingStore {
  step: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  updateData: (data: Partial<OnboardingData>) => void;
  reset: () => void;
  /** Convert priorities to weights for AI: 1st=0.5, 2nd=0.3, 3rd=0.2 */
  getWeightedSignals: () => WeightedSignals;
  /** Full JSON payload for AI comparison engine */
  getAIPayload: () => Record<string, unknown>;
}

const initialData: OnboardingData = {
  childGrade: '',
  englishLevel: '',
  difficulties: [],
  priorities: [],
  classType: '',
  teachingStyle: '',
  budgetRange: '',
  distance: '',
  trustFactor: '',
};

const WEIGHTS = [0.5, 0.3, 0.2];

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  step: 1,
  data: initialData,
  setStep: (step) => set({ step }),
  updateData: (data) =>
    set((state) => ({ data: { ...state.data, ...data } })),
  reset: () => set({ step: 1, data: initialData }),

  getWeightedSignals: () => {
    const { priorities } = get().data;
    const signals: WeightedSignals = {};
    priorities.forEach((key, i) => {
      signals[key] = WEIGHTS[i] ?? 0;
    });
    return signals;
  },

  getAIPayload: () => {
    const { data } = get();
    return {
      child_profile: {
        grade: data.childGrade,
        english_level: data.englishLevel,
        difficulties: data.difficulties,
      },
      weighted_signals: get().getWeightedSignals(),
      learning_style: {
        class_type: data.classType,
        teaching_style: data.teachingStyle,
      },
      constraints: {
        budget: data.budgetRange,
        distance: data.distance,
      },
      trust_factor: data.trustFactor,
      metadata: {
        source: 'postmom_onboarding',
        version: '1.0',
      },
    };
  },
}));
