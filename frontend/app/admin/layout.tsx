"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "./_components/Header";
import Sidebar from "./_components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!isAuthenticated || user?.role !== "admin")) {
            router.push("/login");
        }
    }, [isAuthenticated, loading, user, router]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isAuthenticated || user?.role !== "admin") {
        return null;
    }

    return (
        <div className='flex w-full min-h-screen'>
            <div className='page-wrapper flex w-full'>
                {/* Header/sidebar */}
                <div className='xl:block hidden'>
                    <Sidebar />
                </div>
                <div className='w-full bg-background'>
                    {/* Top Header  */}
                    <Header />
                    {/* Body Content  */}
                    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 p-2">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}