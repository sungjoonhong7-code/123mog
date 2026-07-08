"use client";

import { useT } from "@/lib/LangContext";
import { useTheme } from "@/lib/ThemeContext";

export function LangToggle() {
  const { lang, setLang } = useT();

  return (
    <button
      onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
      className="px-2 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      {lang === 'ko' ? 'EN' : '한글'}
    </button>
  );
}

export function NavBar() {
  const { t, lang, setLang } = useT();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥗</span>
            <a href="/dashboard" className="text-xl font-bold text-emerald-600">123MOG</a>
          </div>
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors">
              {t.nav.dashboard}
            </a>
            <a href="/meals" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors">
              {t.nav.meals}
            </a>
            <a href="/profile" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors">
              {t.nav.profile}
            </a>
            <button
              onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
              className="px-2 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {lang === 'ko' ? 'EN' : '한글'}
            </button>
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="px-2 py-1 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
