import { QURAN_SURAHS, TOTAL_VERSES } from './quranData';
import { VerseReference, VerseRange } from '@/types';

/**
 * Parse a verse reference string like "2:121" into VerseReference object
 */
export function parseVerseRef(ref: string): VerseReference | null {
  const parts = ref.split(':');
  if (parts.length !== 2) return null;

  const surah = parseInt(parts[0], 10);
  const verse = parseInt(parts[1], 10);

  if (isNaN(surah) || isNaN(verse)) return null;

  return { surah, verse };
}

/**
 * Format a VerseReference object into string like "2:121"
 */
export function formatVerseRef(ref: VerseReference): string {
  return `${ref.surah}:${ref.verse}`;
}

/**
 * Validate if a verse reference is valid (exists in the Quran)
 */
export function isValidVerseRef(ref: string): boolean {
  const parsed = parseVerseRef(ref);
  if (!parsed) return false;

  const { surah, verse } = parsed;

  // Check if surah number is valid (1-114)
  if (surah < 1 || surah > 114) return false;

  // Get the surah and check if verse number is valid
  const surahData = QURAN_SURAHS.find(s => s.number === surah);
  if (!surahData) return false;

  return verse >= 1 && verse <= surahData.verses;
}

/**
 * Get the global verse ID (1-6236) for a verse reference
 * This is useful for comparing which verse comes first
 */
export function getGlobalVerseId(ref: VerseReference): number {
  let id = 0;

  // Add all verses from previous surahs
  for (let i = 0; i < ref.surah - 1; i++) {
    id += QURAN_SURAHS[i].verses;
  }

  // Add the verse number from the current surah
  id += ref.verse;

  return id;
}

/**
 * Convert global verse ID (1-6236) back to VerseReference
 */
export function getVerseFromGlobalId(globalId: number): VerseReference | null {
  if (globalId < 1 || globalId > TOTAL_VERSES) return null;

  let remaining = globalId;
  let surahIndex = 0;

  while (remaining > QURAN_SURAHS[surahIndex].verses) {
    remaining -= QURAN_SURAHS[surahIndex].verses;
    surahIndex++;
  }

  return {
    surah: QURAN_SURAHS[surahIndex].number,
    verse: remaining,
  };
}

/**
 * Expand a verse range into an array of individual verse references
 * Example: "2:121" to "3:20" returns all verse refs in between
 */
export function expandVerseRange(startRef: string, endRef: string): string[] {
  const start = parseVerseRef(startRef);
  const end = parseVerseRef(endRef);

  if (!start || !end) return [];
  if (!isValidVerseRef(startRef) || !isValidVerseRef(endRef)) return [];

  const startGlobalId = getGlobalVerseId(start);
  const endGlobalId = getGlobalVerseId(end);

  // Ensure start comes before or equals end
  if (startGlobalId > endGlobalId) return [];

  const verses: string[] = [];

  for (let id = startGlobalId; id <= endGlobalId; id++) {
    const ref = getVerseFromGlobalId(id);
    if (ref) {
      verses.push(formatVerseRef(ref));
    }
  }

  return verses;
}

/**
 * Calculate the number of verses in a range
 */
export function calculateVerseCount(startRef: string, endRef: string): number {
  const start = parseVerseRef(startRef);
  const end = parseVerseRef(endRef);

  if (!start || !end) return 0;
  if (!isValidVerseRef(startRef) || !isValidVerseRef(endRef)) return 0;

  const startGlobalId = getGlobalVerseId(start);
  const endGlobalId = getGlobalVerseId(end);

  if (startGlobalId > endGlobalId) return 0;

  return endGlobalId - startGlobalId + 1;
}

/**
 * Validate a verse range
 * Returns error message if invalid, null if valid
 */
export function validateVerseRange(startRef: string, endRef: string): string | null {
  if (!startRef || !endRef) {
    return 'Both start and end references are required';
  }

  if (!isValidVerseRef(startRef)) {
    return 'Invalid start verse reference';
  }

  if (!isValidVerseRef(endRef)) {
    return 'Invalid end verse reference';
  }

  const start = parseVerseRef(startRef);
  const end = parseVerseRef(endRef);

  if (!start || !end) {
    return 'Failed to parse verse references';
  }

  const startGlobalId = getGlobalVerseId(start);
  const endGlobalId = getGlobalVerseId(end);

  if (startGlobalId > endGlobalId) {
    return 'Start verse must come before or equal to end verse';
  }

  return null; // Valid!
}

/**
 * Get Surah name from verse reference
 */
export function getSurahName(ref: string): string | null {
  const parsed = parseVerseRef(ref);
  if (!parsed) return null;

  const surah = QURAN_SURAHS.find(s => s.number === parsed.surah);
  return surah ? surah.name : null;
}

/**
 * Format a verse range for display
 * Example: "2:121 to 3:20" or "2:1-10" (same surah)
 */
export function formatVerseRange(startRef: string, endRef: string): string {
  const start = parseVerseRef(startRef);
  const end = parseVerseRef(endRef);

  if (!start || !end) return '';

  if (start.surah === end.surah) {
    // Same surah: "Al-Baqarah 121-286"
    const surahName = getSurahName(startRef);
    if (start.verse === end.verse) {
      return `${surahName} ${start.verse}`;
    }
    return `${surahName} ${start.verse}-${end.verse}`;
  } else {
    // Different surahs: "Al-Baqarah 121 to Ali 'Imran 20"
    const startSurahName = getSurahName(startRef);
    const endSurahName = getSurahName(endRef);
    return `${startSurahName} ${start.verse} to ${endSurahName} ${end.verse}`;
  }
}

/**
 * Check if two verse ranges overlap
 */
export function rangesOverlap(
  range1: VerseRange,
  range2: VerseRange
): boolean {
  const start1 = getGlobalVerseId(range1.start);
  const end1 = getGlobalVerseId(range1.end);
  const start2 = getGlobalVerseId(range2.start);
  const end2 = getGlobalVerseId(range2.end);

  return start1 <= end2 && start2 <= end1;
}

/**
 * Get completion percentage
 */
export function getCompletionPercentage(versesCompleted: number): number {
  return Math.round((versesCompleted / TOTAL_VERSES) * 100 * 100) / 100; // 2 decimal places
}
