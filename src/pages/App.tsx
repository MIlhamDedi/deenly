import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useJourneys } from '@/hooks/useJourneys';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CreateJourneyModal } from '@/components/journey/CreateJourneyModal';
import { JourneyCard } from '@/components/journey/JourneyCard';

export function AppPage() {
  const { userProfile, signOut } = useAuth();
  const { journeys, loading } = useJourneys();
  const [showCreateModal, setShowCreateModal] = useState(false);

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-gold-50/30 to-teal-100 dark:from-gray-900 dark:via-gray-800 dark:to-teal-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-teal-900 to-teal-800 dark:from-gray-900 dark:to-gray-800 shadow-lg border-b border-teal-700 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/logo.png" alt="Deenly" className="w-8 h-8 sm:w-10 sm:h-10" />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">Deenly</h1>
              <p className="text-xs sm:text-sm text-gold-200 dark:text-gray-400 hidden sm:block">Welcome back, {userProfile?.displayName}!</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/10 p-1 rounded-lg">
              <ThemeToggle />
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="border-gold-300 dark:border-gray-600 text-white hover:bg-teal-800 dark:hover:bg-gray-700 text-xs sm:text-sm px-2 sm:px-3">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Your Reading Journeys
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {journeys.length === 0
                  ? 'Create your first journey to get started'
                  : `Managing ${journeys.length} ${journeys.length === 1 ? 'journey' : 'journeys'}`}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Journey
            </Button>
          </div>
        </div>

        {/* Journeys List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 dark:border-teal-400 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your journeys...</p>
          </div>
        ) : journeys.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-gold-100 dark:from-teal-900 dark:to-gold-900 mb-6 shadow-lg">
              <svg className="w-10 h-10 text-teal-700 dark:text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Journeys Yet
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-8 max-w-md mx-auto">
              Create your first journey to start tracking your Quran reading progress with friends and family.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowCreateModal(true)}
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Journey
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {journeys.map((journey) => (
              <JourneyCard key={journey.id} journey={journey} />
            ))}
          </div>
        )}
      </main>

      {/* Create Journey Modal */}
      <CreateJourneyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
