"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllRoomTypes, deleteRoomType } from "@/lib/api/roomType";
import { toast } from "react-toastify";
import { Pencil, Trash2, Eye, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface RoomType {
    _id: string;
    accommodationId: {
        _id: string;
        name: string;
    };
    name: string;
    description?: string;
    pricePerNight: number;
    maxGuests: number;
    totalRooms: number;
    isActive: boolean;
    createdAt: string;
}

export default function RoomTypesPage() {
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showInactive, setShowInactive] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    // Filter and paginate room types
    const filteredRoomTypes = (showInactive ? roomTypes : roomTypes.filter((roomType) => roomType.isActive))
        .filter((roomType) =>
            roomType.name.toLowerCase().includes(search.toLowerCase()) ||
            (roomType.description && roomType.description.toLowerCase().includes(search.toLowerCase())) ||
            (typeof roomType.accommodationId === 'object' && roomType.accommodationId.name.toLowerCase().includes(search.toLowerCase()))
        );
    const totalPages = Math.ceil(filteredRoomTypes.length / pageSize);
    const paginatedRoomTypes = filteredRoomTypes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || user?.role !== "admin") {
                router.push("/login");
            }
        }
    }, [isAuthenticated, user, authLoading, router]);

    useEffect(() => {
        if (isAuthenticated && user?.role === "admin") {
            fetchRoomTypes();
        }
    }, [isAuthenticated, user, showInactive]);

    const fetchRoomTypes = async () => {
        try {
            setLoading(true);
            const response = await getAllRoomTypes(undefined, showInactive);
            if (response.success) {
                setRoomTypes(response.data);
                setError("");
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch room types");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (roomTypeId: string, roomTypeName: string) => {
        if (!confirm(`Are you sure you want to delete ${roomTypeName}?`)) {
            return;
        }

        try {
            const response = await deleteRoomType(roomTypeId);
            if (response.success) {
                toast.success("Room type deleted successfully");
                fetchRoomTypes();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to delete room type");
        }
    };

    if (loading && roomTypes.length === 0) {
        return <div className="text-center py-10">Loading room types...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Room Types Management</h1>
                <Link
                    href="/admin/room-types/create"
                    className="flex items-center gap-2 bg-[#0c7272] text-white px-4 py-2 rounded-lg hover:bg-[#0a5555] transition"
                >
                    <Plus size={20} />
                    Create Room Type
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
                    <span className="text-sm text-gray-700">Show inactive room types</span>
                </label>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Room Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Accommodation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price/Night
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Max Guests
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Rooms
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
                        {paginatedRoomTypes.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                    {search ? "No room types match your search" : "No room types found. Create your first room type!"}
                                </td>
                            </tr>
                        ) : (
                            paginatedRoomTypes.map((roomType) => (
                                <tr key={roomType._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{roomType.name}</div>
                                        {roomType.description && (
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {roomType.description}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {typeof roomType.accommodationId === 'object' 
                                            ? roomType.accommodationId.name 
                                            : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        Rs. {roomType.pricePerNight}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {roomType.maxGuests}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {roomType.totalRooms}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            roomType.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {roomType.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                                        <Link
                                            href={`/admin/room-types/${roomType._id}/edit`}
                                            className="text-[#0c7272] hover:text-[#0a5555] inline-flex items-center gap-1"
                                        >
                                            <Pencil size={16} />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(roomType._id, roomType.name)}
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
            {filteredRoomTypes.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredRoomTypes.length)} of {filteredRoomTypes.length} room types
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
