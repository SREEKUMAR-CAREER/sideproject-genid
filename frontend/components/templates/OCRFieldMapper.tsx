
"use client";

import { useState } from 'react';
import { Template, TemplateField, OCRBlock } from '@/types/schema';
import { Trash2, Plus, Edit2, Check } from 'lucide-react';

interface OCRFieldMapperProps {
    template: Template;
    onSave: (fields: TemplateField[]) => void;
}

export default function OCRFieldMapper({ template, onSave }: OCRFieldMapperProps) {
    const [fields, setFields] = useState<TemplateField[]>(template.fields || []);
    const [ocrBlocks] = useState<OCRBlock[]>(template.ocrData?.blocks || []);

    // State for dragging or selecting blocks could be complex
    // MVP: List current fields, allow adding new ones, allow selecting an OCR block to map content from

    const handleAddField = () => {
        const newField: TemplateField = {
            id: `field_${Date.now()}`,
            label: 'New Field',
            fieldType: 'text',
            required: true,
            placeholder: '',
            ocrMapped: false,
        };
        setFields([...fields, newField]);
    };

    const handleRemoveField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const handleUpdateField = (id: string, updates: Partial<TemplateField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    return (
        <div className="flex gap-6 h-[calc(100vh-200px)]">
            {/* Visual Editor Side */}
            <div className="flex-1 bg-gray-100 dark:bg-zinc-900 rounded-lg p-4 overflow-auto relative border border-gray-200 dark:border-zinc-700">
                <h3 className="text-sm font-semibold mb-4 text-gray-500 sticky top-0">Template Preview & OCR Blocks</h3>

                <div className="relative inline-block border shadow-lg bg-white">
                    {/* Background Image */}
                    {template.originalFile && (
                        <img
                            src={template.originalFile}
                            alt="Template"
                            className="max-w-none"
                            style={{
                                width: '100%', // Scale to fit container usually, but for mapping literal pixels might need care
                                height: 'auto'
                            }}
                        />
                    )}

                    {/* OCR Overlays */}
                    {ocrBlocks.map((block, idx) => {
                        // Creating an overlay for each block for visualization
                        // Assuming vertices are normalized or we have pixel coordinates.
                        // The backend returned raw vertices. This demo assumes simplified positioning or just list view.
                        // For now, let's list them on the side if image overlay is hard without dimensions.
                        // Implementing overlays requires precise coordinate mapping which depends on image display size.
                        return null;
                    })}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                    {ocrBlocks.map((block, i) => (
                        <div key={i} className="text-xs p-1 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded truncate" title={block.text}>
                            {block.text}
                        </div>
                    ))}
                </div>
            </div>

            {/* Fields Sidebar */}
            <div className="w-96 bg-white dark:bg-zinc-800 border-l border-gray-200 dark:border-zinc-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-zinc-700 flex justify-between items-center">
                    <h2 className="font-bold">Form Fields</h2>
                    <button
                        onClick={handleAddField}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded text-indigo-600"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {fields.map((field) => (
                        <div key={field.id} className="bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-lg border border-gray-100 dark:border-zinc-600">
                            <div className="flex justify-between items-start mb-2">
                                <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                                    className="bg-transparent font-medium text-sm focus:outline-none border-b border-transparent focus:border-indigo-500 w-full mr-2"
                                />
                                <button
                                    onClick={() => handleRemoveField(field.id)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <select
                                    value={field.fieldType}
                                    onChange={(e) => handleUpdateField(field.id, { fieldType: e.target.value as any })}
                                    className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 rounded px-2 py-1"
                                >
                                    <option value="text">Text</option>
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                    <option value="date">Date</option>
                                    <option value="number">Number</option>
                                    <option value="file">File/Photo</option>
                                </select>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    Required
                                </label>

                                {/* Placeholder for OCR Mapping Selection */}
                                <div className="col-span-2 mt-1">
                                    <div className="text-[10px] text-gray-500 mb-1">Default Value / OCR</div>
                                    <input
                                        type="text"
                                        value={field.ocrText || ''}
                                        placeholder="Auto-filled from OCR"
                                        onChange={(e) => handleUpdateField(field.id, { ocrText: e.target.value })}
                                        className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-600 rounded px-2 py-1 text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-zinc-700">
                    <button
                        onClick={() => onSave(fields)}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                    >
                        <Check size={16} />
                        Save Field Mapping
                    </button>
                </div>
            </div>
        </div>
    );
}
