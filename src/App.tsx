import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './lib/supabase';
import { useOnboardingStore } from './store/onboardingStore';
import type { OnboardingData, PriorityKey } from './store/onboardingStore';
import type { TypeKey } from './data/learningTypes';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function loadOnboardingFromSession(
  session: Session | null,
  updateData: (d: Partial<OnboardingData>) => void,
  reset: () => void,
) {
  if (!session?.user) {
    reset();
    return;
  }
  const meta = session.user.user_metadata ?? {};
  const ob = (meta.onboarding ?? {}) as Record<string, unknown>;

  updateData({
    learningType: (meta.learning_type as TypeKey) ?? '',
    childGrade: (ob.childGrade as OnboardingData['childGrade']) ?? '',
    englishLevel: (ob.englishLevel as OnboardingData['englishLevel']) ?? '',
    difficulties: (ob.difficulties as string[]) ?? [],
    priorities: (ob.priorities as PriorityKey[]) ?? [],
    classType: (ob.classType as OnboardingData['classType']) ?? '',
    teachingStyle: (ob.teachingStyle as OnboardingData['teachingStyle']) ?? '',
    budgetRange: (ob.budgetRange as string) ?? '',
    distance: (ob.distance as string) ?? '',
    trustFactor: (ob.trustFactor as string) ?? '',
  });
}

function LearningTypeLoader() {
  const { updateData, reset } = useOnboardingStore();
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    // 초기 세션 즉시 복원
    supabase.auth.getSession().then(({ data }) => {
      loadOnboardingFromSession(data.session, updateData, reset);
    });
    // 로그인/로그아웃 시 동기화
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadOnboardingFromSession(session, updateData, reset);
    });
    return () => subscription.unsubscribe();
  }, []);
  return null;
}
import LearningTypeAnimOverlay from './components/LearningTypeAnimOverlay';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/Home';
import AcademyList from './pages/AcademyList';
import AcademyDetail from './pages/AcademyDetail';
import AICompare from './pages/AICompare';
import AICompareResult from './pages/AICompareResult';
import CommunityHome from './pages/CommunityHome';
import CommunityPost from './pages/CommunityPost';
import CommunityWrite from './pages/CommunityWrite';
import ConsultRequest from './pages/ConsultRequest';
import LevelTestRequest from './pages/LevelTestRequest';
import ConsultComplete from './pages/ConsultComplete';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyPage from './pages/MyPage';
import MyConsultations from './pages/MyConsultations';
import AuthCallback from './pages/AuthCallback';
import LearningTypeTest from './pages/LearningTypeTest';
import AiChat from './pages/AiChat';

import OnboardingStep1 from './features/onboarding/pages/OnboardingStep1';
import OnboardingStep2 from './features/onboarding/pages/OnboardingStep2';
import OnboardingStep3 from './features/onboarding/pages/OnboardingStep3';
import OnboardingStep4 from './features/onboarding/pages/OnboardingStep4';
import OnboardingStep5 from './features/onboarding/pages/OnboardingStep5';
import OnboardingLoading from './features/onboarding/pages/OnboardingLoading';

import AdminDashboard from './features/admin/pages/AdminDashboard';
import AdminLeadList from './features/admin/pages/AdminLeadList';
import AdminLeadDetail from './features/admin/pages/AdminLeadDetail';
import AdminProfile from './features/admin/pages/AdminProfile';
import AdminCredit from './features/admin/pages/AdminCredit';
import AdminPreview from './features/admin/pages/AdminPreview';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <LearningTypeLoader />
      <Routes>
        {/* Onboarding - no bottom nav */}
        <Route path="/onboarding/1" element={<OnboardingStep1 />} />
        <Route path="/onboarding/2" element={<OnboardingStep2 />} />
        <Route path="/onboarding/3" element={<OnboardingStep3 />} />
        <Route path="/onboarding/4" element={<OnboardingStep4 />} />
        <Route path="/onboarding/5" element={<OnboardingStep5 />} />
        <Route path="/onboarding/loading" element={<OnboardingLoading />} />

        {/* Auth - no layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/learning-test" element={<LearningTypeTest />} />
        <Route path="/consult/complete" element={<ConsultComplete />} />
        <Route path="/ai-chat" element={<AiChat />} />
        <Route path="/compare/result" element={<AICompareResult />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="leads" element={<AdminLeadList />} />
          <Route path="leads/:id" element={<AdminLeadDetail />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="credit" element={<AdminCredit />} />
          <Route path="preview" element={<AdminPreview />} />
        </Route>

        {/* Landing - no layout */}
        <Route path="/" element={<Home />} />

        {/* User with bottom nav */}
        <Route element={<UserLayout />}>

          <Route path="/academies" element={<AcademyList />} />
          <Route path="/academies/:id" element={<AcademyDetail />} />
          <Route path="/compare" element={<AICompare />} />
          <Route path="/community" element={<CommunityHome />} />
          <Route path="/community/write" element={<CommunityWrite />} />
          <Route path="/community/:id/edit" element={<CommunityWrite />} />
          <Route path="/community/:id" element={<CommunityPost />} />
          <Route path="/consult/:id" element={<ConsultRequest />} />
          <Route path="/leveltest/:id" element={<LevelTestRequest />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/consultations" element={<MyConsultations />} />
        </Route>
      </Routes>
      {/* Global overlay — persists across route transitions for learning type animation */}
      <LearningTypeAnimOverlay />
    </BrowserRouter>
  );
}
