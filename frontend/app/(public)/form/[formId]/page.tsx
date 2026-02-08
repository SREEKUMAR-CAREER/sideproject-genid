
"use client";

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { notFound, usePathname, useRouter } from 'next/navigation';
import { Loader2, UploadCloud, CheckCircle2 } from 'lucide-react';
import { Form, Template, TemplateField } from '@/types/schema';

// This component uses client-side ID extraction
// In Next.js 13+ App Router, params are passed as props to layout/page, but for client component we can use hooks or pass down
export default function PublicFormPage({ params }: { params: { formId: string } }) {
    const { formId } = params;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<Form | null>(null);
    const [template, setTemplate] = useState<Template | null>(null);

    // Form state
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [photo, setPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (formId) loadForm();
    }, [formId]);

    const loadForm = async () => {
        try {
            const formDoc = await getDoc(doc(db, 'forms', formId));
            if (!formDoc.exists()) {
                setError('Form not found');
                setLoading(false);
                return;
            }

            const formData = formDoc.data() as Form;

            // Check if active
            if (formData.status !== 'active') {
                setError('This form is no longer accepting submissions.');
                setLoading(false);
                return;
            }

            setForm({ id: formDoc.id, ...formData });

            // Load template to get fields
            const templateDoc = await getDoc(doc(db, 'templates', formData.templateId));
            if (templateDoc.exists()) {
                setTemplate({ id: templateDoc.id, ...templateDoc.data() } as Template);
            } else {
                setError('Template data missing. Contact administrator.');
            }

        } catch (error) {
            console.error('Error loading form:', error);
            setError('Failed to load form. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size must be less than 5MB");
                return;
            }
            setPhoto(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form || !template) return;

        setSubmitting(true);

        try {
            let photoUrl = '';

            // 1. Upload Photo
            if (photo) {
                const photoRef = ref(
                    storage,
                    `submissions/${form.companyId}/${form.id}/${Date.now()}_photo.jpg`
                );
                await uploadBytes(photoRef, photo);
                photoUrl = await getDownloadURL(photoRef);
            } else {
                // If photo is required by template field, validation should catch this
                // But for now, we assume if 'photo' field exists, it's handled here
                const photoField = template.fields.find(f => f.fieldType === 'file' || f.id === 'photo');
                if (photoField && photoField.required) {
                    throw new Error("Photo is required.");
                }
            }

            // 2. Submit to Firestore
            await addDoc(collection(db, 'submissions'), {
                formId: form.id,
                companyId: form.companyId,
                templateId: form.templateId,
                employeeData: formData, // Contains text fields
                photoUrl,
                status: 'pending',
                submittedAt: serverTimestamp()
            });

            // 3. Increment submission count
            await updateDoc(doc(db, 'forms', form.id), {
                submissionCount: increment(1)
            });

            setSubmitted(true);

        } catch (error: any) {
            console.error('Submission error:', error);
            alert('Submission failed: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-zinc-900 text-gray-500"><Loader2 className="animate-spin mr-2" /> Loading form...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-zinc-900 p-4">
                <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-sm text-center max-w-md w-full border border-red-100 dark:border-red-900/30">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Unavailable</h2>
                    <p className="text-gray-600 dark:text-gray-300">{error}</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-zinc-900 p-4">
                <div className="bg-white dark:bg-zinc-800 p-12 rounded-xl shadow-sm text-center max-w-md w-full border border-green-100 dark:border-green-900/30">
                    <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Submission Received!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Your details have submitted successfully. Your ID card will be generated after admin approval.</p>
                    <button onClick={() => window.location.reload()} className="text-indigo-600 hover:text-indigo-700 font-medium">Submit another response</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12 px-4 flex justify-center">
            <div className="max-w-2xl w-full bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-700 overflow-hidden">
                <div className="bg-indigo-600 p-8 text-white text-center">
                    <h1 className="text-3xl font-bold mb-2">{template?.name || "Employee Registration"}</h1>
                    <p className="opacity-90">Please fill in your details accurately for your ID card.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {template?.fields.map((field: TemplateField) => {
                        // We handle 'photo' or 'file' type separately for better UI, or inline here
                        if (field.fieldType === 'file' || field.id === 'photo') {
                            return (
                                <div key={field.id}>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="flex items-center gap-6">
                                        <div className="shrink-0">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="h-24 w-24 object-cover rounded-full border-2 border-gray-200" />
                                            ) : (
                                                <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-gray-400">
                                                    <UploadCloud size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <label className="block">
                                            <span className="sr-only">Choose profile photo</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                required={field.required}
                                                className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-indigo-50 file:text-indigo-700
                                                hover:file:bg-indigo-100 cursor-pointer"
                                            />
                                        </label>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">Max size 5MB. Face should be clearly visible.</p>
                                </div>
                            );
                        }

                        return (
                            <div key={field.id}>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type={field.fieldType}
                                    placeholder={field.placeholder || `Enter ${field.label}`}
                                    required={field.required}
                                    value={formData[field.id] || ''}
                                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-gray-50 dark:bg-zinc-700/50"
                                />
                            </div>
                        );
                    })}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                        >
                            {submitting && <Loader2 className="animate-spin" />}
                            {submitting ? 'Submitting...' : 'Submit Information'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
