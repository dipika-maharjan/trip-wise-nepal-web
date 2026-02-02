"use client";

import { useAuth } from "@/context/AuthContext";
import { Users, UserCheck, Shield, UserPlus, Settings, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllUsers } from "@/lib/api/admin/user";

interface DashboardStats {
    totalUsers: number;
    adminUsers: number;
    regularUsers: number;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        adminUsers: 0,
        regularUsers: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await getAllUsers();
            if (response.success) {
                const users = response.data;
                setStats({
                    totalUsers: users.length,
                    adminUsers: users.filter((u: any) => u.role === "admin").length,
                    regularUsers: users.filter((u: any) => u.role === "user").length,
                });
            }
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-br from-[#0c7272] via-[#0a5555] to-[#084848] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
                            </div>
                            <div className="hidden lg:block">
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Total Users Card */}
                    <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-[#0c7272] hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-gradient-to-br from-[#0c7272]/10 to-[#0c7272]/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                <Users className="text-[#0c7272]" size={26} />
                            </div>
                            <span className="text-[11px] font-semibold px-2.5 py-1 bg-[#0c7272]/10 text-[#0c7272] rounded-full">
                                Total
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900 mb-2">
                            {loading ? "..." : stats.totalUsers}
                        </p>
                        <p className="text-xs text-gray-500">Registered on platform</p>
                    </div>


                    {/* Admin Users Card */}
                    <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-[#0c7272] hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-gradient-to-br from-[#0c7272]/10 to-[#0c7272]/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                <Shield className="text-[#0c7272]" size={26} />
                            </div>
                            <span className="text-[11px] font-semibold px-2.5 py-1 bg-[#0c7272]/10 text-[#0c7272] rounded-full">
                                Admin
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium mb-1">Admin Users</p>
                        <p className="text-2xl font-bold text-gray-900 mb-2">
                            {loading ? "..." : stats.adminUsers}
                        </p>
                        <p className="text-xs text-gray-500">Full access granted</p>
                    </div>
                </div>

                {/* Quick Actions Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Manage Users Card */}
                    <Link href="/admin/users">
                        <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-[#0c7272] cursor-pointer group">
                            <div className="flex items-start gap-6">
                                <div className="bg-gradient-to-br from-[#0c7272] to-[#0a5555] p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                                    <Users className="text-white" size={26} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#0c7272] transition-colors">
                                        Manage Users
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        View, edit, and manage all registered users on the platform
                                    </p>
                                    <div className="flex items-center text-sm text-[#0c7272] font-semibold group-hover:gap-2 transition-all">
                                        Go to Users
                                        <span className="ml-2 group-hover:ml-4 transition-all">→</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Create User Card */}
                    <Link href="/admin/users/create">
                        <div className="bg-gradient-to-br from-[#0c7272] to-[#0a5555] rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group">
                            <div className="flex items-start gap-6">
                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl group-hover:scale-110 transition-transform border border-white/30">
                                    <UserPlus className="text-white" size={26} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        Create New User
                                    </h3>
                                    <p className="text-sm text-white/90 mb-3">
                                        Add a new user account with custom roles and permissions
                                    </p>
                                    <div className="flex items-center text-sm text-white font-semibold group-hover:gap-2 transition-all">
                                        Create User
                                        <span className="ml-2 group-hover:ml-4 transition-all">→</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                
            </div>
        </div>
    );
}