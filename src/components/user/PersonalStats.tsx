import { useAuth } from '@/hooks/useAuth';

export function PersonalStats() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return null;
  }

  // Show zeros if stats don't exist yet
  const stats = userProfile.stats || {
    currentStreak: 0,
    longestStreak: 0,
    totalVersesRead: 0,
    totalReadings: 0,
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your Personal Stats</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Keep your streak going!</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current Streak */}
        <div className="bg-white dark:bg-gray-700 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-600">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {stats.currentStreak}
            <span className="text-base ml-1">🔥</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Current Streak</p>
        </div>

        {/* Longest Streak */}
        <div className="bg-white dark:bg-gray-700 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-600">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {stats.longestStreak}
            <span className="text-base ml-1">🏆</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Best Streak</p>
        </div>

        {/* Total Verses Read */}
        <div className="bg-white dark:bg-gray-700 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-600">
          <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-1">
            {stats.totalVersesRead.toLocaleString()}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Verses</p>
        </div>

        {/* Total Readings */}
        <div className="bg-white dark:bg-gray-700 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-600">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {stats.totalReadings}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Readings</p>
        </div>
      </div>

      {/* Streak Motivation Message */}
      {stats.currentStreak > 0 && (
        <div className="mt-4 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-3">
          <p className="text-sm text-center font-medium text-orange-700 dark:text-orange-400">
            {stats.currentStreak === 1 && "Great start! Keep going tomorrow! 💪"}
            {stats.currentStreak >= 2 && stats.currentStreak <= 6 && `${stats.currentStreak} days strong! Keep it up! 🌟`}
            {stats.currentStreak === 7 && "One week streak! Masha Allah! 🎉"}
            {stats.currentStreak > 7 && stats.currentStreak < 30 && `Amazing! ${stats.currentStreak} days in a row! 🚀`}
            {stats.currentStreak === 30 && "30-day streak! Incredible dedication! 🌙"}
            {stats.currentStreak > 30 && `Unstoppable! ${stats.currentStreak} days! Masha Allah! ✨`}
          </p>
        </div>
      )}
    </div>
  );
}
