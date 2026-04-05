import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export default function Header({ title, showBack = false, rightElement }: HeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-primary/20 bg-white/80 px-5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => navigate(-1)} className="-ml-1 p-1.5 hover:bg-primary/10 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-700" />
          </button>
        )}
        {title && (
          <span className="font-semibold text-slate-900">{title}</span>
        )}
        {!title && !showBack && (
          <Link to="/" className="font-lora text-xl font-medium tracking-tight text-primary">
            PostMom
          </Link>
        )}
      </div>
      {rightElement && <div>{rightElement}</div>}
    </header>
  );
}
