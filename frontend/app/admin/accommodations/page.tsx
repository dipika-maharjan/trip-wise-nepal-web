"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllAccommodationsAdmin, deleteAccommodation } from "@/lib/api/admin/accommodation";
import { toast } from "react-toastify";
import { Pencil, Trash2, Eye, Plus, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Accommodation {
    _id: string;
    name: string;
    address: string;
    rating: number;
    totalReviews: number;
    isActive: boolean;
    createdAt: string;
    images: string[];
}

export default function AdminAccommodationsPage() {
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showInactive, setShowInactive] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    // Filter accommodations based on search query and active status
    const filteredAccommodations = accommodations.filter((acc) => 
        (showInactive || acc.isActive) &&
        (acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        acc.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAccommodations = filteredAccommodations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAccommodations.length / itemsPerPage);

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
            fetchAccommodations();
        }
    }, [isAuthenticated, user]);

    const fetchAccommodations = async () => {
        try {
            setLoading(true);
            const response = await getAllAccommodationsAdmin();
            if (response.success) {
                const data = Array.isArray(response.data) ? response.data : [response.data];
                console.log('Fetched accommodations:', data.length);
                if (data.length > 0) {
                    console.log('First accommodation:', data[0]);
                    console.log('First accommodation images:', data[0].images);
                }
                setAccommodations(data);
                setError("");
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch accommodations");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (accommodationId: string, accommodationName: string) => {
        if (!confirm(`Are you sure you want to delete "${accommodationName}"?`)) {
            return;
        }

        try {
            const response = await deleteAccommodation(accommodationId);
            if (response.success) {
                toast.success("Accommodation deleted successfully");
                setSearchQuery(""); // Clear search
                setCurrentPage(1); // Reset to first page
                fetchAccommodations();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to delete accommodation");
        }
    };

    if (loading && accommodations.length === 0) {
        return <div className="text-center py-10">Loading accommodations...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Accommodation Management</h1>
                <Link
                    href="/admin/accommodations/create"
                    className="flex items-center gap-2 bg-[#0c7272] text-white px-4 py-2 rounded-lg hover:bg-[#0a5555] transition w-fit"
                >
                    <Plus size={20} />
                    Create Accommodation
                </Link>
            </div>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or address..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]/20"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1); // Reset to first page when searching
                        }}
                    />
                </div>
                {searchQuery && (
                    <p className="text-sm text-gray-600 mt-2">
                        Found {filteredAccommodations.length} result{filteredAccommodations.length !== 1 ? 's' : ''} for "{searchQuery}"
                    </p>
                )}
            </div>

            {/* Filter Toggle */}
            <div className="bg-white p-4 rounded-lg shadow">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={(e) => {
                            setShowInactive(e.target.checked);
                            setCurrentPage(1);
                        }}
                        className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Show Inactive Accommodations</span>
                </label>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Total Accommodations</p>
                    <p className="text-2xl font-bold text-gray-800">{accommodations.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                        {accommodations.filter(a => a.isActive).length}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-gray-500 text-sm">Inactive</p>
                    <p className="text-2xl font-bold text-red-600">
                        {accommodations.filter(a => !a.isActive).length}
                    </p>
                </div>
            </div>

            {/* Accommodations Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Image
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Accommodation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Address
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rating
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentAccommodations.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    {searchQuery ? "No accommodations match your search" : "No accommodations found. Create your first accommodation!"}
                                </td>
                            </tr>
                        ) : (
                            currentAccommodations.map((accommodation) => (
                                <tr key={accommodation._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                            {accommodation.images && accommodation.images.length > 0 ? (
                                                <img
                                                    src={accommodation.images[0].startsWith('http') 
                                                        ? accommodation.images[0] 
                                                        : `http://localhost:5050${accommodation.images[0]}`}
                                                    alt={accommodation.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-gray-400 text-xs">No image</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {accommodation.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500 max-w-xs truncate">
                                            {accommodation.address}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            ⭐ {(accommodation.rating ?? 0).toFixed(1)} ({accommodation.totalReviews ?? 0})
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            accommodation.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {accommodation.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/accommodations/${accommodation._id}`}
                                                target="_blank"
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View"
                                            >
                                                <Eye size={18} />
                                            </Link>
                                            <Link
                                                href={`/admin/accommodations/${accommodation._id}/edit`}
                                                className="text-[#0c7272] hover:text-[#0a5555]"
                                                title="Edit"
                                            >
                                                <Pencil size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(accommodation._id, accommodation.name)}
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

                {/* Table Footer with Pagination Info */}
                {filteredAccommodations.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAccommodations.length)} of {filteredAccommodations.length} accommodations
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

            {/* Pagination Controls */}
            {/* Pagination Controls removed: now handled in table footer above for consistency with user management */}
        </div>
    );
}
