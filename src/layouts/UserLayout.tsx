import { Outlet } from 'react-router-dom';
import SiteHeader from './SiteHeader';

export default function UserLayout() {
  return (
    <div className="h-full flex flex-col overflow-y-auto bg-slate-50">
      <SiteHeader />
      <main className="pt-16 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
