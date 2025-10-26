# Claude Code Development Guide

> **Purpose**: This document helps AI assistants (like Claude) understand the Deenly codebase architecture, patterns, and conventions for efficient development.

## 📁 Project Overview

**Deenly** is a collaborative Quran reading tracker built as a React SPA with Firebase backend, hosted on GitHub Pages.

- **Tech Stack**: React + TypeScript + Vite + Firebase + Tailwind CSS
- **Deployment**: GitHub Pages (Static hosting)
- **Base URL**: `/` (custom domain: `deenly.milhamdedi.com`)

---

## 🏗️ Architecture Patterns

### State Management

**No Redux/Zustand** - Uses Firebase real-time listeners + React Context

```
┌─────────────────────────────────────────┐
│         Context API (Auth Only)         │
│    src/contexts/AuthContext.tsx         │
│    - currentUser (Firebase Auth)        │
│    - userProfile (Firestore listener)   │
└─────────────────────────────────────────┘
           │
           ├─> Custom Hooks (Data Layer)
           │   - useAuth()
           │   - useJourneys()
           │   - useJourneyDetail()
           │   - useNotifications()
           │
           └─> Service Layer (Business Logic)
               - journeyService.ts
               - statsService.ts
```

**Key Pattern**: Real-time sync via `onSnapshot()` listeners
- ✅ **CORRECT**: `onSnapshot(docRef, (doc) => setState(doc.data()))`
- ❌ **WRONG**: `getDoc(docRef).then(...)` (one-time fetch, won't update)

### Important Fix Applied

**AuthContext now uses real-time listener** (src/contexts/AuthContext.tsx:96-132)
- Previously used `getDoc()` - stats wouldn't update
- Now uses `onSnapshot()` - stats update automatically when readings are logged

---

## 📂 Key File Locations

### Core Files

| Purpose | Location |
|---------|----------|
| **Auth State** | `src/contexts/AuthContext.tsx` |
| **Journey Business Logic** | `src/services/journeyService.ts` |
| **Stats Calculations** | `src/services/statsService.ts` |
| **Notifications** | `src/lib/notifications.ts` |
| **Firebase Config** | `src/lib/firebase.ts` |
| **Type Definitions** | `src/types/index.ts` |

### Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Personal Stats Banner** | `src/components/user/PersonalStatsBanner.tsx` | Top dashboard stats (streak, today's verses) |
| **Personal Stats** | `src/components/user/PersonalStats.tsx` | Detailed stats card |
| **Log Reading Modal** | `src/components/journey/LogReadingModal.tsx` | Form to log Quran readings |
| **Journey Card** | `src/components/journey/JourneyCard.tsx` | Journey list item |

### Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/pages/Landing.tsx` | Public landing page |
| `/login` | `src/pages/Login.tsx` | Google Sign-In |
| `/app` | `src/pages/App.tsx` | Main dashboard (authenticated) |
| `/app/journey/:id` | `src/pages/JourneyDetail.tsx` | Journey detail view |
| `/join?journey=xxx` | `src/pages/JoinJourney.tsx` | Accept journey invitation |

---

## 🔥 Firebase Data Structure

```
users/{uid}
  ├─ displayName, email, photoURL
  ├─ settings
  │   ├─ notifications: boolean
  │   ├─ dailyReminder: boolean
  │   ├─ reminderTime: string ("HH:MM")
  │   └─ dailyGoal: number (verses per day)
  ├─ stats
  │   ├─ currentStreak: number
  │   ├─ longestStreak: number
  │   ├─ totalVersesRead: number
  │   ├─ totalReadings: number
  │   ├─ lastReadDate: Timestamp
  │   ├─ todayVersesRead: number
  │   └─ todayDate: Timestamp
  └─ fcmTokens/{tokenHash} (subcollection)

journeys/{journeyId}
  ├─ name, description, createdBy, memberIds[]
  ├─ stats
  │   ├─ versesCompleted: number
  │   ├─ completionPercentage: number
  │   ├─ versesReadToday: number
  │   └─ lastActivityAt: Timestamp
  ├─ members/{userId} (subcollection)
  │   └─ stats (member-specific journey stats)
  ├─ readingLogs/{logId} (subcollection)
  │   ├─ startRef, endRef (e.g., "2:255", "3:20")
  │   ├─ verseCount, readBy[], timestamp
  │   └─ note (optional)
  └─ verseCompletions/{verseRef} (subcollection)
      └─ completedAt, completedBy[]
```

---

## 🎯 Common Development Patterns

### 1. Logging a Reading

**Flow**: User submits form → `journeyService.logReading()` → Firebase batch updates → Real-time listeners update UI

**Key Function**: `src/services/journeyService.ts:33-124`

Updates in one transaction:
1. Create reading log entry
2. Update journey stats (unique verses)
3. Update personal user stats (streak, today's verses)
4. Update member stats in journey

### 2. Streak Calculation

**Client-Side Validation**: `src/services/statsService.ts:109-139`

```typescript
getStreakStatus(currentStreak, lastReadDate)
  → { actualStreak, status: 'active' | 'at-risk' | 'broken' }
```

**Logic**:
- Same day (0 days ago) → Active ✅
- Yesterday (1 day ago) → At Risk ⚠️ (need to read today)
- 2+ days ago → Broken ❌ (streak = 0)

### 3. Notifications

**System Reminders** (always active): `src/lib/notifications.ts:21-36`
- 04:00 - Morning reminder
- 21:00 - Evening reminder

**User Reminder** (optional): User-configured time in settings

**Scheduling**: `src/hooks/useNotifications.ts` - runs in `/app` route

---

## 🐛 Known Issues & Gotchas

### 1. GitHub Pages SPA Routing

**Problem**: Direct URL access (e.g., `/app`) returns 404 from GitHub Pages

**Solution**: `public/404.html` redirect script
- Encodes path as query string with `~and~` replacement
- `index.html` script decodes and restores URL
- **IMPORTANT**: `pathSegmentsToKeep = 0` for root deployment

### 2. Reload Loop Bug (FIXED)

**Symptom**: URL appends `/~and~/` repeatedly on reload

**Cause**: Mismatch between `vite.config.ts` base (`/`) and `404.html` pathSegmentsToKeep

**Fix**: Set `pathSegmentsToKeep = 0` in `public/404.html:13`

### 3. Stats Not Updating (FIXED)

**Symptom**: "Today's Verses" doesn't update after logging reading

**Cause**: `AuthContext` used `getDoc()` instead of `onSnapshot()`

**Fix**: `src/contexts/AuthContext.tsx:96-132` now uses real-time listener

### 4. Outdated Streak Display (FIXED)

**Symptom**: Streak shows old value if user skipped days

**Cause**: Streak only recalculated when logging new reading

**Fix**: Client-side validation with `getStreakStatus()` in display components

---

## 🎨 UI Patterns

### Streak Status Display

**Color Coding**:
- 🔥 **Active** (read today) → White/Green
- ⚠️ **At Risk** (read yesterday, not today) → Orange with pulse animation
- 💔 **Broken** (2+ days) → Shows 0 days

**Warning Messages**:
- At Risk: "Read today to keep your X-day streak alive! ⏰"
- Active: Motivational messages based on streak length

### Daily Goal Progress

**Today's Verses Display**:
- ✅ Green (≥100% of goal)
- 🟧 Orange (50-99% of goal)
- 🔴 Red (<50% of goal)

---

## 🧪 Testing & Deployment

### Build Command
```bash
npm run build
# Runs: tsc && vite build && node scripts/post-build.js
```

### Post-Build Script
`scripts/post-build.js` generates:
1. `dist/join/index.html` with invite-specific OpenGraph tags
2. `dist/sitemap.xml`

### Environment Variables
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_FIREBASE_VAPID_KEY (for push notifications)
```

### Firestore Rules
See `firestore.rules` - validates user permissions for reads/writes

---

## 🚀 Quick Development Checklist

When adding new features:

- [ ] Does it need real-time updates? → Use `onSnapshot()`, not `getDoc()`
- [ ] Does it modify user stats? → Update in `journeyService.ts`
- [ ] Does it need client-side validation? → Add to `statsService.ts`
- [ ] Does it change UI state? → Use local `useState` or Context (avoid Redux)
- [ ] Does it need notifications? → Update `SYSTEM_REMINDERS` or user settings
- [ ] Does it affect routing? → Remember GitHub Pages SPA limitations
- [ ] Does it need new types? → Add to `src/types/index.ts`

---

## 📚 Additional Documentation

- **General Info**: `DEENLY.md`
- **Firebase Setup**: `FIREBASE_SETUP.md`
- **Progress Log**: `PROGRESS.md`
- **UI Components**: `UI_COMPONENTS.md`

---

## 💡 Development Tips for AI Assistants

1. **Always use real-time listeners** for data that can change (user stats, journey data)
2. **Check `src/types/index.ts`** for complete data structure definitions
3. **Service layer is the source of truth** for business logic - don't duplicate in components
4. **Client-side validation** supplements server data (e.g., streak status)
5. **Batch writes** are used for atomic updates across multiple documents
6. **The app uses client-side routing** - all authenticated routes go through `/app`
7. **Notifications schedule on mount** of `/app` page via `useNotifications()` hook

---

**Last Updated**: 2025-01-26
**Architecture Version**: v2 (Real-time listeners + Client-side validation)
