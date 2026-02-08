
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Export all functions
export { processTemplateOCR } from "./ocr/processOCR";
export { generateIDCardPDF } from "./pdf/generatePDF";
export { createPublicForm } from "./forms/createForm";
export { handleFormSubmission } from "./forms/submitForm";
