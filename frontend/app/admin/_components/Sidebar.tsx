"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_LINKS = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/accommodations", label: "Accommodations" },
];

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => href === "/admin" ? pathname === href : pathname?.startsWith(href);

    return (
        <>
            {/* Sidebar */}
            <aside className={`
                fixed md:static 
                top-0 left-0 
                h-screen w-64 
                bg-white
                border-r border-gray-200 
                z-40 overflow-y-auto`}
            >
                <div className="p-4 border-b border-gray-200">
                    <Link href="/admin" className="flex items-center gap-2">
                        <img
                            src="/images/logo.png"
                            alt="TripWise Nepal Logo"
                            className="h-8 w-8 object-contain"
                        />
                        <span className="font-semibold">Admin Panel</span>
                    </Link>
                </div>

                <nav className="p-2 space-y-1">
                    {
                        ADMIN_LINKS.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(link.href)
                                    ? 'bg-[#0c7272] text-white'
                                    : 'text-gray-700 hover:bg-[#0c7272]/10 hover:text-[#0c7272]'
                                    }`}
                            >
                                <span>{link.label}</span>
                            </Link >
                        ))
                    }
                </nav >
            </aside >
        </>
    );
}