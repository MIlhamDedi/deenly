import { useState, useMemo } from 'react';
import { ReadingLog } from '@/types';
import { QURAN_SURAHS } from '@/lib/quranData';
import { expandVerseRange } from '@/lib/verseUtils';

interface SurahProgressProps {
  readingLogs: ReadingLog[];
}

interface SurahProgressData {
  surahNumber: number;
  name: string;
  nameArabic: string;
  totalVerses: number;
  versesRead: number;
  percentage: number;
  status: 'complete' | 'in-progress' | 'not-started';
}

type FilterType = 'all' | 'complete' | 'in-progress' | 'not-started';
type SortType = 'number' | 'percentage';

export function SurahProgress({ readingLogs }: SurahProgressProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('number');

  // Calculate progress for all surahs
  const surahProgressData = useMemo(() => {
    // Collect all read verses
    const readVerses = new Set<string>();

    readingLogs.forEach((log) => {
      const verses = expandVerseRange(log.startRef, log.endRef);
      verses.forEach((verse) => readVerses.add(verse));
    });

    // Calculate progress for each surah
    const progress: SurahProgressData[] = QURAN_SURAHS.map((surah) => {
      let versesRead = 0;

      // Count how many verses of this surah have been read
      for (let verse = 1; verse <= surah.verses; verse++) {
        const verseRef = `${surah.number}:${verse}`;
        if (readVerses.has(verseRef)) {
          versesRead++;
        }
      }

      const percentage = (versesRead / surah.verses) * 100;
      let status: 'complete' | 'in-progress' | 'not-started';

      if (percentage === 100) {
        status = 'complete';
      } else if (percentage > 0) {
        status = 'in-progress';
      } else {
        status = 'not-started';
      }

      return {
        surahNumber: surah.number,
        name: surah.name,
        nameArabic: surah.nameArabic,
        totalVerses: surah.verses,
        versesRead,
        percentage,
        status,
      };
    });

    return progress;
  }, [readingLogs]);

  // Filter and sort
  const filteredAndSorted = useMemo(() => {
    let result = [...surahProgressData];

    // Apply filter
    if (filter !== 'all') {
      result = result.filter((s) => s.status === filter);
    }

    // Apply sort
    if (sort === 'percentage') {
      result.sort((a, b) => b.percentage - a.percentage);
    }
    // Default is by number (already sorted)

    return result;
  }, [surahProgressData, filter, sort]);

  // Calculate stats
  const stats = useMemo(() => {
    const complete = surahProgressData.filter((s) => s.status === 'complete').length;
    const inProgress = surahProgressData.filter((s) => s.status === 'in-progress').length;
    const notStarted = surahProgressData.filter((s) => s.status === 'not-started').length;

    return { complete, inProgress, notStarted };
  }, [surahProgressData]);

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.complete}</p>
          <p className="text-xs text-green-600 dark:text-green-500">Complete</p>
        </div>
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">{stats.inProgress}</p>
          <p className="text-xs text-teal-600 dark:text-teal-500">In Progress</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.notStarted}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Not Started</p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-teal-700 text-white dark:bg-teal-600'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('complete')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'complete'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Complete
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'in-progress'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('not-started')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filter === 'not-started'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Not Started
          </button>
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setSort('number')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              sort === 'number'
                ? 'bg-teal-700 text-white dark:bg-teal-600'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            By Number
          </button>
          <button
            onClick={() => setSort('percentage')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              sort === 'percentage'
                ? 'bg-teal-700 text-white dark:bg-teal-600'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            By Progress
          </button>
        </div>
      </div>

      {/* Surah List */}
      <div className="space-y-2">
        {filteredAndSorted.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No surahs match this filter</p>
          </div>
        ) : (
          filteredAndSorted.map((surah) => (
            <div
              key={surah.surahNumber}
              className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Surah Number */}
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-teal-600 to-gold-600 flex items-center justify-center text-white font-bold shadow-sm">
                  {surah.surahNumber}
                </div>

                {/* Surah Info and Progress */}
                <div className="flex-1 min-w-0">
                  {/* Name */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {surah.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-arabic">
                        {surah.nameArabic}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Status Indicator */}
                      {surah.status === 'complete' && (
                        <span className="text-green-600 dark:text-green-400">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                      <span className="text-lg font-bold text-teal-700 dark:text-teal-400">
                        {surah.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        surah.status === 'complete'
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : surah.status === 'in-progress'
                          ? 'bg-gradient-to-r from-teal-500 to-gold-500'
                          : 'bg-gray-300 dark:bg-gray-500'
                      }`}
                      style={{ width: `${surah.percentage}%` }}
                    />
                  </div>

                  {/* Verses Count */}
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {surah.versesRead} / {surah.totalVerses} verses
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
