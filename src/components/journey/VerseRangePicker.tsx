import { QURAN_SURAHS } from '@/lib/quranData';
import { validateVerseRange, calculateVerseCount, formatVerseRange, parseVerseRef } from '@/lib/verseUtils';

interface VerseRangePickerProps {
  startRef: string;
  endRef: string;
  onRangeChange: (startRef: string, endRef: string, isValid: boolean) => void;
  disabled?: boolean;
}

export function VerseRangePicker({
  startRef,
  endRef,
  onRangeChange,
  disabled = false,
}: VerseRangePickerProps) {
  const start = parseVerseRef(startRef);
  const end = parseVerseRef(endRef);
  const startSurah = start?.surah || 1;
  const startVerse = start?.verse || 1;
  const endSurah = end?.surah || 1;
  const endVerse = end?.verse || 1;
  const startSurahData = QURAN_SURAHS.find((s) => s.number === startSurah);
  const endSurahData = QURAN_SURAHS.find((s) => s.number === endSurah);
  const error = validateVerseRange(startRef, endRef);

  function updateRange(
    nextStartSurah: number,
    nextStartVerse: number,
    nextEndSurah: number,
    nextEndVerse: number
  ) {
    const startVerseLimit = QURAN_SURAHS.find((s) => s.number === nextStartSurah)?.verses || 1;
    const endVerseLimit = QURAN_SURAHS.find((s) => s.number === nextEndSurah)?.verses || 1;
    const adjustedStartVerse = nextStartVerse > startVerseLimit ? 1 : nextStartVerse;
    const adjustedEndVerse = Math.min(nextEndVerse, endVerseLimit);
    const endBeforeStart = nextEndSurah < nextStartSurah ||
      (nextEndSurah === nextStartSurah && adjustedEndVerse < adjustedStartVerse);
    const nextStartRef = `${nextStartSurah}:${adjustedStartVerse}`;
    const nextEndRef = endBeforeStart
      ? nextStartRef
      : `${nextEndSurah}:${adjustedEndVerse}`;

    onRangeChange(nextStartRef, nextEndRef, !validateVerseRange(nextStartRef, nextEndRef));
  }

  const verseCount = error ? 0 : calculateVerseCount(startRef, endRef);
  const rangeDisplay = error ? '' : formatVerseRange(startRef, endRef);

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
              onChange={(e) => updateRange(Number(e.target.value), startVerse, endSurah, endVerse)}
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
              onChange={(e) => updateRange(startSurah, Number(e.target.value), endSurah, endVerse)}
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
              onChange={(e) => updateRange(startSurah, startVerse, Number(e.target.value), endVerse)}
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
              onChange={(e) => updateRange(startSurah, startVerse, endSurah, Number(e.target.value))}
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
