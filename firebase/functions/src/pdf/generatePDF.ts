
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as puppeteer from "puppeteer";
import * as QRCode from "qrcode";
import { getCardTemplate } from "./templates/basicCard";

const db = admin.firestore();
const storage = admin.storage();

export const generateIDCardPDF = functions.runWith({
    memory: "2GB",
    timeoutSeconds: 300
}).https.onCall(async (data: { submissionId: string }, context) => {
    // Auth Check
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    }

    const { submissionId } = data;

    try {
        console.log(`Generating PDF for submission ${submissionId}`);

        // 1. Fetch Records
        const submissionSnap = await db.collection("submissions").doc(submissionId).get();
        if (!submissionSnap.exists) {
            throw new functions.https.HttpsError("not-found", "Submission not found");
        }
        const submission = submissionSnap.data()!;

        const templateSnap = await db.collection("templates").doc(submission.templateId).get();
        if (!templateSnap.exists) {
            throw new functions.https.HttpsError("not-found", "Template not found");
        }
        const template = templateSnap.data()!;

        const companySnap = await db.collection("companies").doc(submission.companyId).get();
        if (!companySnap.exists) {
            throw new functions.https.HttpsError("not-found", "Company not found");
        }
        const company = companySnap.data()!;

        // 2. Check Limits
        const cardsUsed = company.subscription?.cardsUsed || 0;
        const cardsLimit = company.subscription?.cardsLimit || 50; // default 50
        if (cardsUsed >= cardsLimit) {
            throw new functions.https.HttpsError("resource-exhausted", "Card limit reached.");
        }

        // 3. Generate QR Code
        const qrData = JSON.stringify({
            id: submission.employeeData.id || submissionId,
            name: submission.employeeData.name,
            c: company.name
        });
        const qrCodeDataURL = await QRCode.toDataURL(qrData, { width: 300, margin: 1 });

        // 4. Prepare Data for Template
        const cardData = {
            company: {
                name: company.name,
                logo: company.logo,
                brandColor: company.brandColor
            },
            employee: submission.employeeData,
            photo: submission.photoUrl,
            qrCode: qrCodeDataURL,
            template: {
                width: template.cardDesign?.width || 85.6,
                height: template.cardDesign?.height || 53.98
            }
        };

        // 5. Generate HTML
        // In a real app, you might use 'handlebars' or just template literals
        // If template.cardDesign.htmlTemplate exists, use that, else default
        const html = template.cardDesign?.htmlTemplate
            ? interpolateTemplate(template.cardDesign.htmlTemplate, cardData)
            : getCardTemplate(cardData);

        // 6. Puppeteer PDF Generation
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Viewport roughly matching 300 DPI mm
        const widthPx = Math.round((cardData.template.width / 25.4) * 300);
        const heightPx = Math.round((cardData.template.height / 25.4) * 300);

        await page.setViewport({ width: widthPx, height: heightPx });
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            width: `${cardData.template.width}mm`,
            height: `${cardData.template.height}mm`,
            printBackground: true,
            pageRanges: '1'
        });

        await browser.close();

        // 7. Upload PDF
        const bucket = storage.bucket();
        const fileName = `generated_cards/${submission.companyId}/${submissionId}_${Date.now()}.pdf`;
        const file = bucket.file(fileName);

        await file.save(pdfBuffer, {
            metadata: {
                contentType: 'application/pdf',
                metadata: {
                    submissionId,
                    generatedBy: context.auth.uid
                }
            }
        });

        const [pdfUrl] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
        });

        // 8. Record Generation
        await db.collection("generatedCards").add({
            submissionId,
            companyId: submission.companyId,
            employeeId: submission.employeeData.employee_id || submissionId,
            pdfUrl,
            fileSize: pdfBuffer.length,
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            downloadCount: 0
        });

        // 9. Update Usage & Status
        await db.collection("companies").doc(submission.companyId).update({
            "subscription.cardsUsed": admin.firestore.FieldValue.increment(1)
        });

        await db.collection("submissions").doc(submissionId).update({
            status: "approved",
            approvedAt: admin.firestore.FieldValue.serverTimestamp(),
            approvedBy: context.auth.uid,
            cardUrl: pdfUrl
        });

        return { success: true, pdfUrl };

    } catch (error) {
        console.error("PDF Generation Error:", error);
        throw new functions.https.HttpsError("internal", "PDF generation failed.");
    }
});

// Helper for simple {{variable}} replacement if custom HTML is used
function interpolateTemplate(template: string, data: any) {
    // Flatten data for easier lookup? or just simple recursive replace
    // For MVP, just do basic top-level keys
    let output = template;

    // Replace employee.*
    Object.keys(data.employee).forEach(key => {
        output = output.replace(new RegExp(`{{employee.${key}}}`, 'g'), data.employee[key]);
    });
    // Replace company.*
    Object.keys(data.company).forEach(key => {
        output = output.replace(new RegExp(`{{company.${key}}}`, 'g'), data.company[key]);
    });

    output = output.replace(/{{photo}}/g, data.photo || "");
    output = output.replace(/{{qrCode}}/g, data.qrCode);

    return output;
}
