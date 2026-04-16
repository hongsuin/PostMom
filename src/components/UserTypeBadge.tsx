import type { UserType } from '../types/user';

interface UserTypeBadgeProps {
  userType?: UserType;
  size?: 'sm' | 'md';
}

const BADGE_CONFIG = {
  parent: {
    label: '학부모',
    style: 'bg-blue-50 text-blue-600 border border-blue-200',
  },
  academy: {
    label: '학원',
    style: 'bg-amber-50 text-amber-600 border border-amber-200',
  },
} as const;

export default function UserTypeBadge({ userType, size = 'sm' }: UserTypeBadgeProps) {
  if (!userType || userType === 'student') return null;

  const config = BADGE_CONFIG[userType];
  const sizeClass = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.style}`}
    >
      {config.label}
    </span>
  );
}
