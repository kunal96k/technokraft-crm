/**
 * Utility to extract clean initials and avatar styles for users/employees
 */
export const getInitials = (name?: string, avatar?: string): string => {
  if (avatar && avatar.trim().length > 0) {
    return avatar.trim();
  }
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
};

export const getAvatarColor = (name?: string): { bg: string; text: string; border: string } => {
  const colors = [
    {
      bg: 'bg-purple-100 dark:bg-purple-950/70',
      text: 'text-[#5B4DB7] dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
    },
    {
      bg: 'bg-sky-100 dark:bg-sky-950/70',
      text: 'text-sky-700 dark:text-sky-300',
      border: 'border-sky-200 dark:border-sky-800',
    },
    {
      bg: 'bg-emerald-100 dark:bg-emerald-950/70',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      bg: 'bg-amber-100 dark:bg-amber-950/70',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
    },
    {
      bg: 'bg-indigo-100 dark:bg-indigo-950/70',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200 dark:border-indigo-800',
    },
    {
      bg: 'bg-rose-100 dark:bg-rose-950/70',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
    },
  ];

  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
