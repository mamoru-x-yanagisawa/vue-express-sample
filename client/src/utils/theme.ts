const STORAGE_KEY = 'app-settings';

export type Theme = 'light' | 'dark' | 'auto';

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function loadAndApplyTheme(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const settings = JSON.parse(raw);
      if (settings.theme) applyTheme(settings.theme);
    }
  } catch {
    // ignore
  }
}
