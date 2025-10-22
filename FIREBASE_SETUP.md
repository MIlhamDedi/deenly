# Firebase Setup Guide for Deenly

## Understanding Firebase Credentials

Your Firebase project has **TWO types of credentials**:

### 1. Service Account Key (Backend/Admin)
- **File**: `deenly-6e6db-firebase-adminsdk-fbsvc-ee47f22ef4.json`
- **Used for**: Cloud Functions, server-side operations, admin tasks
- **Security**: EXTREMELY SENSITIVE - Never commit to git, never share publicly
- **Already configured**: ✅ Added to .gitignore

### 2. Web App Configuration (Frontend)
- **Used for**: Your React web application (what we need now!)
- **Security**: Public-facing, safe to include in frontend code
- **Status**: ❌ Need to get this from Firebase Console

---

## Getting Web App Configuration

Follow these steps to get your web app credentials:

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com
2. Select your project: **deenly-6e6db**

### Step 2: Register a Web App
1. Click the **Settings gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** `</>` (if you don't have a web app yet)
5. Register your app:
   - **App nickname**: `Deenly Web`
   - **Firebase Hosting**: ✅ Check this box
   - Click **"Register app"**

### Step 3: Copy Your Configuration
You'll see a code snippet like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "deenly-6e6db.firebaseapp.com",
  projectId: "deenly-6e6db",
  storageBucket: "deenly-6e6db.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

### Step 4: Update Your .env File
Copy the values from the config object into your `.env` file:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=deenly-6e6db.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=deenly-6e6db
VITE_FIREBASE_STORAGE_BUCKET=deenly-6e6db.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

**Replace the XXX values with your actual values from Firebase Console!**

---

## Enable Firebase Services

### 1. Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click **"Get started"**
3. Enable **Google** sign-in:
   - Click "Google"
   - Toggle "Enable"
   - Set **Project public-facing name**: `Deenly`
   - Set **Support email**: your email
   - Click "Save"
4. Enable **Email/Password** sign-in:
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"

### 2. Create Firestore Database
1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. **Security rules**: Choose "Start in production mode"
4. **Location**: Choose your preferred location (e.g., `us-central`)
5. Click **"Enable"**

### 3. Deploy Firestore Rules
Once your database is created, deploy the security rules from your project:

```bash
# Make sure you're in the project directory
cd /Users/milhamdedi/github.com/milhamdedi/deenly

# Deploy firestore rules and indexes
firebase deploy --only firestore
```

---

## Verify Your Setup

After completing the above steps, verify everything is working:

1. **Check .env file has real values** (not placeholders)
2. **Firestore database is created** in Firebase Console
3. **Authentication providers are enabled** (Google + Email/Password)
4. **Firestore rules are deployed** successfully

---

## Start Development

```bash
npm run dev
```

Visit http://localhost:5173 and you should be able to:
- ✅ Sign up with email/password
- ✅ Sign in with Google
- ✅ Access the dashboard

---

## Security Checklist

- ✅ Service account key is in `.gitignore`
- ✅ `.env` file is in `.gitignore`
- ⚠️ **NEVER** commit `.env` or service account files to git
- ⚠️ **NEVER** share service account keys publicly
- ✅ Firestore security rules are deployed

---

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
→ Check that `VITE_FIREBASE_API_KEY` in `.env` matches your Firebase Console

### "Missing or insufficient permissions"
→ Deploy Firestore rules: `firebase deploy --only firestore`

### Google Sign-In not working
→ Make sure you enabled Google sign-in provider in Firebase Console Authentication settings

---

## What's in `.gitignore`?

These sensitive files are automatically ignored by git:
- `.env` - Your web app credentials
- `*firebase-adminsdk*.json` - Service account keys
- `service-account*.json` - Other service account keys

**Never remove these from .gitignore!**
