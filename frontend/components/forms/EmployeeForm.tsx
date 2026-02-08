
"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export type FieldDefinition = {
    id: string; // unique
    label: string;
    type: "text" | "number" | "email" | "photo" | "date" | "select";
    required: boolean;
    options?: string[]; // for select
};

interface DynamicFormProps {
    fields: FieldDefinition[];
    companyName: string;
    onSubmit: (data: any) => Promise<void>;
}

export default function DynamicForm({ fields, companyName, onSubmit }: DynamicFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamically build Zod schema
    const schemaShape: any = {};
    fields.forEach((field) => {
        let validator = z.string();
        if (field.type === "email") validator = z.string().email();
        if (field.type === "number") validator = z.string().transform((val) => Number(val));
        if (!field.required) validator = validator.optional();
        else validator = validator.min(1, `${field.label} is required`);

        schemaShape[field.id] = validator;
    });

    const schema = z.object(schemaShape);
    type FormData = z.infer<typeof schema>;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const handleFormSubmit: SubmitHandler<FormData> = async (data) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
        } catch (error) {
            console.error(error);
            alert("Submission failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-zinc-700">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold">{companyName}</h2>
                <p className="text-gray-500">Employee Registration</p>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                {fields.map((field) => (
                    <div key={field.id}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === "select" ? (
                            <select
                                {...register(field.id)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent"
                            >
                                <option value="">Select...</option>
                                {field.options?.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : field.type === "photo" ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                <input type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                <p className="mt-2 text-xs text-gray-500">Upload a passport size photo.</p>
                            </div>
                        ) : (
                            <input
                                type={field.type}
                                {...register(field.id)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-transparent"
                            />
                        )}

                        {errors[field.id] && (
                            <p className="text-red-500 text-xs mt-1">
                                {(errors[field.id] as any)?.message}
                            </p>
                        )}
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                    {isSubmitting ? "Submitting..." : "Submit Details"}
                </button>
            </form>
        </div>
    );
}
