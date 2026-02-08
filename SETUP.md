# ID Card SaaS - Setup Guide

## Prerequisites
- Node.js 20+ installed
- Firebase account
- Git

## Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Firebase Functions:**
```bash
cd firebase/functions
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable the following services:
   - Authentication (Google Sign-In)
   - Firestore Database
   - Cloud Storage
   - Cloud Functions

3. Get your Firebase config:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy the configuration

4. Create `frontend/.env.local`:
```bash
cp frontend/.env.local.example frontend/.env.local
```

5. Update `frontend/.env.local` with your Firebase credentials:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

**Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 4. Deploy Firebase (Optional for local dev)

```bash
# Login to Firebase
firebase login

# Initialize (if not done)
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy Functions (after building)
cd firebase/functions
npm run build
cd ..
firebase deploy --only functions
```

## Project Structure

```
├── frontend/              # Next.js application
│   ├── app/              # App Router pages
│   │   ├── (dashboard)/  # Protected dashboard routes
│   │   └── (public)/     # Public routes (forms)
│   ├── components/       # React components
│   ├── lib/             # Utilities and Firebase config
│   └── types/           # TypeScript types
├── firebase/
│   ├── functions/       # Cloud Functions
│   │   └── src/
│   │       ├── ocr/     # OCR processing
│   │       ├── pdf/     # PDF generation
│   │       └── forms/   # Form management
│   ├── firestore.rules  # Database security rules
│   └── storage.rules    # Storage security rules
└── docs/                # Documentation
```

## Features

- ✅ Template Upload & OCR Processing
- ✅ Smart Field Mapping
- ✅ Public Employee Forms
- ✅ PDF ID Card Generation
- ✅ Subscription Management
- ✅ Multi-tenant Architecture

## Troubleshooting

### TypeScript Errors
The lint errors you see are expected until `npm install` completes. Once dependencies are installed, restart your IDE.

### Firebase Functions Not Working
Make sure you've:
1. Enabled billing on your Firebase project (required for Cloud Functions)
2. Deployed the functions using `firebase deploy --only functions`
3. Set up Google Cloud Vision API credentials

### Port Already in Use
If port 3000 is busy:
```bash
npm run dev -- -p 3001
```

## Next Steps

1. **Create First Admin User**: Sign in with Google at `/auth/login`
2. **Upload Template**: Go to `/dashboard/templates` and upload an ID card template
3. **Map Fields**: Review OCR results and configure form fields
4. **Generate Form**: Create a public form link to share with employees
5. **Approve & Generate**: Review submissions and generate ID cards

## Support

For issues or questions, check:
- `implementation_plan.md` for architecture details
- `docs/DEPLOYMENT.md` for production deployment
- Firebase Console logs for function errors
