# Deenly - Quran Reading Tracker

A Muslim super app for tracking your Quran reading journey with friends and family. Built with React, TypeScript, and Firebase.

## Features

- **Collaborative Reading Journeys**: Create reading groups to complete the Quran together
- **Flexible Logging**: Log readings for yourself or multiple people (perfect for families and study groups)
- **Progress Tracking**: Visual progress bars showing completion percentage
- **Social Features**: Activity feed showing who read what recently
- **Individual Stats**: Track each member's personal contribution

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Hosting)
- **Router**: React Router v6
- **State Management**: React Query (planned)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account ([create one here](https://console.firebase.google.com))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/deenly.git
cd deenly
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Firebase

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project" and follow the setup wizard
3. Once created, click on the web icon (</>) to add a web app
4. Register your app with a nickname (e.g., "Deenly Web")
5. Copy the Firebase configuration object

#### Enable Firebase Services

1. **Authentication**:
   - Go to Authentication > Get Started
   - Enable "Google" sign-in provider
   - Enable "Email/Password" sign-in provider

2. **Firestore Database**:
   - Go to Firestore Database > Create Database
   - Start in "production mode" (we have security rules)
   - Choose your location
   - Click "Enable"

3. **Hosting** (optional, for deployment):
   - Go to Hosting > Get Started
   - Follow the setup wizard

#### Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration values in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. Update `.firebaserc` with your Firebase project ID:
   ```json
   {
     "projects": {
       "default": "your-project-id"
     }
   }
   ```

### 4. Deploy Firestore Rules and Indexes

```bash
# Install Firebase CLI if you haven't already
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy Firestore rules and indexes
firebase deploy --only firestore
```

### 5. Run Development Server

```bash
npm run dev
```

The app should now be running at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

## Deploying to Firebase Hosting

```bash
# Build the app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Your app will be live at `https://your-project-id.web.app`

## Project Structure

```
deenly/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── auth/        # Authentication components
│   │   ├── journey/     # Journey-related components (coming soon)
│   │   ├── reading/     # Reading log components (coming soon)
│   │   └── ui/          # Basic UI components (Button, Input, etc.)
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and configurations
│   │   ├── firebase.ts  # Firebase initialization
│   │   ├── quranData.ts # Quran reference data (114 surahs)
│   │   └── verseUtils.ts # Verse validation and calculations
│   ├── pages/           # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   └── SignUp.tsx
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main app component with routing
│   └── main.tsx         # App entry point
├── firestore.rules      # Firestore security rules
├── firestore.indexes.json # Firestore indexes
└── firebase.json        # Firebase configuration
```

## Data Model

See [DEENLY.md](./DEENLY.md) for detailed product requirements and data model specifications.

### Key Collections

- **users**: User profiles
- **journeys**: Reading groups/journeys
  - **members**: Journey members (subcollection)
  - **readingLogs**: Reading entries (subcollection)
  - **verseCompletions**: Verse completion tracking (subcollection)
- **invitations**: Pending journey invitations

## Development Roadmap

### Phase 1: Foundation (Current)
- [x] Project setup with Vite + React + TypeScript
- [x] Firebase authentication (Google + Email/Password)
- [x] Basic routing and protected routes
- [x] Quran reference data with all 114 surahs
- [x] Verse utility functions

### Phase 2: Journey Management (Next)
- [ ] Create journey functionality
- [ ] Journey list dashboard
- [ ] Journey detail page
- [ ] Invite members
- [ ] Member management

### Phase 3: Reading Logging
- [ ] Log reading form with verse range picker
- [ ] Multi-user reading support (log for multiple people)
- [ ] Verse range validation
- [ ] Reading log display

### Phase 4: Progress Tracking
- [ ] Progress visualization (circular/bar charts)
- [ ] Journey completion stats
- [ ] Individual member stats
- [ ] "Which verses left?" feature

### Phase 5: Social Features
- [ ] Activity feed
- [ ] Member leaderboards
- [ ] Milestone celebrations
- [ ] User profiles with badges

### Phase 6: Notifications
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] New activity alerts
- [ ] Milestone notifications
- [ ] Daily reminders

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

See [LICENSE](./LICENSE) for details.

## Support

For questions or issues, please open an issue on GitHub.