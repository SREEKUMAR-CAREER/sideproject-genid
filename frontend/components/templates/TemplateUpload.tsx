
"use client";

import { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { storage, db, functions } from '@/lib/firebase/config';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function TemplateUpload() {
    const { user, profile } = useAuth(); // Assuming useAuth returns profile which has companyId
    const router = useRouter();

    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [processing, setProcessing] = useState(false);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !profile?.companyId) {
            if (!profile?.companyId) alert("Company ID not found. Please contact support.");
            return;
        }

        setUploading(true);

        // 1. Upload to Storage
        const storageRef = ref(
            storage,
            `templates/${profile.companyId}/${Date.now()}_${file.name}`
        );

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(prog);
            },
            (error) => {
                console.error('Upload error:', error);
                alert('Upload failed: ' + error.message);
                setUploading(false);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // 2. Create template document in Firestore
                    const templateRef = await addDoc(collection(db, 'templates'), {
                        companyId: profile.companyId,
                        name: file.name,
                        originalFile: downloadURL,
                        fileType: file.type.includes('pdf') ? 'pdf' : 'image',
                        ocrProcessed: false,
                        fields: [],
                        cardDesign: {
                            width: 85.6,    // CR80 standard in mm
                            height: 53.98,
                            dpi: 300,
                            htmlTemplate: ''
                        },
                        status: 'draft',
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });

                    setUploading(false);
                    setProcessing(true);

                    // 3. Trigger OCR processing (Cloud Function)
                    const processOCR = httpsCallable(functions, 'processTemplateOCR');

                    // Note: The function expects { templateId, imagePath }
                    // We need to pass the storage path, not the full URL, or handle both in function.
                    // Our function implementation uses `imagePath`.
                    // storageRef.fullPath gives us the relative path in bucket.

                    await processOCR({
                        templateId: templateRef.id,
                        imagePath: storageRef.fullPath
                    });

                    setProcessing(false);
                    alert('Template uploaded and processed successfully!');
                    router.push(`/dashboard/templates/${templateRef.id}`);

                } catch (error: any) {
                    console.error('Post-upload processing error:', error);
                    alert('File uploaded but processing failed: ' + error.message);
                    setUploading(false);
                    setProcessing(false);
                }
            }
        );
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700">
            <h2 className="text-2xl font-bold mb-6">Upload ID Card Template</h2>

            <form onSubmit={handleUpload} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Template Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                        <input
                            type="file"
                            accept="image/*" // Restricting to image for OCR initial version
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                            required
                        />
                        <p className="mt-2 text-xs text-gray-400">Supported formats: JPG, PNG</p>
                    </div>
                </div>

                {(uploading || processing) && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>{uploading ? "Uploading..." : "Processing OCR..."}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${processing ? 'bg-green-500 animate-pulse w-full' : 'bg-indigo-600'}`}
                                style={{ width: processing ? '100%' : `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={!file || uploading || processing}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm"
                >
                    {uploading ? 'Uploading...' : processing ? 'Analyzing Template...' : 'Upload & Analyze'}
                </button>
            </form>
        </div>
    );
}
