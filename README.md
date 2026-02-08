# 🎴 AI-Powered Employee ID Card Generator SaaS

> **Automate your employee ID card generation with OCR-powered template extraction and intelligent field mapping.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.8-orange?logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

- 🤖 **Smart OCR Processing** - Automatically extract fields from existing ID card templates using Google Vision API
- 📝 **Dynamic Form Generation** - Create shareable employee registration forms with custom fields
- 🎨 **Template Customization** - Upload your existing ID card designs and map fields visually
- 📄 **Automated PDF Generation** - Generate professional ID cards with QR codes using Puppeteer
- 🔐 **Multi-tenant Architecture** - Company isolation with role-based access control
- 💳 **Subscription Management** - Built-in pricing tiers with usage tracking
- 🌐 **Public Forms** - Share forms with employees for self-service data submission
- 📊 **Admin Dashboard** - Manage templates, submissions, and generated cards

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Firebase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SREEKUMAR-CAREER/sideproject-genid.git
   cd sideproject-genid
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Firebase Functions
   cd ../firebase/functions
   npm install
   ```

3. **Configure Firebase**
   
   Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com) and enable:
   - Authentication (Google Sign-In)
   - Firestore Database
   - Cloud Storage
   - Cloud Functions

4. **Set up environment variables**
   ```bash
   cd frontend
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Run the development server**
   ```bash
   cd frontend
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── frontend/                 # Next.js application
│   ├── app/                 # App Router pages
│   │   ├── (dashboard)/     # Protected admin routes
│   │   │   ├── dashboard/   # Main dashboard
│   │   │   └── templates/   # Template management
│   │   ├── (public)/        # Public routes
│   │   │   └── form/        # Employee submission forms
│   │   ├── login/           # Authentication
│   │   └── page.tsx         # Landing page
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard UI components
│   │   ├── forms/          # Form builders
│   │   ├── templates/      # Template management
│   │   └── ui/             # Reusable UI components
│   ├── lib/                # Utilities and configs
│   │   ├── firebase/       # Firebase initialization
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Helper functions
│   └── types/              # TypeScript definitions
│
├── firebase/
│   ├── functions/          # Cloud Functions
│   │   └── src/
│   │       ├── ocr/        # OCR processing
│   │       ├── pdf/        # PDF generation
│   │       ├── forms/      # Form management
│   │       └── utils/      # Shared utilities
│   ├── firestore.rules     # Database security rules
│   └── storage.rules       # Storage security rules
│
└── docs/                   # Documentation
    ├── API.md              # API documentation
    └── DEPLOYMENT.md       # Deployment guide
```

## 🎯 How It Works

### 1. **Upload Template**
Admin uploads an existing ID card design (image or PDF)

### 2. **OCR Processing**
Google Vision API extracts text and identifies potential fields (name, email, phone, etc.)

### 3. **Field Mapping**
Admin reviews OCR results and configures form fields in the visual mapper

### 4. **Form Generation**
System creates a shareable public form with the configured fields

### 5. **Employee Submission**
Employees fill out the form with their details and upload their photo

### 6. **ID Card Generation**
Admin approves submissions and triggers PDF generation with:
- Employee data
- Photo
- Company branding
- QR code for verification

## 🔧 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **State Management**: React Context API
- **Form Handling**: React Hook Form + Zod validation

### Backend
- **Platform**: Firebase
- **Authentication**: Firebase Auth (Google Sign-In)
- **Database**: Cloud Firestore
- **Storage**: Cloud Storage
- **Functions**: Cloud Functions (Node.js 20)
- **OCR**: Google Cloud Vision API
- **PDF Generation**: Puppeteer

## 📊 Database Schema

### Collections

- **`users`** - User profiles with roles and company associations
- **`companies`** - Company information and subscription details
- **`templates`** - ID card templates with OCR data and field mappings
- **`forms`** - Public forms with expiry and submission limits
- **`submissions`** - Employee data submissions
- **`generatedCards`** - Generated PDF records with download URLs

See [`types/schema.ts`](frontend/types/schema.ts) for detailed TypeScript interfaces.

## 🔐 Security

- **Firestore Rules**: Row-level security with company isolation
- **Storage Rules**: File type and size validation
- **Authentication**: Required for all admin operations
- **Role-based Access**: Admin vs. Employee permissions
- **Subscription Checks**: Card generation limits enforced

## 💰 Pricing Tiers

| Plan | Price | Cards/Month | Features |
|------|-------|-------------|----------|
| **Starter** | ₹999 | 50 | Basic templates, Email support |
| **Pro** | ₹2,999 | 200 | Custom templates, Priority support, Bulk upload |
| **Business** | ₹4,999 | 500 | Unlimited templates, API access, White label |

## 🚢 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Add environment variables
5. Deploy

### Backend (Firebase)

```bash
# Login to Firebase
firebase login

# Deploy functions
cd firebase/functions
npm run build
cd ..
firebase deploy --only functions

# Deploy rules
firebase deploy --only firestore:rules,storage:rules
```

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for detailed instructions.

## 📖 Documentation

- [Setup Guide](SETUP.md) - Detailed setup instructions
- [API Documentation](docs/API.md) - Cloud Functions API reference
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- [Status](STATUS.md) - Current project status

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Cloud Vision API for OCR
- Firebase for backend infrastructure
- Next.js team for the amazing framework
- Vercel for hosting platform

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and Firebase**
