"use client";

import { useEffect, useState } from "react";
import { getMyBookings, cancelBooking } from "@/lib/api/booking";
import { toast } from "react-toastify";
import Link from "next/link";
import { Eye, XCircle, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Booking {
    _id: string;
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

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCancelled, setShowCancelled] = useState(false);
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    const visibleBookings = showCancelled
        ? bookings
        : bookings.filter((booking) => booking.bookingStatus !== "cancelled");

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push("/login");
            }
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchBookings();
        }
    }, [isAuthenticated]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await getMyBookings();
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
        if (!confirm(`Are you sure you want to cancel your booking for ${accommodationName}?`)) {
            return;
        }

        try {
            const response = await cancelBooking(bookingId);
            if (response.success) {
                toast.success("Booking cancelled successfully");
                fetchBookings();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to cancel booking");
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
        return <div className="text-center py-10">Loading your bookings...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                </div>
            )}

            {bookings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow">
                    <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">No bookings yet</h2>
                    <p className="text-gray-500 mt-2">Start exploring accommodations and make your first booking!</p>
                    <Link
                        href="/"
                        className="inline-block mt-6 px-6 py-3 bg-[#0c7272] text-white rounded-lg hover:bg-[#0a5555] transition"
                    >
                        Browse Accommodations
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showCancelled}
                                onChange={(e) => setShowCancelled(e.target.checked)}
                                className="w-4 h-4 text-[#0c7272] border-gray-300 rounded focus:ring-[#0c7272]"
                            />
                            <span className="text-sm text-gray-700">Show cancelled bookings</span>
                        </label>
                    </div>
                    {visibleBookings.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-lg shadow text-gray-500">
                            No bookings found
                        </div>
                    ) : (
                        visibleBookings.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {typeof booking.accommodationId === 'object' 
                                            ? booking.accommodationId.name 
                                            : 'N/A'}
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        {typeof booking.roomTypeId === 'object' 
                                            ? booking.roomTypeId.name 
                                            : 'N/A'}
                                    </p>

                                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">Check-in:</span>
                                            <div className="font-semibold">{formatDate(booking.checkIn)}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Check-out:</span>
                                            <div className="font-semibold">{formatDate(booking.checkOut)}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Guests:</span>
                                            <div className="font-semibold">{booking.guests} guest{booking.guests > 1 ? 's' : ''}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Rooms:</span>
                                            <div className="font-semibold">{booking.roomsBooked} room{booking.roomsBooked > 1 ? 's' : ''}</div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-3">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                                            {booking.bookingStatus}
                                        </span>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.paymentStatus)}`}>
                                            Payment: {booking.paymentStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-2xl font-bold text-[#0c7272]">
                                        Rs. {booking.totalPrice.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {booking.nights} night{booking.nights > 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3 border-t pt-4">
                                <Link
                                    href={`/user/bookings/${booking._id}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#0c7272] text-white rounded-lg hover:bg-[#0a5555] transition text-sm"
                                >
                                    <Eye size={16} />
                                    View Details
                                </Link>
                                {booking.bookingStatus !== 'cancelled' && booking.bookingStatus !== 'completed' && (
                                    <Link
                                        href={`/user/bookings/${booking._id}/edit`}
                                        className="flex items-center gap-2 px-4 py-2 border border-[#0c7272] text-[#0c7272] rounded-lg hover:bg-[#0c7272]/10 transition text-sm"
                                    >
                                        Edit Booking
                                    </Link>
                                )}
                                {booking.bookingStatus !== 'cancelled' && booking.bookingStatus !== 'completed' && (
                                    <button
                                        onClick={() => handleCancel(
                                            booking._id,
                                            typeof booking.accommodationId === 'object' 
                                                ? booking.accommodationId.name 
                                                : 'this accommodation'
                                        )}
                                        className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition text-sm"
                                    >
                                        <XCircle size={16} />
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
