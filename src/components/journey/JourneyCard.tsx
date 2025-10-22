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
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</span>
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Verses Read</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {journey.stats.versesCompleted.toLocaleString()}
                <span className="text-sm text-gray-400 dark:text-gray-500 font-normal"> / 6,236</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Members</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {journey.memberIds.length}
                <svg className="w-4 h-4 inline ml-1 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </p>
            </div>
          </div>

          {/* Last Activity */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last activity: <span className="text-gray-700 dark:text-gray-300 font-medium">{lastActivity}</span>
            </p>
          </div>
        </div>

        {/* Footer - Hover indicator */}
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 flex items-center justify-between group-hover:bg-teal-50 dark:group-hover:bg-teal-950 transition-colors">
          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 font-medium">
            View Journey
          </span>
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-1 transition-all"
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
