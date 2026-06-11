import type { Profile } from '../types';

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-24 w-24 text-2xl',
} as const;

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export function Avatar({ profile, size = 'sm' }: { profile: Profile; size?: keyof typeof SIZES }) {
  if (profile.avatarUrl) {
    return (
      <img
        src={profile.avatarUrl}
        alt={profile.fullName}
        className={`${SIZES[size]} rounded-full border border-slate-200 object-cover`}
      />
    );
  }
  return (
    <span
      className={`${SIZES[size]} flex items-center justify-center rounded-full bg-cadan-blue-700 font-semibold text-white`}
      title={profile.fullName}
    >
      {initials(profile.fullName)}
    </span>
  );
}
