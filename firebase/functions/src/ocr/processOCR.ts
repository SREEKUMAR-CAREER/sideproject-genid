
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import vision from "@google-cloud/vision";

const client = new vision.ImageAnnotatorClient();

// Helper to determine field type
const determineFieldType = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes("email")) return "email";
    if (t.includes("phone") || t.includes("mobile")) return "phone";
    if (t.includes("date") || t.includes("dob")) return "date";
    if (t.includes("id")) return "text"; // ID can be alphanumeric
    return "text";
};

// Helper for capitalization
const capitalizeWords = (str: string): string => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
};

export const processTemplateOCR = functions.runWith({
    memory: "1GB",
    timeoutSeconds: 120
}).https.onCall(async (data: { templateId: string, imagePath: string }, context) => {
    // 1. Auth Check
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }

    const { templateId, imagePath } = data;
    const db = admin.firestore();

    try {
        console.log(`Processing OCR for template: ${templateId}, path: ${imagePath}`);

        // 2. Vision API Call
        const gcsUri = `gs://${admin.storage().bucket().name}/${imagePath}`;
        const [result] = await client.textDetection(gcsUri);
        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            return { success: false, message: "No text found." };
        }

        const fullText = detections[0].description || "";
        const blocks = detections.slice(1).map((text, index) => {
            return {
                id: `block_${index}`,
                text: text.description || "",
                confidence: text.score || 0,
                boundingBox: text.boundingPoly?.vertices || [] // Simplify for storage if needed
            };
        });

        // 3. Smart Field Extraction Logic
        const keywords = ["name", "id", "designation", "role", "department", "phone", "email", "blood", "join", "date"];
        const extractedFields: any[] = [];

        // Very basic heuristic: if a block contains a keyword, propose it as a label
        blocks.forEach((block) => {
            const textLower = block.text.toLowerCase();
            const matchedKeyword = keywords.find(k => textLower.includes(k));

            if (matchedKeyword) {
                extractedFields.push({
                    id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    label: capitalizeWords(block.text.replace(/[:]/g, "").trim()),
                    fieldType: determineFieldType(matchedKeyword),
                    required: true,
                    placeholder: `Enter ${capitalizeWords(matchedKeyword)}`,
                    ocrMapped: true,
                    ocrText: block.text
                });
            }
        });

        // Always add a Photo field if not found (usually photo isn't text)
        extractedFields.push({
            id: `field_photo_${Date.now()}`,
            label: "Employee Photo",
            fieldType: "photo", // Custom type for frontend
            required: true,
            placeholder: "Upload Photo",
            ocrMapped: false
        });

        // 4. Update Firestore Template
        await db.collection("templates").doc(templateId).update({
            ocrProcessed: true,
            ocrData: {
                rawText: fullText,
                blocks: blocks
            },
            fields: extractedFields, // Pre-fill suggested fields
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: true, fields: extractedFields };

    } catch (error) {
        console.error("OCR Error:", error);
        throw new functions.https.HttpsError("internal", "OCR processing failed.");
    }
});
