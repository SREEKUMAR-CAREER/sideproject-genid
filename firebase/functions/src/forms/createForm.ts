
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const createPublicForm = functions.https.onCall(async (data, context) => {
    // Auth Check
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }

    const { companyId, templateId, expiryDate, maxSubmissions } = data;

    // Validate inputs
    if (!companyId || !templateId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
    }

    try {
        // Generate a short, unique ID (using nanoid logic or simple random string for now)
        // Since we can't import nanoid in CommonJS easily without setup, use simple random
        const formId = Math.random().toString(36).substring(2, 10);

        const formData = {
            id: formId,
            companyId,
            templateId,
            publicUrl: `https://${process.env.GCLOUD_PROJECT}.web.app/form/${formId}`, // Or custom domain
            expiresAt: expiryDate ? admin.firestore.Timestamp.fromDate(new Date(expiryDate)) : null,
            maxSubmissions: maxSubmissions || null,
            submissionCount: 0,
            status: "active",
            createdBy: context.auth.uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("forms").doc(formId).set(formData);

        return { success: true, formId, publicUrl: formData.publicUrl };

    } catch (error) {
        console.error("Create Form Error:", error);
        throw new functions.https.HttpsError("internal", "Failed to create public form.");
    }
});
