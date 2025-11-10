interface StreakActionFeedbackModalProps {
  isOpen: boolean;
  action: 'pause' | 'resume';
  onClose: () => void;
}

const PAUSE_MESSAGES = [
  "See you soon! Resume your reading anytime, but always keep Allah at heart 🤲",
  "Take your time! Your streak is safely preserved. May Allah make it easy for you 💙",
  "Rest well! We'll be here when you're ready. Stay blessed ✨",
  "Paused with care! Return whenever you're ready, Allah is Most Merciful 🌙",
];

const RESUME_MESSAGES = [
  "Welcome back! Let's get some readings done! 📖",
  "Alhamdulillah! Ready to continue your journey? 🌟",
  "Great to see you again! Let's make today count 💪",
  "You're back! Time to strengthen that streak 🔥",
];

export function StreakActionFeedbackModal({
  isOpen,
  action,
  onClose,
}: StreakActionFeedbackModalProps) {
  if (!isOpen) return null;

  const messages = action === 'pause' ? PAUSE_MESSAGES : RESUME_MESSAGES;
  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with fade animation */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scaleIn">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/20 to-gold-400/20 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/20 to-gold-400/20 rounded-full blur-2xl" />

        {/* Content */}
        <div className="relative text-center">
          {/* Animated Icon */}
          {action === 'pause' ? (
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          )}

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {action === 'pause' ? 'Streak Paused' : 'Streak Resumed'}
          </h3>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6">
            {message}
          </p>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Got it!
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
