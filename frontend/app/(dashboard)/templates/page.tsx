
"use client";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function TemplatesPage() {
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">ID Card Templates</h1>
                <Link href="/dashboard/templates/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                    <Plus size={18} />
                    New Template
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Empty State or List */}
                <div className="col-span-1 md:col-span-3 text-center py-12 bg-white dark:bg-zinc-800 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">No templates</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new ID card template.</p>
                </div>
            </div>
        </div>
    );
}
