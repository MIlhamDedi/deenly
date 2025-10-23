import { useAuth } from '@/hooks/useAuth';

export function PersonalStatsBanner() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return null;
  }

  // Show zeros if stats don't exist yet
  const stats = userProfile.stats || {
    currentStreak: 0,
    todayVersesRead: 0,
  };

  // Check if todayDate is actually today
  let displayTodayVerses = 0;
  if (stats.todayDate) {
    const todayDate = stats.todayDate.toDate();
    todayDate.setHours(0, 0, 0, 0);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (todayDate.getTime() === now.getTime()) {
      displayTodayVerses = stats.todayVersesRead || 0;
    }
  }

  const dailyGoal = userProfile.settings?.dailyGoal || 50;

  return (
    <div className="bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-800 dark:to-teal-900 rounded-2xl p-4 md:p-6 shadow-lg">
      {/* Title */}
      <h2 className="text-base md:text-xl font-bold text-white mb-3 md:mb-4">Personal Achievements</h2>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-6">
          {/* Current Streak */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-xl md:text-2xl">🔥</span>
            </div>
            <div>
              <p className="text-xs md:text-sm text-teal-100 dark:text-teal-200">Current Streak</p>
              <p className="text-lg md:text-2xl font-bold text-white">
                {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-12 bg-white/20"></div>

          {/* Today's Verses with Goal - Color Coded */}
          <div className="flex items-center gap-2 md:gap-3">
            {(() => {
              const goalPercentage = dailyGoal > 0 ? (displayTodayVerses / dailyGoal) * 100 : 0;
              const isComplete = goalPercentage >= 100;
              const isHalfway = goalPercentage >= 50;

              return (
                <>
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
                    isComplete
                      ? 'bg-green-500/30'
                      : isHalfway
                      ? 'bg-orange-500/30'
                      : 'bg-red-500/30'
                  }`}>
                    {isComplete ? (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-teal-100 dark:text-teal-200">Today's Verses</p>
                    <p className={`text-lg md:text-2xl font-bold ${
                      isComplete
                        ? 'text-green-200'
                        : isHalfway
                        ? 'text-orange-200'
                        : 'text-red-200'
                    }`}>
                      {displayTodayVerses.toLocaleString()} / {dailyGoal.toLocaleString()}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Motivational message */}
        {stats.currentStreak === 0 && displayTodayVerses === 0 && (
          <div className="hidden lg:block text-white/90 text-sm">
            Start your reading journey today! 📖
          </div>
        )}
        {stats.currentStreak > 0 && (
          <div className="hidden lg:block text-white/90 text-sm">
            {stats.currentStreak === 1 && "Keep going! 💪"}
            {stats.currentStreak >= 2 && stats.currentStreak <= 6 && "You're on fire! 🌟"}
            {stats.currentStreak >= 7 && stats.currentStreak < 30 && "Amazing streak! 🚀"}
            {stats.currentStreak >= 30 && "Masha Allah! 🌙"}
          </div>
        )}
      </div>
    </div>
  );
}
