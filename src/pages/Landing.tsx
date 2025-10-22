import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Landing() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-950 transition-colors">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/logo.png" alt="Deenly" className="w-8 h-8 sm:w-10 sm:h-10" />
              <span className="text-xl sm:text-2xl font-bold text-teal-900 dark:text-teal-100">Deenly</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              {currentUser ? (
                <Link to="/app">
                  <Button variant="primary" size="sm" className="sm:text-base sm:px-4 sm:py-2">
                    Go To App
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:block">
                    <Button variant="ghost" className="text-teal-900 dark:text-teal-100 hover:bg-teal-50 dark:hover:bg-teal-900">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="primary" size="sm" className="sm:text-base sm:px-4 sm:py-2">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <img src="/logo.png" alt="Deenly" className="w-32 h-32 mx-auto mb-8 drop-shadow-xl" />
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Complete Your Quran Journey
            <span className="block bg-gradient-to-r from-gold-600 to-gold-500 bg-clip-text text-transparent mt-2">Together</span>
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Track your Quran reading progress with friends and family. Create reading groups,
            log your readings, and celebrate milestones together.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {currentUser ? (
              <Link to="/app">
                <Button variant="primary" size="lg" className="shadow-xl">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Go To App
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button variant="primary" size="lg" className="shadow-xl">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start Your Journey
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-teal-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8 border-2 border-teal-200 dark:border-teal-700 hover:border-gold-400 dark:hover:border-gold-500 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-700 to-teal-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Collaborative Reading</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Create reading groups and complete the Quran together. Perfect for families, study groups, and friends.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-gold-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8 border-2 border-gold-200 dark:border-gold-700 hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-gold-600 to-gold-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Progress Tracking</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Visual dashboards show your completion percentage, verses read, and individual contributions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-teal-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8 border-2 border-teal-200 dark:border-teal-700 hover:border-gold-400 dark:hover:border-gold-500 hover:shadow-xl transition-all">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-700 to-teal-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Flexible Logging</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Log readings for yourself or others. Read out of order. Track exactly which verses are complete.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gradient-to-br from-teal-50 to-gold-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="space-y-8">
            <div className="flex gap-6 items-start bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-teal-100 dark:border-teal-700">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-700 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create a Journey</h3>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  Start a new reading journey and invite your friends, family, or study group to join.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gold-200 dark:border-gold-700">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gold-600 to-gold-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Log Your Readings</h3>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  After reading, log which verses you completed. You can read in any order and track who read what.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-teal-100 dark:border-teal-700">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-700 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Track Progress Together</h3>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  Watch your journey's progress grow, celebrate milestones, and stay motivated as a community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-800 to-teal-700 dark:from-teal-900 dark:to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Begin?
          </h2>
          <p className="text-xl text-teal-100 dark:text-teal-200 mb-8">
            Join Deenly today and start your Quran reading journey with loved ones.
          </p>
          <Link to="/signup">
            <Button
              variant="white"
              size="lg"
              className="text-xl px-10 py-4"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-400">
            &copy; 2025 Deenly. Track your Quran reading journey together.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-2 italic">
            Made with <span className="text-red-500 animate-pulse">♥</span> for{' '}
            <span
              className="font-semibold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent hover:from-pink-600 hover:to-rose-600 transition-all cursor-default"
              title="To my amazing partner in jannah, Rani - may this app help us complete many Quran journeys together ✨"
            >
              My Rani
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
