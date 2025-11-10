import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getStreakStatus } from '@/services/statsService';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StreakActionFeedbackModal } from './StreakActionFeedbackModal';
import { ReadingHeatmap } from './ReadingHeatmap';
import { useDailyReadingStats } from '@/hooks/useDailyReadingStats';

export function PersonalStatsBanner() {
  const { userProfile, currentUser } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackAction, setFeedbackAction] = useState<'pause' | 'resume'>('pause');
  const [isExpanded, setIsExpanded] = useState(false);
  const { dailyData, loading: heatmapLoading } = useDailyReadingStats();

  if (!userProfile) {
    return null;
  }

  // Show zeros if stats don't exist yet
  const stats = userProfile.stats || {
    currentStreak: 0,
    todayVersesRead: 0,
    todayDate: undefined,
    lastReadDate: null,
    streakPauses: [],
    activePauseId: null,
  };

  // Calculate actual streak status (pause-aware)
  const { actualStreak, status: streakStatus, isPaused } = getStreakStatus(
    stats.currentStreak || 0,
    stats.lastReadDate || null,
    stats.streakPauses
  );

  async function handlePauseStreak() {
    if (!currentUser || loading) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const pauseId = `pause_${Date.now()}`;

      const currentPauses = stats.streakPauses || [];
      const newPause = {
        id: pauseId,
        startDate: Timestamp.fromDate(new Date()),
        endDate: null,
      };

      await updateDoc(userRef, {
        'stats.streakPauses': [...currentPauses, newPause],
        'stats.activePauseId': pauseId,
      });

      setShowMenu(false);

      // Show feedback modal
      setFeedbackAction('pause');
      setShowFeedbackModal(true);
    } catch (error) {
      console.error('Failed to pause streak:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleResumeStreak() {
    if (!currentUser || loading || !stats.activePauseId) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);

      // Update the active pause to set endDate
      const updatedPauses = (stats.streakPauses || []).map((p: any) =>
        p.id === stats.activePauseId ? { ...p, endDate: Timestamp.fromDate(new Date()) } : p
      );

      await updateDoc(userRef, {
        'stats.streakPauses': updatedPauses,
        'stats.activePauseId': null,
      });

      setShowMenu(false);

      // Show feedback modal
      setFeedbackAction('resume');
      setShowFeedbackModal(true);
    } catch (error) {
      console.error('Failed to resume streak:', error);
    } finally {
      setLoading(false);
    }
  }

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
    <div className="bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-800 dark:to-teal-900 rounded-2xl p-4 md:p-6 shadow-lg relative">
      {/* Title and Menu */}
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h2 className="text-base md:text-xl font-bold text-white">Personal Achievements</h2>

        {/* Kebab Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            disabled={loading}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>

              {/* Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
                {isPaused ? (
                  <button
                    onClick={handleResumeStreak}
                    disabled={loading}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Resume Streak
                  </button>
                ) : (
                  <button
                    onClick={handlePauseStreak}
                    disabled={loading}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pause Streak
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-6">
          {/* Current Streak */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${
              streakStatus === 'paused'
                ? 'bg-blue-500/30'
                : streakStatus === 'at-risk'
                ? 'bg-orange-500/30 animate-pulse'
                : 'bg-white/20'
            }`}>
              <span className="text-xl md:text-2xl">
                {streakStatus === 'paused' ? '⏸️' : streakStatus === 'at-risk' ? '⚠️' : '🔥'}
              </span>
            </div>
            <div>
              <p className="text-xs md:text-sm text-teal-100 dark:text-teal-200">
                Current Streak
                {streakStatus === 'at-risk' && (
                  <span className="ml-1 text-orange-200 font-semibold">• At Risk!</span>
                )}
                {streakStatus === 'paused' && (
                  <span className="ml-1 text-blue-200 font-semibold">• Paused</span>
                )}
              </p>
              <p className={`text-lg md:text-2xl font-bold ${
                streakStatus === 'paused'
                  ? 'text-blue-200'
                  : streakStatus === 'at-risk'
                  ? 'text-orange-200'
                  : 'text-white'
              }`}>
                {actualStreak} {actualStreak === 1 ? 'day' : 'days'}
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

        {/* Motivational message - Desktop */}
        {actualStreak === 0 && displayTodayVerses === 0 && !isPaused && (
          <div className="hidden lg:block text-white/90 text-sm">
            Start your reading journey today! 📖
          </div>
        )}
        {streakStatus === 'paused' && (
          <div className="hidden lg:block text-blue-200 text-sm font-semibold">
            Streak paused • Your {actualStreak}-day streak is preserved 🤲
          </div>
        )}
        {streakStatus === 'at-risk' && (
          <div className="hidden lg:block text-orange-200 text-sm font-semibold">
            Read today to keep your {actualStreak}-day streak alive! ⏰
          </div>
        )}
        {streakStatus === 'active' && actualStreak > 0 && (
          <div className="hidden lg:block text-white/90 text-sm">
            {actualStreak === 1 && "Keep going! 💪"}
            {actualStreak >= 2 && actualStreak <= 6 && "You're on fire! 🌟"}
            {actualStreak >= 7 && actualStreak < 30 && "Amazing streak! 🚀"}
            {actualStreak >= 30 && "Masha Allah! 🌙"}
          </div>
        )}
      </div>

      {/* Motivational message - Mobile (full width row) */}
      <div className="lg:hidden mt-3">
        {actualStreak === 0 && displayTodayVerses === 0 && !isPaused && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
            <p className="text-center text-white font-medium text-sm">
              Start your reading journey today! 📖
            </p>
          </div>
        )}
        {streakStatus === 'paused' && (
          <div className="bg-blue-500/30 backdrop-blur-sm rounded-lg px-3 py-2.5 border border-blue-400/50">
            <p className="text-center text-white font-bold text-sm">
              ⏸️ Streak paused • Your {actualStreak}-day streak is preserved 🤲
            </p>
          </div>
        )}
        {streakStatus === 'at-risk' && (
          <div className="bg-orange-500/30 backdrop-blur-sm rounded-lg px-3 py-2.5 border border-orange-400/50 animate-pulse">
            <p className="text-center text-white font-bold text-sm">
              ⏰ Read today to keep your {actualStreak}-day streak alive!
            </p>
          </div>
        )}
        {streakStatus === 'active' && actualStreak > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
            <p className="text-center text-white font-semibold text-sm">
              {actualStreak === 1 && "Keep going! 💪"}
              {actualStreak >= 2 && actualStreak <= 6 && "You're on fire! 🌟"}
              {actualStreak >= 7 && actualStreak < 30 && "Amazing streak! 🚀"}
              {actualStreak >= 30 && "Masha Allah! 🌙"}
            </p>
          </div>
        )}
      </div>

      {/* Expand/Collapse Button */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors"
        >
          <span>{isExpanded ? 'Hide Details' : 'Show Reading Activity'}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Expandable Heatmap Section */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/20 animate-slideDown">
          {heatmapLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <ReadingHeatmap dailyData={dailyData} />
          )}
        </div>
      )}

      {/* Feedback Modal */}
      <StreakActionFeedbackModal
        isOpen={showFeedbackModal}
        action={feedbackAction}
        onClose={() => setShowFeedbackModal(false)}
      />

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 500px;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
