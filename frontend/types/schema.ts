
import { Timestamp } from "firebase/firestore";

export type Role = 'admin' | 'employee';
export type SubscriptionPlan = 'starter' | 'pro' | 'business';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface User {
    uid: string;
    email: string;
    name: string;
    role: Role;
    companyId?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Company {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    logo: string;
    adminId: string;
    subscription: {
        plan: SubscriptionPlan;
        startDate: Timestamp;
        endDate: Timestamp;
        cardsLimit: number;
        cardsUsed: number;
        status: SubscriptionStatus;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface OCRBlock {
    text: string;
    confidence: number;
    boundingBox: object; // Simplify for now, usually vertices
}

export interface TemplateField {
    id: string;
    label: string;
    fieldType: 'text' | 'email' | 'phone' | 'number' | 'date' | 'file';
    required: boolean;
    placeholder: string;
    validation?: string;
    ocrMapped: boolean;
    ocrText?: string;
}

export interface Template {
    id: string;
    companyId: string;
    name: string;
    originalFile: string;
    fileType: 'image' | 'pdf';
    ocrProcessed: boolean;
    ocrData?: {
        rawText: string;
        blocks: OCRBlock[];
    };
    fields: TemplateField[];
    cardDesign: {
        width: number;
        height: number;
        dpi: number;
        htmlTemplate: string;
    };
    status: 'draft' | 'active' | 'archived';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Form {
    id: string;
    companyId: string;
    templateId: string;
    publicUrl: string;
    expiresAt: Timestamp | null;
    maxSubmissions: number | null;
    submissionCount: number;
    status: 'active' | 'closed';
    createdBy: string;
    createdAt: Timestamp;
}

export interface Submission {
    id: string;
    formId: string;
    companyId: string;
    templateId: string;
    employeeData: Record<string, any>;
    photoUrl?: string;
    qrCodeData?: string;
    status: 'pending' | 'approved' | 'printed';
    submittedAt: Timestamp;
    approvedAt?: Timestamp;
    approvedBy?: string;
}

export interface GeneratedCard {
    id: string;
    submissionId: string;
    companyId: string;
    employeeId: string; // If linked to a user
    pdfUrl: string;
    thumbnailUrl?: string;
    fileSize: number;
    generatedAt: Timestamp;
    downloadCount: number;
}
