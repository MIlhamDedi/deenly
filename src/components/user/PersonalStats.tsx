import { useAuth } from '@/hooks/useAuth';
import { getStreakStatus } from '@/services/statsService';

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
    lastReadDate: null,
  };

  // Calculate actual streak status
  const { actualStreak, status: streakStatus } = getStreakStatus(
    stats.currentStreak || 0,
    stats.lastReadDate || null
  );

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
        <div className={`bg-white dark:bg-gray-700 rounded-xl p-4 text-center border ${
          streakStatus === 'at-risk'
            ? 'border-orange-400 dark:border-orange-600 ring-2 ring-orange-200 dark:ring-orange-800'
            : 'border-gray-200 dark:border-gray-600'
        }`}>
          <div className={`text-3xl font-bold mb-1 ${
            streakStatus === 'at-risk'
              ? 'text-orange-600 dark:text-orange-400'
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {actualStreak}
            <span className="text-base ml-1">
              {streakStatus === 'at-risk' ? '⚠️' : '🔥'}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Current Streak
            {streakStatus === 'at-risk' && (
              <span className="block text-orange-600 dark:text-orange-400 font-semibold mt-1">At Risk!</span>
            )}
          </p>
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
      {streakStatus === 'at-risk' && (
        <div className="mt-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-600 rounded-xl p-3">
          <p className="text-sm text-center font-bold text-orange-700 dark:text-orange-300">
            ⏰ Don't lose your {actualStreak}-day streak! Read today to keep it alive!
          </p>
        </div>
      )}
      {streakStatus === 'active' && actualStreak > 0 && (
        <div className="mt-4 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-3">
          <p className="text-sm text-center font-medium text-orange-700 dark:text-orange-400">
            {actualStreak === 1 && "Great start! Keep going tomorrow! 💪"}
            {actualStreak >= 2 && actualStreak <= 6 && `${actualStreak} days strong! Keep it up! 🌟`}
            {actualStreak === 7 && "One week streak! Masha Allah! 🎉"}
            {actualStreak > 7 && actualStreak < 30 && `Amazing! ${actualStreak} days in a row! 🚀`}
            {actualStreak === 30 && "30-day streak! Incredible dedication! 🌙"}
            {actualStreak > 30 && `Unstoppable! ${actualStreak} days! Masha Allah! ✨`}
          </p>
        </div>
      )}
    </div>
  );
}
