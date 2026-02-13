"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllOptionalExtras, deleteOptionalExtra } from "@/lib/api/optionalExtra";
import { toast } from "react-toastify";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface OptionalExtra {
    _id: string;
    accommodationId: {
        _id: string;
        name: string;
    };
    name: string;
    description?: string;
    price: number;
    priceType: "per_person" | "per_booking";
    isActive: boolean;
    createdAt: string;
}

export default function OptionalExtrasPage() {
    const [extras, setExtras] = useState<OptionalExtra[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showInactive, setShowInactive] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    // Filter and paginate extras
    const filteredExtras = (showInactive ? extras : extras.filter((extra) => extra.isActive))
        .filter((extra) =>
            extra.name.toLowerCase().includes(search.toLowerCase()) ||
            (extra.description && extra.description.toLowerCase().includes(search.toLowerCase())) ||
            (typeof extra.accommodationId === 'object' && extra.accommodationId.name.toLowerCase().includes(search.toLowerCase()))
        );
    const totalPages = Math.ceil(filteredExtras.length / pageSize);
    const paginatedExtras = filteredExtras.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || user?.role !== "admin") {
                router.push("/login");
            }
        }
    }, [isAuthenticated, user, authLoading, router]);

    useEffect(() => {
        if (isAuthenticated && user?.role === "admin") {
            fetchExtras();
        }
    }, [isAuthenticated, user, showInactive]);

    const fetchExtras = async () => {
        try {
            setLoading(true);
            const response = await getAllOptionalExtras(undefined, showInactive);
            if (response.success) {
                setExtras(response.data);
                setError("");
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch optional extras");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (extraId: string, extraName: string) => {
        if (!confirm(`Are you sure you want to delete ${extraName}?`)) {
            return;
        }

        try {
            const response = await deleteOptionalExtra(extraId);
            if (response.success) {
                toast.success("Optional extra deleted successfully");
                fetchExtras();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to delete optional extra");
        }
    };

    if (loading && extras.length === 0) {
        return <div className="text-center py-10">Loading optional extras...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Optional Extras Management</h1>
                <Link
                    href="/admin/optional-extras/create"
                    className="flex items-center gap-2 bg-[#0c7272] text-white px-4 py-2 rounded-lg hover:bg-[#0a5555] transition"
                >
                    <Plus size={20} />
                    Create Optional Extra
                </Link>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Search */}
            <div className="bg-white rounded-lg shadow p-4">
                <input
                    type="text"
                    placeholder="Search by name, description, or accommodation..."
                    value={search}
                    onChange={e => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                />
            </div>

            {/* Filter Toggle */}
            <div className="bg-white rounded-lg shadow p-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={e => {
                            setShowInactive(e.target.checked);
                            setCurrentPage(1);
                        }}
                        className="w-4 h-4 text-[#0c7272] border-gray-300 rounded focus:ring-[#0c7272]"
                    />
                    <span className="text-sm text-gray-700">Show inactive extras</span>
                </label>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Extra Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Accommodation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedExtras.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                    {search ? "No optional extras match your search" : "No optional extras found. Create your first optional extra!"}
                                </td>
                            </tr>
                        ) : (
                            paginatedExtras.map((extra) => (
                                <tr key={extra._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{extra.name}</div>
                                        {extra.description && (
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {extra.description}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {typeof extra.accommodationId === 'object' 
                                            ? extra.accommodationId.name 
                                            : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        Rs. {extra.price}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            extra.priceType === 'per_person' 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'bg-purple-100 text-purple-800'
                                        }`}>
                                            {extra.priceType === 'per_person' ? 'Per Person' : 'Per Booking'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            extra.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {extra.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                                        <Link
                                            href={`/admin/optional-extras/${extra._id}/edit`}
                                            className="text-[#0c7272] hover:text-[#0a5555] inline-flex items-center gap-1"
                                        >
                                            <Pencil size={16} />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(extra._id, extra.name)}
                                            className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 ml-2"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredExtras.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredExtras.length)} of {filteredExtras.length} optional extras
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg>
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
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
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
