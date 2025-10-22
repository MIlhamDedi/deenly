import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer"
      aria-label="Toggle theme"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        // Moon icon - click to enable dark mode
        <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/>
        </svg>
      ) : (
        // Sun icon - click to enable light mode
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12,17.5A5.5,5.5,0,1,1,17.5,12,5.51,5.51,0,0,1,12,17.5ZM12,8.5A3.5,3.5,0,1,0,15.5,12,3.5,3.5,0,0,0,12,8.5Zm0-7a1,1,0,0,1,1,1V4.5a1,1,0,0,1-2,0V2.5A1,1,0,0,1,12,1.5Zm0,19a1,1,0,0,1,1,1v2a1,1,0,0,1-2,0v-2A1,1,0,0,1,12,20.5ZM21.5,12a1,1,0,0,1,1,1h2a1,1,0,0,1,0,2h-2a1,1,0,0,1-1-1A1,1,0,0,1,21.5,12Zm-19,0a1,1,0,0,1,1,1H.5a1,1,0,0,1,0-2H3.5A1,1,0,0,1,2.5,12ZM18.36,18.36a1,1,0,0,1,1.41,0l1.42,1.42a1,1,0,0,1-1.42,1.41l-1.41-1.41A1,1,0,0,1,18.36,18.36ZM3.22,3.22a1,1,0,0,1,1.42,0L6.05,4.64A1,1,0,0,1,4.64,6.05L3.22,4.64A1,1,0,0,1,3.22,3.22ZM18.36,5.64a1,1,0,0,1,0-1.42l1.42-1.42a1,1,0,0,1,1.41,1.42L19.78,5.64A1,1,0,0,1,18.36,5.64ZM3.22,20.78a1,1,0,0,1,0-1.42l1.42-1.41a1,1,0,0,1,1.41,1.41l-1.41,1.42A1,1,0,0,1,3.22,20.78Z"/>
        </svg>
      )}
    </button>
  );
}
