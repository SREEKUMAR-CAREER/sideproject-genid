
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signOut
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface UserProfile {
    uid: string;
    email: string | null;
    role: "admin" | "employee";
    companyId?: string; // If admin, their company ID. If employee, the company they belong to.
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}


export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                // Fetch basic user profile
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setProfile(userDoc.data() as UserProfile);
                } else {
                    // New User - default to admin for now, or handle onboarding
                    // In a real app, you might direct them to a role selection screen
                    const newProfile: UserProfile = {
                        uid: user.uid,
                        email: user.email,
                        role: "admin", // Defaulting to Admin for SaaS signups
                    };
                    await setDoc(doc(db, "users", user.uid), newProfile);
                    setProfile(newProfile);
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
