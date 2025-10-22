import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useState, useEffect } from 'react';

export function Landing() {
  const { currentUser } = useAuth();
  const [demoProgress, setDemoProgress] = useState(0);

  // Cycle through demo states every 3 seconds
  useEffect(() => {
    const states = [0, 25, 50, 75, 100];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % states.length;
      setDemoProgress(states[currentIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-950 transition-colors">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Deenly" className="w-8 h-8 sm:w-10 sm:h-10" />
              <span className="text-xl sm:text-2xl font-bold text-teal-900 dark:text-teal-100">Deenly</span>
            </Link>
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
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Deenly" className="w-32 h-32 mx-auto mb-8 drop-shadow-xl" />
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

      {/* How It Works + Live Demo Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto">
          {/* How It Works */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              How It Works
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-700 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Create a Journey</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start a journey and invite your group
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gold-600 to-gold-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Log Your Readings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track which verses you've completed
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-700 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Track Progress Together</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Celebrate milestones as a community
                </p>
              </div>
            </div>
          </div>

          {/* Live Demo */}
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              See It In Action
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Watch how Deenly tracks your Quran reading progress
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Journey Overview Demo */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-700 to-teal-600 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">Dedi Family Ramadan 2026</h3>
                <p className="text-teal-100 text-sm">Journey started by Dedi</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Animated Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-teal-50 to-white dark:from-teal-900/20 dark:to-gray-700 rounded-xl p-4 text-center border border-teal-200 dark:border-teal-800">
                    <p className="text-3xl font-bold text-teal-700 dark:text-teal-400">
                      {Math.round((demoProgress / 100) * 1247)}
                    </p>
                    <p className="text-xs text-teal-600 dark:text-teal-500 mt-1">Verses Read</p>
                  </div>
                  <div className="bg-gradient-to-br from-gold-50 to-white dark:from-gold-900/20 dark:to-gray-700 rounded-xl p-4 text-center border border-gold-200 dark:border-gold-800">
                    <p className="text-3xl font-bold text-gold-700 dark:text-gold-400">
                      {Math.round(demoProgress)}%
                    </p>
                    <p className="text-xs text-gold-600 dark:text-gold-500 mt-1">Complete</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-700 rounded-xl p-4 text-center border border-green-200 dark:border-green-800">
                    <p className="text-3xl font-bold text-green-700 dark:text-green-400">5</p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">Members</p>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Overall Progress</p>
                    <p className="text-sm font-bold text-teal-700 dark:text-teal-400">{demoProgress}%</p>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 via-teal-600 to-gold-500 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${demoProgress}%` }}
                    />
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent Activity</h4>
                  <div className="space-y-2">
                    {demoProgress > 20 && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-gold-600 flex items-center justify-center text-white font-bold text-sm">
                          D
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white font-medium">Dedi read Al-Baqarah 1-10</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                        </div>
                      </div>
                    )}
                    {demoProgress > 50 && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-600 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                          R
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white font-medium">Rani read Al-Imran 1-20</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">5 minutes ago</p>
                        </div>
                      </div>
                    )}
                    {demoProgress > 80 && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 animate-fade-in">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-600 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                          B
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white font-medium">Budi completed An-Nisa!</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">8 minutes ago</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Surah Progress Demo */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-gold-600 to-gold-500 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">Surah Progress</h3>
                <p className="text-gold-100 text-sm">Track completion per surah</p>
              </div>

              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                {/* Demo Surahs */}
                {[
                  { number: 1, name: 'Al-Fatihah', arabic: 'الفاتحة', verses: 7, read: Math.min(7, Math.round((demoProgress / 100) * 7)) },
                  { number: 2, name: 'Al-Baqarah', arabic: 'البقرة', verses: 286, read: Math.min(286, Math.round((demoProgress / 100) * 286)) },
                  { number: 3, name: 'Al-Imran', arabic: 'آل عمران', verses: 200, read: Math.min(200, Math.round((demoProgress / 100) * 200)) },
                  { number: 4, name: 'An-Nisa', arabic: 'النساء', verses: 176, read: Math.min(176, Math.round((demoProgress / 100) * 176)) },
                  { number: 5, name: 'Al-Ma\'idah', arabic: 'المائدة', verses: 120, read: Math.min(120, Math.round((demoProgress / 100) * 120)) },
                ].map((surah) => {
                  const percentage = (surah.read / surah.verses) * 100;
                  const isComplete = percentage === 100;
                  const isInProgress = percentage > 0 && percentage < 100;

                  return (
                    <div
                      key={surah.number}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-teal-600 to-gold-600 flex items-center justify-center text-white font-bold shadow-sm">
                          {surah.number}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white">{surah.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">{surah.arabic}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {isComplete && (
                                <span className="text-green-600 dark:text-green-400">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                </span>
                              )}
                              <span className="text-lg font-bold text-teal-700 dark:text-teal-400">
                                {percentage.toFixed(0)}%
                              </span>
                            </div>
                          </div>

                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden mb-2">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${isComplete
                                ? 'bg-gradient-to-r from-green-500 to-green-600'
                                : isInProgress
                                  ? 'bg-gradient-to-r from-teal-500 to-gold-500'
                                  : 'bg-gray-300 dark:bg-gray-500'
                                }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {surah.read} / {surah.verses} verses
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
            Made with <span className="text-red-500 animate-pulse">♥</span> by{' '}
            <span
              className="font-semibold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent hover:from-pink-600 hover:to-rose-600 transition-all cursor-default"
              title="To my amazing partner in jannah - may this app help us complete many Quran journeys together ✨"
            >
              Dedi & Rani
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
