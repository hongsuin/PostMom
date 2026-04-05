import { Outlet } from 'react-router-dom';
import SiteHeader from './SiteHeader';

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
