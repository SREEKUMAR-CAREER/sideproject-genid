
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase/config';
import { httpsCallable } from 'firebase/functions';
import { Template, TemplateField } from '@/types/schema';
import OCRFieldMapper from '@/components/templates/OCRFieldMapper';
import { Loader2, Share2, CheckCircle, AlertCircle, Copy } from 'lucide-react';

export default function TemplateDetailsPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const router = useRouter();

    const [template, setTemplate] = useState<Template | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [creatingForm, setCreatingForm] = useState(false);
    const [publicFormUrl, setPublicFormUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTemplate();
    }, [id]);

    const loadTemplate = async () => {
        try {
            const docRef = doc(db, 'templates', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setTemplate({ id: docSnap.id, ...docSnap.data() } as Template);
            } else {
                setError('Template not found');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load template');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMapping = async (fields: TemplateField[]) => {
        if (!template) return;
        setSaving(true);

        try {
            await updateDoc(doc(db, 'templates', template.id), {
                fields,
                status: 'active', // Mark active once fields are saved
                updatedAt: serverTimestamp()
            });

            setTemplate({ ...template, fields, status: 'active' });
            alert('Template mapping saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save mapping');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateForm = async () => {
        if (!template || !template.companyId) return;
        setCreatingForm(true);

        try {
            const createFormFn = httpsCallable(functions, 'createPublicForm');
            const result = await createFormFn({
                companyId: template.companyId,
                templateId: template.id,
                // expiryDate and maxSubmissions can be inputs later
            });

            const data = result.data as { publicUrl: string, formId: string };
            setPublicFormUrl(data.publicUrl);
            alert(`Form created! Share this URL: ${data.publicUrl}`);

        } catch (err: any) {
            console.error(err);
            alert('Failed to create public form: ' + err.message);
        } finally {
            setCreatingForm(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-600" /></div>;
    if (error || !template) return <div className="p-8 text-red-500 flex gap-2 items-center"><AlertCircle /> {error}</div>;

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <header className="mb-8 flex justify-between items-center bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{template.name}</h1>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${template.status === 'active'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                            {template.status.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {template.id}
                        </span>
                    </div>
                </div>

                <div className="flex gap-4">
                    {template.status === 'active' && (
                        <div className="flex flex-col items-end gap-2">
                            {publicFormUrl ? (
                                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-2 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <a href={publicFormUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-[200px]">
                                        {publicFormUrl}
                                    </a>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(publicFormUrl)}
                                        className="text-gray-400 hover:text-gray-600"
                                        title="Copy URL"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleCreateForm}
                                    disabled={creatingForm}
                                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition-colors shadow-sm"
                                >
                                    {creatingForm ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                                    Create Shareable Form
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-700 overflow-hidden">
                <div className="border-b border-gray-100 dark:border-zinc-700 p-4 bg-gray-50 dark:bg-zinc-900/50">
                    <h2 className="font-semibold text-gray-700 dark:text-gray-200">Field Mapping</h2>
                    <p className="text-sm text-gray-500">
                        Review the fields extracted from your template. Map them correctly to ensure accurate ID card generation.
                    </p>
                </div>

                <div className="p-0">
                    <OCRFieldMapper
                        template={template}
                        onSave={handleSaveMapping}
                    />
                </div>
            </div>
        </div>
    );
}
