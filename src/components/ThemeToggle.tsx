import { Component } from 'solid-js';
import { themeStore } from '../stores/themeStore';

const SunIcon: Component = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.536 4.464l-1.414 1.414M5.878 14.122l-1.414 1.414M15.536 15.536l-1.414-1.414M5.878 5.878L4.464 4.464" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
);

const MoonIcon: Component = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
  </svg>
);

const ThemeToggle: Component = () => {
  const isDark = () => themeStore.isDark();

  return (
    <button
      onClick={themeStore.toggleTheme}
      class="no-drag p-2 rounded-lg hover-highlight transition-colors duration-150 text-macos-text-secondary hover:text-macos-text"
      title={isDark() ? "Passer au thème clair" : "Passer au thème sombre"}
    >
      {isDark() ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};

export default ThemeToggle;