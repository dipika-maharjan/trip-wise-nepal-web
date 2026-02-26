"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "@/lib/api/admin/user";
import { toast } from "react-toastify";
import { Pencil, Trash2, Eye, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    imageUrl?: string;
    createdAt: string;
}

interface Pagination {
    page: number;
    size: number;
    total: number;
    totalPages: number;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    // Check if user is admin
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || user?.role !== "admin") {
                router.push("/login");
            }
        }
    }, [isAuthenticated, user, authLoading, router]);

    useEffect(() => {
        if (isAuthenticated && user?.role === "admin") {
            fetchUsers(currentPage, pageSize, search);
        }
    }, [isAuthenticated, user, currentPage, pageSize, search]);

    const fetchUsers = async (page: number, size: number, searchTerm: string) => {
        try {
            setLoading(true);
            const response = await getAllUsers(page, size, searchTerm || undefined);
            if (response.success) {
                setUsers(response.data);
                setPagination(response.pagination);
                setError("");
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete ${userName}?`)) {
            return;
        }

        try {
            const response = await deleteUser(userId);
            if (response.success) {
                toast.success("User deleted successfully");
                // Refresh the list
                if (users.length === 1 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchUsers(currentPage, pageSize, search);
                }
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to delete user");
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
            setCurrentPage(newPage);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1);
    };

    if (loading && users.length === 0) {
        return <div className="text-center py-10">Loading users...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <Link
                    href="/admin/users/create"
                    className="flex items-center gap-2 bg-[#0c7272] text-white px-4 py-2 rounded-lg hover:bg-[#0a5555] transition"
                >
                    <Plus size={20} />
                    Create User
                </Link>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Search */}
            <div className="bg-white rounded-lg shadow p-4">
                <input
                    type="text"
                    placeholder="Search by name, email, or username..."
                    value={search}
                    onChange={handleSearch}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                />
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                                                                        {user.imageUrl ? (
                                                                                            <img
                                                                                                src={`http://localhost:5050/uploads/${user.imageUrl}`}
                                                                                                alt={user.name}
                                                                                                className="w-10 h-10 rounded-full object-cover"
                                                                                            />
                                                                                        ) : (
                                                                                            <div className="w-10 h-10 rounded-full bg-[#0c7272] text-white flex items-center justify-center font-bold text-lg uppercase">
                                                                                                {user.name?.charAt(0) || 'U'}
                                                                                            </div>
                                                                                        )}
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.role === "admin"
                                                    ? "bg-purple-100 text-purple-800"
                                                    : "bg-green-100 text-green-800"
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={`/admin/users/${user._id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                            <Link
                                                href={`/admin/users/${user._id}/edit`}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Edit"
                                            >
                                                <Pencil size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(user._id, user.name)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {(pagination.page - 1) * pagination.size + 1} to{" "}
                        {Math.min(pagination.page * pagination.size, pagination.total)} of{" "}
                        {pagination.total} users
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 rounded-lg transition ${
                                        currentPage === page
                                            ? "bg-[#0c7272] text-white"
                                            : "border border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === pagination.totalPages}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}