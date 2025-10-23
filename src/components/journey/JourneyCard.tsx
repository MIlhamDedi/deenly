import { Journey } from '@/types';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface JourneyCardProps {
  journey: Journey;
}

export function JourneyCard({ journey }: JourneyCardProps) {
  const completionPercentage = journey.stats.completionPercentage || 0;
  const lastActivity = journey.stats.lastActivityAt
    ? formatDistanceToNow(journey.stats.lastActivityAt.toDate(), { addSuffix: true })
    : 'No activity yet';

  // Check if there was activity today and get today's verses count
  const todayInfo = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if todayDate is actually today
    let versesReadToday = 0;
    if (journey.stats.todayDate) {
      const todayDate = journey.stats.todayDate.toDate();
      todayDate.setHours(0, 0, 0, 0);

      if (todayDate.getTime() === today.getTime()) {
        versesReadToday = journey.stats.versesReadToday || 0;
      }
    }

    // Also check lastActivityAt for the activity badge
    const hasActivityToday = journey.stats.lastActivityAt
      ? (() => {
          const lastActivityDate = journey.stats.lastActivityAt.toDate();
          lastActivityDate.setHours(0, 0, 0, 0);
          return lastActivityDate.getTime() === today.getTime();
        })()
      : false;

    return { versesReadToday, hasActivityToday };
  })();

  const { versesReadToday, hasActivityToday } = todayInfo;

  // Calculate target date info if it exists
  const targetDateInfo = journey.targetEndDate
    ? (() => {
        const targetDate = journey.targetEndDate.toDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = targetDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isOverdue = daysRemaining < 0;
        const isCompleted = journey.stats.versesCompleted >= 6236;

        const versesRemaining = 6236 - journey.stats.versesCompleted;
        const dailyVersesNeeded =
          daysRemaining > 0 && !isCompleted
            ? Math.ceil(versesRemaining / daysRemaining)
            : 0;

        return {
          targetDate,
          daysRemaining,
          isOverdue,
          isCompleted,
          dailyVersesNeeded,
        };
      })()
    : null;

  return (
    <Link to={`/journey/${journey.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-teal-100 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 group">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-600 dark:from-teal-800 dark:to-teal-900 p-6 text-white">
          <h3 className="text-xl font-bold mb-1 group-hover:text-gold-200 transition-colors">
            {journey.name}
          </h3>
          {journey.description && (
            <p className="text-teal-100 dark:text-teal-200 text-sm line-clamp-2">
              {journey.description}
            </p>
          )}
        </div>

        {/* Progress Section */}
        <div className="p-6">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {journey.stats.versesCompleted.toLocaleString()} / 6,236
                </span>
              </div>
              <span className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                {completionPercentage.toFixed(1)}%
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-gold-500 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {targetDateInfo && !targetDateInfo.isCompleted ? 'Daily Target' : 'Members'}
              </p>
              {targetDateInfo && !targetDateInfo.isCompleted ? (
                <div>
                  {versesReadToday >= targetDateInfo.dailyVersesNeeded ? (
                    // Target reached - Green with checkmark
                    <div className="flex items-center gap-1.5">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-bold text-green-700 dark:text-green-400">
                        {versesReadToday.toLocaleString()}<span className="text-gray-400 dark:text-gray-400 font-normal"> / {targetDateInfo.dailyVersesNeeded}</span>
                      </p>
                    </div>
                  ) : versesReadToday >= targetDateInfo.dailyVersesNeeded / 2 ? (
                    // Halfway or more - Orange with exclamation
                    <div className="flex items-center gap-1.5">
                      <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {versesReadToday.toLocaleString()}<span className="text-gray-400 dark:text-gray-400 font-normal"> / {targetDateInfo.dailyVersesNeeded}</span>
                      </p>
                    </div>
                  ) : versesReadToday > 0 ? (
                    // Less than halfway - Red with exclamation
                    <div className="flex items-center gap-1.5">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {versesReadToday.toLocaleString()}<span className="text-gray-400 dark:text-gray-400 font-normal"> / {targetDateInfo.dailyVersesNeeded}</span>
                      </p>
                    </div>
                  ) : (
                    // No progress - Red with exclamation
                    <div className="flex items-center gap-1.5">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        0<span className="text-gray-400 dark:text-gray-400 font-normal"> / {targetDateInfo.dailyVersesNeeded}</span>
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {journey.memberIds.length}
                  <svg className="w-4 h-4 inline ml-1 text-gray-400 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {targetDateInfo && !targetDateInfo.isCompleted ? 'Members' : 'Last Activity'}
              </p>
              {targetDateInfo && !targetDateInfo.isCompleted ? (
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {journey.memberIds.length}
                  <svg className="w-4 h-4 inline ml-1 text-gray-400 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </p>
              ) : (
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {lastActivity}
                </p>
              )}
            </div>
          </div>

          {/* Target Date Section */}
          {targetDateInfo && !targetDateInfo.isCompleted && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-gold-600 dark:text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Target: {targetDateInfo.targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <p className={`text-xs font-medium ml-6 ${
                targetDateInfo.isOverdue
                  ? 'text-red-600 dark:text-red-400'
                  : targetDateInfo.daysRemaining <= 7
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {targetDateInfo.isOverdue
                  ? `${Math.abs(targetDateInfo.daysRemaining)} days overdue`
                  : `${targetDateInfo.daysRemaining} days remaining`
                }
              </p>
            </div>
          )}

          {/* Last Activity - only show if no target date (since it's shown in stats when target exists) */}
          {(!targetDateInfo || targetDateInfo.isCompleted) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last activity: <span className="text-gray-700 dark:text-gray-300 font-medium">{lastActivity}</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer - Hover indicator */}
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 flex items-center justify-between group-hover:bg-teal-50 dark:group-hover:bg-teal-950 transition-colors">
          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 font-medium">
            View Journey
          </span>
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-1 transition-all"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
