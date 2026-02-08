# AI-Powered Employee ID Card Automation SaaS - Implementation Plan

## 1. Project Initialization & Architecture
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Database/Auth**: Firebase (Client SDK + Admin SDK)
- **Serverless**: Firebase Cloud Functions
- **Processing**: Google Vision OCR, Puppeteer, Sharp

## 2. Directory Structure
```
/src
  /app (Next.js App Router)
    /(auth) - Login/Signup
    /(dashboard) - Admin Dashboard
    /form/[formId] - Public Employee Form
    /api - Internal APIs (if needed)
  /components
    /ui - Reusable UI components
    /editor - ID Card Template Editor
    /forms - Dynamic Form Generator
  /lib
    /firebase - Firebase Config & Helpers
    /ocr - Google Vision Integration
    /pdf - Puppeteer Generation Logic
    /utils - Helpers
  /types - TypeScript Interfaces
/functions (Firebase Cloud Functions)
  /src
    - index.ts (Entry point)
    - ocr.ts (OCR Processing)
    - pdf.ts (PDF Generation)
```

## 3. Database Schema (Firestore)
- **companies**: `{ uid, name, plan, credits, logoUrl, createdAt }`
- **templates**: `{ id, companyId, name, imageUrl, width, height, fields: [], ocrData: {}, createdAt }` (fields mapped to OCR blocks)
- **forms**: `{ id, companyId, templateId, publicLink, schema: [], status: 'active/inactive' }`
- **submissions**: `{ id, formId, companyId, employeeData: {}, photoUrl, status: 'pending/approved', cardsGenerated: 0 }`
- **generated_cards**: `{ id, submissionId, pdfUrl, createdAt }`

## 4. Step-by-Step Implementation

### Phase 1: Setup & Authentication
1. Initialize Next.js project with Tailwind.
2. Configure Firebase (Auth + Firestore).
3. Build Auth pages (Login/Signup) with Role support (Admin/Employee logic).

### Phase 2: Template & OCR
1. build Template Upload UI.
2. Implement Firebase Function for Google Vision OCR.
3. specific: When image uploaded -> Trigger OCR -> Return text blocks.
4. Build "Smart Mapper" UI: Admin clicks OCR block -> Assigns to field (Name, ID, etc.).

### Phase 3: Form Generator
1. Create Dynamic Form page based on Mapped Fields.
2. Generate shareable links for employees.
3. Employee fills details + Uploads Photo (Client-side resize).

### Phase 4: ID Card Generation (The Core)
1. **Preview Mode**: Canvas-based preview on frontend.
2. **Production Mode**: Puppeteer (Headless Chrome) on Firebase Functions.
   - Load HTML template with high-res assets.
   - Inject employee data.
   - Snapshot as PDF (CMYK profile if possible via Ghostscript, otherwise high-res RGB).

### Phase 5: Dashboard & Management
1. Admin Dashboard to view submissions.
2. "Approve & Generate" workflow.
3. Credit/Plan usage tracking.

## 5. Key Technical Decisions
- **PDF Generation**: We will use Puppeteer because it offers the best CSS-to-PDF fidelity for complex ID card designs compared to `jspdf`.
- **Image handling**: `sharp` in Cloud Functions to resize/crop user uploads to fit template slots perfectly.

## 6. Security Rules
- Firestore Rules to prevent employees from seeing other companies' data.
- Storage Rules to protect raw ID card assets.

---
**Next Steps:**
1. I will execute the project initialization commands.
2. I will create the necessary boilerplate files.
