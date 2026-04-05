import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/Home';
import AcademyList from './pages/AcademyList';
import AcademyDetail from './pages/AcademyDetail';
import AICompare from './pages/AICompare';
import AICompareResult from './pages/AICompareResult';
import CommunityHome from './pages/CommunityHome';
import CommunityPost from './pages/CommunityPost';
import ConsultRequest from './pages/ConsultRequest';
import LevelTestRequest from './pages/LevelTestRequest';
import ConsultComplete from './pages/ConsultComplete';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyPage from './pages/MyPage';

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

export default function App() {
  return (
    <BrowserRouter>
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
        <Route path="/consult/complete" element={<ConsultComplete />} />
        <Route path="/compare/result" element={<AICompareResult />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="leads" element={<AdminLeadList />} />
          <Route path="leads/:id" element={<AdminLeadDetail />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="credit" element={<AdminCredit />} />
        </Route>

        {/* Landing - no layout */}
        <Route path="/" element={<Home />} />

        {/* User with bottom nav */}
        <Route element={<UserLayout />}>
          <Route path="/academies" element={<AcademyList />} />
          <Route path="/academies/:id" element={<AcademyDetail />} />
          <Route path="/compare" element={<AICompare />} />
          <Route path="/community" element={<CommunityHome />} />
          <Route path="/community/:id" element={<CommunityPost />} />
          <Route path="/consult/:id" element={<ConsultRequest />} />
          <Route path="/leveltest/:id" element={<LevelTestRequest />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
