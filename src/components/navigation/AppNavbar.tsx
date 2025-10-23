import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { HamburgerMenu } from './HamburgerMenu';
import { NotificationsDropdown } from './NotificationsDropdown';

interface AppNavbarProps {
  onOpenSettings: () => void;
}

export function AppNavbar({ onOpenSettings }: AppNavbarProps) {
  const { userProfile } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-teal-900 to-teal-800 dark:from-gray-900 dark:to-gray-800 shadow-lg border-b border-teal-700 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo & App Name */}
          <Link
            to="/app"
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="Deenly"
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">Deenly</h1>
              <p className="text-xs sm:text-sm text-gold-200 dark:text-gray-400 hidden sm:block">
                Welcome back, {userProfile?.displayName}!
              </p>
            </div>
          </Link>

          {/* Right Side: Notifications + Menu */}
          <div className="flex items-center gap-2">
            <NotificationsDropdown />
            <HamburgerMenu onOpenSettings={onOpenSettings} />
          </div>
        </div>
      </div>
    </header>
  );
}
