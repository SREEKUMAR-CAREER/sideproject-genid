
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const handleFormSubmission = functions.https.onCall(async (data: any, context) => {
    // This can be public (anonymous) or authenticated by employee
    // But since it's a public form link, we assume anonymous or token-based?
    // For now, allow unauthenticated submissions based on valid form ID

    const { formId, employeeData, companyId, templateId } = data;

    if (!formId || !employeeData) {
        throw new functions.https.HttpsError("invalid-argument", "Missing form data.");
    }

    try {
        // 1. Validate Form
        const formRef = db.collection("forms").doc(formId);
        const formSnap = await formRef.get();

        if (!formSnap.exists || formSnap.data()?.status !== "active") {
            throw new functions.https.HttpsError("failed-precondition", "Form is inactive or does not exist.");
        }

        const formDataData = formSnap.data();

        // Check limits
        if (formDataData?.maxSubmissions && formDataData.submissionCount >= formDataData.maxSubmissions) {
            throw new functions.https.HttpsError("resource-exhausted", "Submission limit reached.");
        }

        // Check expiry
        if (formDataData?.expiresAt && formDataData.expiresAt.toDate() < new Date()) {
            throw new functions.https.HttpsError("failed-precondition", "Form has expired.");
        }

        // 2. Create Submission
        const submissionRef = await db.collection("submissions").add({
            formId: formId,
            companyId: formDataData?.companyId,
            templateId: formDataData?.templateId,
            employeeData: employeeData, // Assume validated on client side for now
            status: "pending",
            submittedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 3. Increment Counter
        await formRef.update({
            submissionCount: admin.firestore.FieldValue.increment(1)
        });

        return { success: true, submissionId: submissionRef.id };

    } catch (error) {
        console.error("Submission Error:", error);
        throw new functions.https.HttpsError("internal", "Submission failed.");
    }
});
