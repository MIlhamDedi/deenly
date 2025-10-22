import { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useJourneyDetail } from '@/hooks/useJourneyDetail';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LogReadingModal } from '@/components/journey/LogReadingModal';
import { EditJourneyModal } from '@/components/journey/EditJourneyModal';
import { SurahProgress } from '@/components/journey/SurahProgress';
import { formatVerseRange } from '@/lib/verseUtils';

type TabType = 'overview' | 'progress' | 'activity' | 'members';

export function JourneyDetail() {
  const { id } = useParams<{ id: string }>();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showLogModal, setShowLogModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { journey, members, readingLogs, loading, error } = useJourneyDetail(id || '');

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }

  if (!id) {
    return <Navigate to="/app" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gold-50/30 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-teal-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 dark:border-teal-400 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading journey...</p>
        </div>
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gold-50/30 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-teal-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Journey Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This journey doesn't exist or you don't have access to it.
          </p>
          <Link to="/app">
            <Button variant="primary">Back to App</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'progress', label: 'Progress' },
    { id: 'activity', label: 'Activity' },
    { id: 'members', label: 'Members' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gold-50/30 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-teal-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-teal-900 to-teal-800 dark:from-gray-900 dark:to-gray-800 shadow-lg border-b border-teal-700 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/app" className="text-white hover:text-gold-200 transition-colors" title="Back to App">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">{journey?.name || 'Journey'}</h1>
                <p className="text-xs sm:text-sm text-gold-200 dark:text-gray-400 hidden sm:block">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/10 p-1 rounded-lg">
                <ThemeToggle />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-gold-300 dark:border-gray-600 text-white hover:bg-teal-800 dark:hover:bg-gray-700 text-xs sm:text-sm px-2 sm:px-3"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Journey Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-teal-100 dark:border-gray-700 mb-6">
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 dark:from-teal-800 dark:to-teal-900 p-6 sm:p-8">
            <div className="flex justify-between items-start gap-4 mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white flex-1">{journey?.name}</h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex-shrink-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Edit Journey"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            {journey?.description && (
              <p className="text-teal-100 dark:text-gray-300">{journey.description}</p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Overall Progress</span>
                <span className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                  {journey?.stats.completionPercentage.toFixed(1) || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-gold-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${journey?.stats.completionPercentage || 0}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-teal-50 dark:bg-gray-700 rounded-xl">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Verses Read</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {journey?.stats.versesCompleted.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">of 6,236</p>
              </div>
              <div className="text-center p-4 bg-gold-50 dark:bg-gray-700 rounded-xl">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Members</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {members.length}
                </p>
              </div>
              <div className="text-center p-4 bg-teal-50 dark:bg-gray-700 rounded-xl">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Readings</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {readingLogs.length}
                </p>
              </div>
              <div className="text-center p-4 bg-gold-50 dark:bg-gray-700 rounded-xl">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Last Activity</p>
                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                  {readingLogs.length > 0 ? 'Recent' : 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowLogModal(true)}
            className="w-full sm:w-auto shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Log Reading
          </Button>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-teal-100 dark:border-gray-700 overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'text-teal-700 dark:text-teal-400 border-b-2 border-teal-700 dark:border-teal-400 bg-teal-50 dark:bg-gray-700'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Journey Overview</h3>
                  {journey.description && (
                    <p className="text-gray-600 dark:text-gray-400">{journey.description}</p>
                  )}
                </div>

                {/* Target Date Section */}
                {journey.targetEndDate && (() => {
                  const targetDate = journey.targetEndDate.toDate();
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const targetDateOnly = new Date(targetDate);
                  targetDateOnly.setHours(0, 0, 0, 0);

                  const daysRemaining = Math.ceil((targetDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const versesRemaining = 6236 - journey.stats.versesCompleted;
                  const dailyVersesNeeded = daysRemaining > 0 ? Math.ceil(versesRemaining / daysRemaining) : versesRemaining;

                  const isOverdue = daysRemaining < 0;
                  const isCompleted = journey.stats.versesCompleted >= 6236;

                  return (
                    <div className="bg-gradient-to-br from-gold-50 to-teal-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 border-2 border-gold-200 dark:border-gold-700">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gold-600 to-gold-500 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Target End Date</h4>
                          <p className="text-2xl font-bold text-gold-700 dark:text-gold-400">
                            {targetDate.toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {!isCompleted && (
                        <div className="grid sm:grid-cols-3 gap-4 mt-6">
                          <div className="bg-white dark:bg-gray-700 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-600">
                            <p className={`text-3xl font-bold mb-1 ${
                              isOverdue
                                ? 'text-red-600 dark:text-red-400'
                                : daysRemaining <= 7
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-teal-700 dark:text-teal-400'
                            }`}>
                              {isOverdue ? 'Overdue' : daysRemaining}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {isOverdue ? `by ${Math.abs(daysRemaining)} days` : 'Days Remaining'}
                            </p>
                          </div>

                          <div className="bg-white dark:bg-gray-700 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-600">
                            <p className="text-3xl font-bold text-gold-700 dark:text-gold-400 mb-1">
                              {versesRemaining.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Verses Remaining</p>
                          </div>

                          <div className="bg-white dark:bg-gray-700 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-600">
                            <p className={`text-3xl font-bold mb-1 ${
                              isOverdue
                                ? 'text-red-600 dark:text-red-400'
                                : dailyVersesNeeded > 100
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {isOverdue ? '—' : dailyVersesNeeded}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {isOverdue ? 'Target Passed' : 'Verses/Day Needed'}
                            </p>
                          </div>
                        </div>
                      )}

                      {isCompleted && (
                        <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4 text-center">
                          <p className="text-green-700 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Journey Completed! Alhamdulillah!
                          </p>
                        </div>
                      )}

                      {!isCompleted && !isOverdue && daysRemaining <= 7 && (
                        <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-3">
                          <p className="text-sm text-orange-700 dark:text-orange-400 text-center">
                            ⏰ Less than a week remaining! Keep up the momentum!
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Journey Stats */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Statistics</h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Members</p>
                      <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">
                        {journey.memberIds.length}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Readings Logged</p>
                      <p className="text-2xl font-bold text-gold-700 dark:text-gold-400">
                        {readingLogs.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Surah Progress</h3>
                <SurahProgress readingLogs={readingLogs} />
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                {readingLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">No activity yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Start logging readings to see activity here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {readingLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatVerseRange(log.startRef, log.endRef)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {log.verseCount} {log.verseCount === 1 ? 'verse' : 'verses'}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(log.timestamp.toDate(), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {log.readByNames.map((name, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                        {log.note && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 italic mt-2">
                            "{log.note}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Logged by {log.loggedByName}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Journey Members</h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {members.length} {members.length === 1 ? 'member' : 'members'}
                  </span>
                </div>
                {members.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">No members yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.userId}
                        className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-gold-500 flex items-center justify-center text-white font-bold">
                            {member.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {member.displayName}
                              {member.role === 'owner' && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gold-100 dark:bg-gold-900 text-gold-800 dark:text-gold-200">
                                  Owner
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {member.stats?.versesRead.toLocaleString() || 0}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">verses</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Log Reading Modal */}
      <LogReadingModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        journeyId={id!}
        members={members}
      />

      {/* Edit Journey Modal */}
      {journey && (
        <EditJourneyModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          journey={journey}
        />
      )}
    </div>
  );
}
