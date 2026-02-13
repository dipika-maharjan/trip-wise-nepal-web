"use client";

import { useEffect, useState, use } from "react";
import { getBookingById } from "@/lib/api/booking";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BookingDetails {
    booking: any;
    extras: {
        name: string;
        quantity: number;
        total: number;
    }[];
}

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function AdminBookingDetailPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const [bookingData, setBookingData] = useState<BookingDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (resolvedParams.id && resolvedParams.id !== 'undefined') {
            fetchBookingDetails();
        } else {
            toast.error("Invalid booking ID");
            router.push("/admin/bookings");
        }
    }, [resolvedParams.id]);

    const fetchBookingDetails = async () => {
        try {
            const response = await getBookingById(resolvedParams.id);
            if (response.success) {
                setBookingData(response.data);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to load booking details");
            router.push("/admin/bookings");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className="text-center py-10">Loading booking details...</div>;
    }

    if (!bookingData) {
        return <div className="text-center py-10">Booking not found</div>;
    }

    const { booking, extras } = bookingData;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link
                href="/admin/bookings"
                className="inline-flex items-center gap-2 text-[#0c7272] hover:text-[#0a5555]"
            >
                <ArrowLeft size={20} />
                Back to Bookings
            </Link>

            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Booking Details</h1>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Guest Information</h2>
                        <div className="space-y-2">
                            <div>
                                <span className="text-sm text-gray-600">Name:</span>
                                <span className="ml-2 font-medium">
                                    {typeof booking.userId === 'object' ? booking.userId.name : 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Email:</span>
                                <span className="ml-2 font-medium">
                                    {typeof booking.userId === 'object' ? booking.userId.email : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-4">Booking Information</h2>
                        <div className="space-y-2">
                            <div>
                                <span className="text-sm text-gray-600">Booking ID:</span>
                                <span className="ml-2 font-mono text-sm">#{booking._id.slice(-8)}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Created:</span>
                                <span className="ml-2">{formatDate(booking.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="my-6" />

                <div>
                    <h2 className="text-lg font-semibold mb-4">Accommodation Details</h2>
                    <div className="space-y-2">
                        <div>
                            <span className="text-sm text-gray-600">Accommodation:</span>
                            <span className="ml-2 font-medium">
                                {typeof booking.accommodationId === 'object' 
                                    ? booking.accommodationId.name 
                                    : 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Room Type:</span>
                            <span className="ml-2 font-medium">
                                {typeof booking.roomTypeId === 'object' 
                                    ? booking.roomTypeId.name 
                                    : 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Check-in:</span>
                            <span className="ml-2">{formatDate(booking.checkIn)}</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Check-out:</span>
                            <span className="ml-2">{formatDate(booking.checkOut)}</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Nights:</span>
                            <span className="ml-2 font-medium">{booking.nights}</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Guests:</span>
                            <span className="ml-2 font-medium">{booking.guests}</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Rooms Booked:</span>
                            <span className="ml-2 font-medium">{booking.roomsBooked}</span>
                        </div>
                        {booking.specialRequest && (
                            <div>
                                <span className="text-sm text-gray-600">Special Request:</span>
                                <p className="mt-1 text-sm">{booking.specialRequest}</p>
                            </div>
                        )}
                    </div>
                </div>

                <hr className="my-6" />

                <div>
                    <h2 className="text-lg font-semibold mb-4">Price Breakdown</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Base Price ({booking.nights} nights × {booking.roomsBooked} room{booking.roomsBooked > 1 ? 's' : ''}):</span>
                            <span className="font-medium">Rs. {booking.basePriceTotal.toFixed(2)}</span>
                        </div>
                        
                        {extras && extras.length > 0 && (
                            <>
                                <div className="text-sm font-semibold text-gray-700 mt-3">Optional Extras:</div>
                                {extras.map((extra, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {extra.name} (×{extra.quantity})
                                        </span>
                                        <span>Rs. {extra.total.toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between border-t pt-2">
                                    <span className="text-gray-600">Extras Total:</span>
                                    <span className="font-medium">Rs. {booking.extrasTotal.toFixed(2)}</span>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between">
                            <span className="text-gray-600">Tax (13%):</span>
                            <span>Rs. {booking.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Service Fee:</span>
                            <span>Rs. {booking.serviceFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t pt-2">
                            <span>TOTAL:</span>
                            <span className="text-[#0c7272]">Rs. {booking.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <hr className="my-6" />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm text-gray-600">Booking Status:</span>
                        <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${
                            booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.bookingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {booking.bookingStatus}
                        </span>
                    </div>
                    <div>
                        <span className="text-sm text-gray-600">Payment Status:</span>
                        <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${
                            booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            booking.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                            {booking.paymentStatus}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
