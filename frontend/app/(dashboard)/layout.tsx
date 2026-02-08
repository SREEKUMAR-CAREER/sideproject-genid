
"use client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, CreditCard, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        ID Card Gen
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link href="/dashboard/employees" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                        <Users size={20} />
                        Employees
                    </Link>
                    <Link href="/dashboard/templates" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                        <CreditCard size={20} />
                        Templates
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                        <Settings size={20} />
                        Settings
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-zinc-700">
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 h-16 flex items-center px-8 justify-between">
                    <h2 className="text-lg font-semibold">Overview</h2>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                            {user.email?.[0].toUpperCase()}
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
