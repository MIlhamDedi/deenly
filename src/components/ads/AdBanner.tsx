import { useState, useEffect, useRef } from 'react';
import { ADS, AdConfig } from '@/config/adConfig';

export function AdBanner() {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [nextAdIndex, setNextAdIndex] = useState<number | null>(null);
  const [isSliding, setIsSliding] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const slidingRef = useRef(false);

  useEffect(() => {
    // Get all eligible ads based on their showCondition
    const getEligibleAds = () => {
      return ADS.filter(ad => !ad.showCondition || ad.showCondition());
    };

    // Rotate through eligible ads every 5 seconds
    const interval = setInterval(() => {
      const eligibleAds = getEligibleAds();
      // Skip if already animating to avoid any chance of double-trigger
      if (eligibleAds.length > 1 && !slidingRef.current) {
        setCurrentAdIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % eligibleAds.length;

          // First, render the next ad off-screen
          setNextAdIndex(nextIndex);

          // Then start sliding after a brief delay to let browser paint
          setTimeout(() => {
            slidingRef.current = true;
            setIsSliding(true);
          }, 50);

          // Complete the slide after animation
          setTimeout(() => {
            setCurrentAdIndex(nextIndex);
            setNextAdIndex(null);
            setIsSliding(false);
            slidingRef.current = false;
            // Alternate direction each turn for a smoother feel
            setSlideDirection(prev => (prev === 'left' ? 'right' : 'left'));
          }, 550); // 50ms delay + 500ms animation

          return prevIndex; // Keep current index until animation completes
        });
      }
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Get all eligible ads
  const eligibleAds = ADS.filter(ad => !ad.showCondition || ad.showCondition());
  if (eligibleAds.length === 0) return null;

  // Safety check: reset index if out of bounds
  const safeCurrentIndex = currentAdIndex >= eligibleAds.length ? 0 : currentAdIndex;
  const currentAd = eligibleAds[safeCurrentIndex];
  const nextAd = nextAdIndex !== null && nextAdIndex < eligibleAds.length ? eligibleAds[nextAdIndex] : null;

  const renderAdContent = (ad: AdConfig, isNext: boolean = false) => (
    <div
      key={`${ad.id}-${isNext ? 'next' : 'current'}`}
      className={`absolute inset-0 transition-transform duration-500 ease-in-out ${(() => {
        if (isNext) {
          // Next slides in from the opposite side of the direction
          if (!isSliding) return slideDirection === 'left' ? 'translate-x-full' : '-translate-x-full';
          return 'translate-x-0';
        } else {
          // Current slides out in the direction
          if (!isSliding) return 'translate-x-0';
          return slideDirection === 'left' ? '-translate-x-full' : 'translate-x-full';
        }
      })()}`}
      onClick={() => {
        if (ad.actionUrl) {
          window.open(ad.actionUrl, '_blank', 'noopener,noreferrer');
        }
      }}
    >
      {/* Background Image with reduced contrast */}
      <div className="relative h-16 md:h-20">
        {/* Background Image with filter */}
        {ad.backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center brightness-75 contrast-75"
            style={{ backgroundImage: `url(${ad.backgroundImage})` }}
          />
        )}

        {/* Content Container */}
        <div className="relative h-full flex items-center px-4 md:px-6">
          {/* Text Content - Left Side */}
          <div className="flex-1 text-left">
            <h3 className="text-base md:text-lg font-bold text-white group-hover:underline">
              {ad.title}
            </h3>
          </div>

          {/* Subtle Arrow Icon - Right Side */}
          <div className="ml-4 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Sponsored Label - Only if isSponsored is true */}
        {ad.isSponsored && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/30 backdrop-blur-sm rounded text-xs text-white/80 font-medium">
            Sponsored
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-16 md:h-20 overflow-hidden rounded-xl shadow-lg hover:shadow-xl cursor-pointer group">
      {/* Current Ad */}
      {renderAdContent(currentAd)}

      {/* Next Ad (sliding in) */}
      {nextAd && renderAdContent(nextAd, true)}
    </div>
  );
}
