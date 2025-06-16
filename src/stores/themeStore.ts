import { createSignal, createEffect } from 'solid-js';
import { preferences, updateTheme } from './preferencesStore';

export type Theme = 'dark' | 'light' | 'auto';

const [theme, setTheme] = createSignal<Theme>('dark');

createEffect(() => {
  const prefs = preferences();
  if (prefs.appearance?.theme) {
    setTheme(prefs.appearance.theme);
  }
});

export const themeStore = {
  theme,
  setTheme: async (newTheme: Theme) => {
    setTheme(newTheme);
    await updateTheme(newTheme);
  },
  toggleTheme: async () => {
    const current = theme();
    let newTheme: Theme;
    
    if (current === 'dark') {
      newTheme = 'light';
    } else if (current === 'light') {
      newTheme = 'dark';
    } else {
      newTheme = 'dark';
    }
    
    setTheme(newTheme);
    await updateTheme(newTheme);
  },
  isDark: () => {
    const current = theme();
    if (current === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return current === 'dark';
  },
  isLight: () => !themeStore.isDark()
};

export default themeStore;