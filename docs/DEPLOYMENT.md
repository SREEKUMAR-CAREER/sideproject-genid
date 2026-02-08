
# Deployment Guide

## Prerequisites
- Firebase CLI (`npm install -g firebase-tools`)
- Vercel CLI (optional for frontend)

## 1. Firebase Backend

### Step 1: Firebase Setup

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login**:
   ```bash
   firebase login
   ```

3. **Initialize Project**:
   ```bash
   firebase init
   ```
   *Select:*
   - Functions (choose Node.js 18)
   - Firestore
   - Storage
   - Hosting (optional)

4. **Deploy Functions**:
   ```bash
   cd firebase/functions
   npm install
   npm run build
   firebase deploy --only functions
   ```

5. **Deploy Rules**:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage:rules
   ```

## 2. Frontend (Vercel)

1. Push code to GitHub/GitLab.
2. Import project in Vercel.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

## 3. Post-Deployment

- Verify Firestore Rules.
- Verify Storage Rules.
- Check Cloud Functions logs for any errors.
