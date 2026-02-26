"use client";

import { useEffect, useState, use } from "react";
import { getBookingById } from "@/lib/api/booking";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Users, DoorOpen } from "lucide-react";

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

export default function BookingDetailPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const [bookingData, setBookingData] = useState<BookingDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (resolvedParams.id && resolvedParams.id !== 'undefined') {
            fetchBookingDetails();
        } else {
            toast.error("Invalid booking ID");
            router.push("/user/bookings");
        }
        // Listen for eSewa redirect with payment success/failure
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (
                url.pathname.endsWith('/payment/success') ||
                url.pathname.endsWith('/payment/failure')
            ) {
                // After payment, always refresh booking details
                fetchBookingDetails();
            }
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
            router.push("/user/bookings");
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
        return <div className="container mx-auto px-4 py-8 text-center">Loading booking details...</div>;
    }

    if (!bookingData) {
        return <div className="container mx-auto px-4 py-8 text-center">Booking not found</div>;
    }

    const { booking, extras } = bookingData;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link
                href="/user/bookings"
                className="inline-flex items-center gap-2 text-[#0c7272] hover:text-[#0a5555] mb-6"
            >
                <ArrowLeft size={20} />
                Back to My Bookings
            </Link>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-[#0c7272] text-white p-6">
                    <h1 className="text-2xl font-bold">Booking Confirmation</h1>
                    <p className="text-sm opacity-90 mt-1">Booking ID: #{booking._id.slice(-8)}</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">
                                    {typeof booking.accommodationId === 'object' 
                                        ? booking.accommodationId.name 
                                        : 'N/A'}
                                </h2>
                                <p className="text-gray-600">
                                    {typeof booking.roomTypeId === 'object' 
                                        ? booking.roomTypeId.name 
                                        : 'N/A'}
                                </p>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <Calendar className="text-[#0c7272] mt-1" size={20} />
                                <div>
                                    <div className="font-semibold text-gray-800">Check-in</div>
                                    <div className="text-sm text-gray-600">{formatDate(booking.checkIn)}</div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <Calendar className="text-[#0c7272] mt-1" size={20} />
                                <div>
                                    <div className="font-semibold text-gray-800">Check-out</div>
                                    <div className="text-sm text-gray-600">{formatDate(booking.checkOut)}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <Users className="text-[#0c7272]" size={20} />
                                <div>
                                    <span className="font-semibold text-gray-800">{booking.guests}</span>
                                    <span className="text-gray-600"> guest{booking.guests > 1 ? 's' : ''}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <DoorOpen className="text-[#0c7272]" size={20} />
                                <div>
                                    <span className="font-semibold text-gray-800">{booking.roomsBooked}</span>
                                    <span className="text-gray-600"> room{booking.roomsBooked > 1 ? 's' : ''}</span>
                                    <span className="text-gray-600"> • {booking.nights} night{booking.nights > 1 ? 's' : ''}</span>
                                </div>
                            </div>

                            {booking.specialRequest && (
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="font-semibold text-gray-800 mb-1">Special Request</div>
                                    <div className="text-sm text-gray-600">{booking.specialRequest}</div>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                                <h3 className="text-lg font-bold text-gray-800">Price Summary</h3>
                                
                                <div className="space-y-2">
                                    {/* Show breakdown but DO NOT recalc total */}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Room ({booking.nights} × {booking.roomsBooked})
                                        </span>
                                        <span className="font-medium">Rs. {booking.basePriceTotal.toFixed(2)}</span>
                                    </div>

                                    {extras && extras.length > 0 && (
                                        <>
                                            <div className="pt-2 border-t">
                                                <div className="text-sm font-semibold text-gray-700 mb-2">
                                                    Optional Extras
                                                </div>
                                                {extras.map((extra, index) => (
                                                    <div key={index} className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600">
                                                            {extra.name} (×{extra.quantity})
                                                        </span>
                                                        <span>Rs. {extra.total.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-sm border-t pt-2">
                                                <span className="text-gray-600">Extras Subtotal</span>
                                                <span className="font-medium">Rs. {booking.extrasTotal.toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax (13%)</span>
                                        <span>Rs. {booking.tax.toFixed(2)}</span>
                                    </div>
                                    
                                    {booking.serviceFee > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Service Fee</span>
                                            <span>Rs. {booking.serviceFee.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* FINAL TOTAL from backend */}
                                <div className="pt-4 border-t-2 border-gray-300">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-800">Total</span>
                                        <span className="text-2xl font-bold text-[#0c7272]">
                                            Rs. {booking.totalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Booking Status</span>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                            booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                                            booking.bookingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            booking.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {booking.bookingStatus}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Payment Status</span>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                            booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {booking.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <p className="text-xs text-gray-600">
                                    Booked on {new Date(booking.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                                                </div>
                                                {/* Pay with eSewa button */}
                                                {booking.paymentStatus !== 'paid' && (
                                                    <div className="mt-6 flex justify-end">
                                                        <button
                                                            className="bg-[#0c7272] hover:bg-[#0a5555] text-white font-semibold px-6 py-2 rounded shadow"
                                                            onClick={async () => {
                                                                const res = await fetch('/api/payment/esewa/initiate', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ amount: booking.totalPrice, bookingId: booking._id }),
                                                                });
                                                                const data = await res.json();
                                                                if (data.esewaUrl && data.formData) {
                                                                    // Create and submit a form for POST
                                                                    const form = document.createElement('form');
                                                                    form.method = 'POST';
                                                                    form.action = data.esewaUrl;
                                                                    Object.entries(data.formData).forEach(([key, value]) => {
                                                                        const input = document.createElement('input');
                                                                        input.type = 'hidden';
                                                                        input.name = key;
                                                                        input.value = String(value);
                                                                        form.appendChild(input);
                                                                    });
                                                                    document.body.appendChild(form);
                                                                    form.submit();
                                                                } else {
                                                                    alert('Failed to initiate payment');
                                                                }
                                                            }}
                                                        >
                                                            Pay with eSewa
                                                        </button>
                                                    </div>
                                                )}
                    </div>
                </div>
            </div>
        </div>
    );
}
