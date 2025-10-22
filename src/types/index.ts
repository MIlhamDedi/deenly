import { Timestamp } from 'firebase/firestore';

// User types
export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: Timestamp;
  settings: UserSettings;
}

export interface UserSettings {
  notifications: boolean;
  emailUpdates: boolean;
}

// Journey (Reading Group) types
export interface Journey {
  id: string;
  name: string;
  description?: string;
  createdBy: string; // user uid
  createdAt: Timestamp;
  updatedAt: Timestamp;
  memberIds: string[]; // array of user uids
  stats: JourneyStats;
  settings: JourneySettings;
  targetEndDate?: Timestamp; // optional target completion date
}

export interface JourneyStats {
  totalVerses: number; // always 6236
  versesCompleted: number;
  completionPercentage: number;
  lastActivityAt: Timestamp;
}

export interface JourneySettings {
  isPrivate: boolean;
  requireApproval: boolean;
}

// Journey Member types
export interface JourneyMember {
  userId: string;
  displayName: string; // denormalized for display
  email: string; // denormalized for display
  role: 'owner' | 'admin' | 'member';
  joinedAt: Timestamp;
  stats: MemberStats;
}

export interface MemberStats {
  versesRead: number; // count of unique verses this user read
  lastReadAt: Timestamp | null;
  totalReadings: number; // count of reading log entries
}

// Reading Log types
export interface ReadingLog {
  id: string;
  journeyId: string;
  loggedBy: string; // user who created the log
  loggedByName: string; // denormalized for display
  readBy: string[]; // array of user IDs who actually read it (can be multiple)
  readByNames: string[]; // denormalized names for display
  startRef: string; // "surah:verse" e.g., "2:121"
  endRef: string; // "surah:verse" e.g., "3:20"
  timestamp: Timestamp;
  note?: string;
  verseCount: number; // calculated, number of verses in this range
}

// Verse Completion types
export interface VerseCompletion {
  verseRef: string; // "surah:verse"
  completedBy: string[]; // array of user uids who have read this verse
  firstCompletedAt: Timestamp;
  lastCompletedAt: Timestamp;
  completionCount: number; // how many times read
}

// Invitation types
export interface Invitation {
  id: string;
  journeyId: string;
  journeyName: string; // denormalized
  invitedBy: string; // user uid
  invitedByName: string; // denormalized
  invitedEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

// Quran Reference types
export interface Surah {
  number: number;
  name: string;
  nameArabic: string;
  verses: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface VerseReference {
  surah: number;
  verse: number;
}

export interface VerseRange {
  start: VerseReference;
  end: VerseReference;
}

// Form types for creating/updating
export interface CreateJourneyInput {
  name: string;
  description?: string;
}

export interface LogReadingInput {
  startRef: string;
  endRef: string;
  readBy: string[]; // array of user IDs
  note?: string;
}

export interface InviteMemberInput {
  email: string;
  message?: string;
}

// Utility types
export type MemberRole = 'owner' | 'admin' | 'member';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected';
export type RevelationType = 'Meccan' | 'Medinan';
