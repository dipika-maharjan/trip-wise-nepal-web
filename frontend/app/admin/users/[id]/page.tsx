"use client";

import { useEffect, useState } from "react";
import { getUserById } from "@/lib/api/admin/user";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Calendar, Shield } from "lucide-react";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (id) {
            fetchUser();
        }
    }, [id]);

    const fetchUser = async () => {
        try {
            const response = await getUserById(id);
            if (response.success) {
                setUser(response.data);
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch user");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading user...</div>;
    }

    if (error || !user) {
        return (
            <div className="space-y-4">
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error || "User not found"}
                </div>
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-2 text-[#0c7272] hover:underline"
                >
                    <ArrowLeft size={16} />
                    Back to Users
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link
                href="/admin/users"
                className="inline-flex items-center gap-2 text-[#0c7272] hover:underline"
            >
                <ArrowLeft size={16} />
                Back to Users
            </Link>

            {/* User Card */}
            <div className="bg-white rounded-lg shadow p-8">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-6">
                        <img
                            src={
                                user.imageUrl
                                    ? `http://localhost:5050/uploads/${user.imageUrl}`
                                    : `http://localhost:5050/uploads/default-profile.png`
                            }
                            alt={user.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-[#0c7272]"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                            <p className="text-gray-500 mt-1">User ID: {user._id}</p>
                        </div>
                    </div>
                    <Link
                        href={`/admin/users/${user._id}/edit`}
                        className="px-4 py-2 bg-[#0c7272] text-white rounded-lg hover:bg-[#0a5555] transition"
                    >
                        Edit User
                    </Link>
                </div>

                {/* User Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="flex items-center gap-3">
                        <Mail className="text-gray-400" size={20} />
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-gray-900 font-medium">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Shield className="text-gray-400" size={20} />
                        <div>
                            <p className="text-sm text-gray-500">Role</p>
                            <span
                                className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                                    user.role === "admin"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-green-100 text-green-800"
                                }`}
                            >
                                {user.role}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Calendar className="text-gray-400" size={20} />
                        <div>
                            <p className="text-sm text-gray-500">Created At</p>
                            <p className="text-gray-900 font-medium">
                                {new Date(user.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Calendar className="text-gray-400" size={20} />
                        <div>
                            <p className="text-sm text-gray-500">Last Updated</p>
                            <p className="text-gray-900 font-medium">
                                {new Date(user.updatedAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}