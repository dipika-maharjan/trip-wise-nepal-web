"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllBookings, cancelBooking, updateBookingStatuses, deleteBooking } from "@/lib/api/booking";
import { toast } from "react-toastify";
import { Eye, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Booking {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
    };
    accommodationId: {
        _id: string;
        name: string;
    };
    roomTypeId: {
        _id: string;
        name: string;
    };
    checkIn: string;
    checkOut: string;
    guests: number;
    roomsBooked: number;
    nights: number;
    totalPrice: number;
    bookingStatus: string;
    paymentStatus: string;
    createdAt: string;
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCancelled, setShowCancelled] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const activeBookings = bookings.filter((booking) => booking.bookingStatus !== "cancelled");
    const visibleBookings = showCancelled ? bookings : activeBookings;

    // Search filter
    const filteredBookings = visibleBookings.filter((booking) => {
        const guestName = typeof booking.userId === 'object' ? booking.userId.name : '';
        const guestEmail = typeof booking.userId === 'object' ? booking.userId.email : '';
        const accommodationName = typeof booking.accommodationId === 'object' ? booking.accommodationId.name : '';
        const roomTypeName = typeof booking.roomTypeId === 'object' ? booking.roomTypeId.name : '';
        return (
            guestName.toLowerCase().includes(search.toLowerCase()) ||
            guestEmail.toLowerCase().includes(search.toLowerCase()) ||
            accommodationName.toLowerCase().includes(search.toLowerCase()) ||
            roomTypeName.toLowerCase().includes(search.toLowerCase()) ||
            booking._id.toLowerCase().includes(search.toLowerCase())
        );
    });

    // Pagination
    const totalPages = Math.ceil(filteredBookings.length / pageSize);
    const paginatedBookings = filteredBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated || user?.role !== "admin") {
                router.push("/login");
            }
        }
    }, [isAuthenticated, user, authLoading, router]);

    useEffect(() => {
        if (isAuthenticated && user?.role === "admin") {
            fetchBookings();
        }
    }, [isAuthenticated, user]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await getAllBookings();
            if (response.success) {
                setBookings(response.data);
                setError("");
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch bookings");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId: string, accommodationName: string) => {
        if (!confirm(`Are you sure you want to cancel booking for ${accommodationName}?`)) {
            return;
        }

        try {
            const response = await cancelBooking(bookingId);
            if (response.success) {
                toast.success("Booking cancelled successfully");
                setShowCancelled(true);
                fetchBookings();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to cancel booking");
        }
    };

    const handleStatusUpdate = async (
        bookingId: string,
        payload: { bookingStatus?: string; paymentStatus?: string }
    ) => {
        try {
            const response = await updateBookingStatuses(bookingId, payload);
            if (response.success) {
                toast.success("Booking updated successfully");
                fetchBookings();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update booking");
            fetchBookings();
        }
    };

    const handleDelete = async (bookingId: string) => {
        if (!confirm("Are you sure you want to permanently delete this booking?")) {
            return;
        }

        try {
            const response = await deleteBooking(bookingId);
            if (response.success) {
                toast.success("Booking deleted successfully");
                fetchBookings();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to delete booking");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading && bookings.length === 0) {
        return <div className="text-center py-10">Loading bookings...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Bookings Management</h1>
                <div className="text-sm text-gray-600">
                    Active Bookings: <span className="font-semibold">{activeBookings.length}</span>
                </div>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showCancelled}
                        onChange={(e) => setShowCancelled(e.target.checked)}
                        className="w-4 h-4 text-[#0c7272] border-gray-300 rounded focus:ring-[#0c7272]"
                    />
                    <span className="text-sm text-gray-700">Show cancelled bookings</span>
                </label>
                <input
                    type="text"
                    value={search}
                    onChange={e => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                    placeholder="Search bookings..."
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                    style={{ minWidth: 220 }}
                />
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Booking ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Guest
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Accommodation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Check-In / Out
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
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
                        {paginatedBookings.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                    No bookings found
                                </td>
                            </tr>
                        ) : (
                            paginatedBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-mono text-gray-900">
                                        #{booking._id.slice(-6)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {typeof booking.userId === 'object' ? booking.userId.name : 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {typeof booking.userId === 'object' ? booking.userId.email : ''}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {typeof booking.accommodationId === 'object' 
                                                ? booking.accommodationId.name 
                                                : 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {typeof booking.roomTypeId === 'object' 
                                                ? booking.roomTypeId.name 
                                                : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div>{formatDate(booking.checkIn)}</div>
                                        <div>{formatDate(booking.checkOut)}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div>{booking.guests} guests</div>
                                        <div>{booking.roomsBooked} room{booking.roomsBooked > 1 ? 's' : ''}</div>
                                        <div>{booking.nights} night{booking.nights > 1 ? 's' : ''}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                        Rs. {booking.totalPrice.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            <select
                                                value={booking.bookingStatus}
                                                onChange={(e) => handleStatusUpdate(booking._id, { bookingStatus: e.target.value })}
                                                className="w-full text-xs border border-gray-300 rounded-md px-2 py-1"
                                            >
                                                <option value="pending">pending</option>
                                                <option value="confirmed">confirmed</option>
                                                <option value="cancelled">cancelled</option>
                                                <option value="completed">completed</option>
                                            </select>
                                            <select
                                                value={booking.paymentStatus}
                                                onChange={(e) => handleStatusUpdate(booking._id, { paymentStatus: e.target.value })}
                                                className="w-full text-xs border border-gray-300 rounded-md px-2 py-1"
                                            >
                                                <option value="pending">pending</option>
                                                <option value="paid">paid</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                                        <Link
                                            href={`/admin/bookings/${booking._id}`}
                                            className="text-[#0c7272] hover:text-[#0a5555] inline-flex items-center gap-1"
                                        >
                                            <Eye size={16} />
                                            View
                                        </Link>
                                        {booking.bookingStatus !== 'cancelled' && (
                                            <button
                                                onClick={() => handleCancel(
                                                    booking._id,
                                                    typeof booking.accommodationId === 'object' 
                                                        ? booking.accommodationId.name 
                                                        : 'this accommodation'
                                                )}
                                                className="text-red-600 hover:text-red-800 inline-flex items-center gap-1 ml-2"
                                            >
                                                <XCircle size={16} />
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(booking._id)}
                                            className="text-red-700 hover:text-red-900 inline-flex items-center gap-1 ml-2"
                                        >
                                            <XCircle size={16} />
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {filteredBookings.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredBookings.length)} of {filteredBookings.length} bookings
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
