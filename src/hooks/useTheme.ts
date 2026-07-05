import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('upkeep-theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('upkeep-theme', theme);
}

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export const useTheme = create<ThemeStore>((set) => ({
  theme: initialTheme,
  toggleTheme: () =>
    set((state) => {
      const next: Theme = state.theme === 'light' ? 'dark' : 'light';
      applyTheme(next);
      return { theme: next };
    }),
  setTheme: (theme: Theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
