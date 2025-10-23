import { useState, useEffect } from 'react';
import { QURAN_SURAHS } from '@/lib/quranData';
import { validateVerseRange, calculateVerseCount, formatVerseRange } from '@/lib/verseUtils';

interface VerseRangePickerProps {
  onRangeChange: (startRef: string, endRef: string, isValid: boolean) => void;
  disabled?: boolean;
}

export function VerseRangePicker({ onRangeChange, disabled = false }: VerseRangePickerProps) {
  const [startSurah, setStartSurah] = useState<number>(1);
  const [startVerse, setStartVerse] = useState<number>(1);
  const [endSurah, setEndSurah] = useState<number>(1);
  const [endVerse, setEndVerse] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // Get verse count for selected surahs
  const startSurahData = QURAN_SURAHS.find((s) => s.number === startSurah);
  const endSurahData = QURAN_SURAHS.find((s) => s.number === endSurah);

  // Update verse dropdowns when surah changes
  useEffect(() => {
    if (startVerse > (startSurahData?.verses || 1)) {
      setStartVerse(1);
    }
  }, [startSurah, startSurahData]);

  useEffect(() => {
    if (endVerse > (endSurahData?.verses || 1)) {
      setEndVerse(endSurahData?.verses || 1);
    }
  }, [endSurah, endSurahData]);

  // Auto-adjust end verse when start verse changes (prevent reading backwards)
  useEffect(() => {
    // Check if end is before start
    if (startSurah > endSurah) {
      // Start surah is after end surah - update end to match start
      setEndSurah(startSurah);
      setEndVerse(startVerse);
    } else if (startSurah === endSurah && startVerse > endVerse) {
      // Same surah but start verse is after end verse - update end verse
      setEndVerse(startVerse);
    }
  }, [startSurah, startVerse, endSurah, endVerse]);

  // Validate and notify parent of changes
  useEffect(() => {
    const startRef = `${startSurah}:${startVerse}`;
    const endRef = `${endSurah}:${endVerse}`;

    const validationError = validateVerseRange(startRef, endRef);
    setError(validationError);

    onRangeChange(startRef, endRef, !validationError);
  }, [startSurah, startVerse, endSurah, endVerse, onRangeChange]);

  const verseCount = error ? 0 : calculateVerseCount(
    `${startSurah}:${startVerse}`,
    `${endSurah}:${endVerse}`
  );

  const rangeDisplay = !error ? formatVerseRange(
    `${startSurah}:${startVerse}`,
    `${endSurah}:${endVerse}`
  ) : '';

  return (
    <div className="space-y-4">
      {/* Start Verse */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Start Verse
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Surah</label>
            <select
              value={startSurah}
              onChange={(e) => setStartSurah(Number(e.target.value))}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 focus:outline-none disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
            >
              {QURAN_SURAHS.map((surah) => (
                <option key={surah.number} value={surah.number}>
                  {surah.number}. {surah.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Verse</label>
            <select
              value={startVerse}
              onChange={(e) => setStartVerse(Number(e.target.value))}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 focus:outline-none disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
            >
              {Array.from({ length: startSurahData?.verses || 1 }, (_, i) => i + 1).map((verse) => (
                <option key={verse} value={verse}>
                  {verse}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* End Verse */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          End Verse
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Surah</label>
            <select
              value={endSurah}
              onChange={(e) => setEndSurah(Number(e.target.value))}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 focus:outline-none disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
            >
              {QURAN_SURAHS.map((surah) => (
                <option key={surah.number} value={surah.number}>
                  {surah.number}. {surah.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Verse</label>
            <select
              value={endVerse}
              onChange={(e) => setEndVerse(Number(e.target.value))}
              disabled={disabled}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 focus:outline-none disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
            >
              {Array.from({ length: endSurahData?.verses || 1 }, (_, i) => i + 1).map((verse) => (
                <option key={verse} value={verse}>
                  {verse}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Validation and Preview */}
      {error ? (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <div className="p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-teal-900 dark:text-teal-100">
              Selected Range:
            </span>
            <span className="text-sm font-bold text-teal-700 dark:text-teal-300">
              {verseCount} {verseCount === 1 ? 'verse' : 'verses'}
            </span>
          </div>
          <p className="text-sm text-teal-800 dark:text-teal-200 font-medium">
            {rangeDisplay}
          </p>
        </div>
      )}
    </div>
  );
}
