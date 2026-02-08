
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    serverTimestamp,
    DocumentReference
} from "firebase/firestore";
import { db } from "./config";
import { User, Company, Template, Form, Submission } from "@/types/schema";

// --- Users & Companies ---

export const getUserProfile = async (uid: string): Promise<User | null> => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as User;
    }
    return null;
};

export const getCompany = async (companyId: string): Promise<Company | null> => {
    const docRef = doc(db, "companies", companyId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as Company;
    }
    return null;
};

export const createCompany = async (userId: string, companyData: Partial<Company>) => {
    // In a real app, this should be a transaction or Cloud Function
    // creating both user record update and company document
    const companyRef = await addDoc(collection(db, "companies"), {
        ...companyData,
        adminId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    // Link company to user
    await updateDoc(doc(db, "users", userId), {
        companyId: companyRef.id,
        role: "admin",
        updatedAt: serverTimestamp()
    });

    return companyRef.id;
};


// --- Templates ---

export const getTemplates = async (companyId: string) => {
    const q = query(
        collection(db, "templates"),
        where("companyId", "==", companyId),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Template));
};

export const createTemplate = async (templateData: Omit<Template, "id" | "createdAt" | "updatedAt">) => {
    return await addDoc(collection(db, "templates"), {
        ...templateData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });
};

// --- Forms ---

export const createForm = async (formData: Omit<Form, "id" | "createdAt">) => {
    return await addDoc(collection(db, "forms"), {
        ...formData,
        createdAt: serverTimestamp(),
        submissionCount: 0
    });
};

export const getForm = async (formId: string): Promise<Form | null> => {
    const docRef = doc(db, "forms", formId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Form;
    }
    return null;
};


// --- Submissions ---

export const createSubmission = async (submissionData: Omit<Submission, "id" | "submittedAt" | "status">) => {
    return await addDoc(collection(db, "submissions"), {
        ...submissionData,
        status: "pending",
        submittedAt: serverTimestamp()
    });
};

export const getSubmissions = async (companyId: string) => {
    const q = query(
        collection(db, "submissions"),
        where("companyId", "==", companyId),
        orderBy("submittedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
};
