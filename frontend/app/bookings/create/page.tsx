"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAccommodationById } from "@/lib/api/accommodation";
import { getRoomTypesByAccommodation } from "@/lib/api/roomType";
import { getOptionalExtrasByAccommodation } from "@/lib/api/optionalExtra";
import { handleCreateBooking } from "@/lib/actions/booking-action";
import { toast } from "react-toastify";
import Link from "next/link";
import { ArrowLeft, Calendar, Users, DoorOpen, Plus, Minus } from "lucide-react";
import Navbar from "@/app/components/navbar/Navbar";
import Footer from "@/app/components/footer/Footer";
import { useAuth } from "@/context/AuthContext";

interface RoomType {
    _id: string;
    name: string;
    description?: string;
    pricePerNight: number;
    maxGuests: number;
    totalRooms: number;
}

interface OptionalExtra {
    _id: string;
    name: string;
    description?: string;
    price: number;
    priceType: "per_person" | "per_booking";
}

interface Accommodation {
    _id: string;
    name: string;
    address: string;
    images: string[];
}

export default function CreateBookingPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const accommodationId = searchParams.get("accommodationId");

    const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [optionalExtras, setOptionalExtras] = useState<OptionalExtra[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [selectedRoomType, setSelectedRoomType] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(1);
    const [roomsBooked, setRoomsBooked] = useState(1);
    const [selectedExtras, setSelectedExtras] = useState<{ [key: string]: number }>({});
    const [specialRequest, setSpecialRequest] = useState("");

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error("Please login to make a booking");
            router.push(`/login?redirect=/bookings/create?accommodationId=${accommodationId}`);
            return;
        }

        if (!accommodationId) {
            toast.error("Invalid accommodation");
            router.push("/accommodations");
            return;
        }

        fetchData();
    }, [accommodationId, isAuthenticated]);

    const fetchData = async () => {
        try {
            const [accommodationRes, roomTypesRes, extrasRes] = await Promise.all([
                getAccommodationById(accommodationId!),
                getRoomTypesByAccommodation(accommodationId!),
                getOptionalExtrasByAccommodation(accommodationId!),
            ]);

            if (accommodationRes.success) {
                // Fix: Only set single Accommodation, not array
                if (Array.isArray(accommodationRes.data)) {
                    setAccommodation(accommodationRes.data[0] || null);
                } else {
                    setAccommodation(accommodationRes.data);
                }
            }

            if (roomTypesRes.success) {
                const roomTypesList = Array.isArray(roomTypesRes.data) 
                    ? roomTypesRes.data 
                    : [roomTypesRes.data];
                setRoomTypes(roomTypesList.filter((rt: RoomType) => rt.totalRooms > 0));
            }

            if (extrasRes.success) {
                const extrasList = Array.isArray(extrasRes.data) 
                    ? extrasRes.data 
                    : [extrasRes.data];
                setOptionalExtras(extrasList);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to load booking details");
        } finally {
            setLoading(false);
        }
    };

    const calculateNights = () => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const calculateTotalPrice = () => {
        const nights = calculateNights();
        if (!selectedRoomType || nights === 0) return 0;

        const roomType = roomTypes.find(rt => rt._id === selectedRoomType);
        if (!roomType) return 0;

        let total = roomType.pricePerNight * nights * roomsBooked;

        // Add extras
        Object.entries(selectedExtras).forEach(([extraId, quantity]) => {
            const extra = optionalExtras.find(e => e._id === extraId);
            if (extra && quantity > 0) {
                if (extra.priceType === "per_person") {
                    total += extra.price * guests * quantity;
                } else {
                    total += extra.price * quantity;
                }
            }
        });

        return total;
    };

    const handleExtraQuantityChange = (extraId: string, change: number) => {
        setSelectedExtras(prev => {
            const current = prev[extraId] || 0;
            const newValue = Math.max(0, current + change);
            if (newValue === 0) {
                const { [extraId]: removed, ...rest } = prev;
                return rest;
            }
            return { ...prev, [extraId]: newValue };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRoomType) {
            toast.error("Please select a room type");
            return;
        }

        if (!checkIn || !checkOut) {
            toast.error("Please select check-in and check-out dates");
            return;
        }

        const nights = calculateNights();
        if (nights <= 0) {
            toast.error("Check-out must be after check-in");
            return;
        }

        const roomType = roomTypes.find(rt => rt._id === selectedRoomType);
        if (roomType && guests > roomType.maxGuests * roomsBooked) {
            toast.error(`Maximum ${roomType.maxGuests} guests per room`);
            return;
        }

        setSubmitting(true);

        try {
            const extras = Object.entries(selectedExtras)
                .filter(([extraId, quantity]) => extraId && quantity > 0)
                .map(([extraId, quantity]) => ({
                    extraId,
                    quantity,
                }));

            const bookingPayload: any = {
                accommodationId: accommodationId!,
                roomTypeId: selectedRoomType,
                checkIn: new Date(checkIn).toISOString(),
                checkOut: new Date(checkOut).toISOString(),
                guests,
                roomsBooked,
                paymentStatus: "pending",
            };

            if (extras.length > 0) {
                bookingPayload.extras = extras;
            }

            if (specialRequest.trim()) {
                bookingPayload.specialRequest = specialRequest.trim();
            }

            const response = await handleCreateBooking(bookingPayload);

            if (response.success) {
                toast.success("Booking created successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                router.push("/user/bookings");
            } else {
                toast.error(response.message || "Booking failed");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to create booking");
        } finally {
            setSubmitting(false);
        }
    };

    const selectedRoomTypeData = roomTypes.find(rt => rt._id === selectedRoomType);
    const nights = calculateNights();
    const totalPrice = calculateTotalPrice();
    const minDate = new Date().toISOString().split('T')[0];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0c7272]"></div>
                </div>
            </div>
        );
    }

    if (!accommodation) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-10">
                    <p className="text-center text-gray-600">Accommodation not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 py-8">
                <Link href={`/accommodations/${accommodationId}`} className="inline-flex items-center gap-2 text-[#0c7272] hover:text-[#134e4a] mb-6">
                    <ArrowLeft size={20} />
                    Back to Accommodation
                </Link>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Booking Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Booking</h1>
                            <p className="text-gray-600 mb-6">{accommodation.name}</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Room Type Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Select Room Type *
                                    </label>
                                    <select
                                        value={selectedRoomType}
                                        onChange={(e) => setSelectedRoomType(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                                        required
                                    >
                                        <option value="">Choose a room type</option>
                                        {roomTypes.map((roomType) => (
                                            <option key={roomType._id} value={roomType._id}>
                                                {roomType.name} | Rs. {roomType.pricePerNight.toLocaleString()}/night | Max {roomType.maxGuests} guests | {roomType.totalRooms} rooms available
                                            </option>
                                        ))}
                                    </select>
                                    {selectedRoomTypeData?.description && (
                                        <p className="text-sm text-gray-600 mt-2">{selectedRoomTypeData.description}</p>
                                    )}
                                </div>

                                {/* Dates */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <Calendar className="inline mr-2" size={16} />
                                            Check-in Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={checkIn}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                            min={minDate}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <Calendar className="inline mr-2" size={16} />
                                            Check-out Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={checkOut}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                            min={checkIn || minDate}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                                            required
                                        />
                                    </div>
                                </div>

                                {nights > 0 && (
                                    <p className="text-sm text-gray-600">
                                        {nights} {nights === 1 ? 'night' : 'nights'}
                                    </p>
                                )}

                                {/* Guests and Rooms */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <Users className="inline mr-2" size={16} />
                                            Number of Guests *
                                        </label>
                                        <input
                                            type="number"
                                            value={guests}
                                            onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                                            min="1"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <DoorOpen className="inline mr-2" size={16} />
                                            Number of Rooms *
                                        </label>
                                        <input
                                            type="number"
                                            value={roomsBooked}
                                            onChange={(e) => setRoomsBooked(Math.max(1, parseInt(e.target.value) || 1))}
                                            min="1"
                                            max={selectedRoomTypeData?.totalRooms}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Optional Extras */}
                                {optionalExtras.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            Optional Extras
                                        </label>
                                        <div className="space-y-3">
                                            {optionalExtras.map((extra) => (
                                                <div key={extra._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-800">{extra.name}</p>
                                                        <p className="text-sm text-gray-600">
                                                            Rs. {extra.price.toLocaleString()} {extra.priceType === "per_person" ? "per person" : "per booking"}
                                                        </p>
                                                        {extra.description && (
                                                            <p className="text-xs text-gray-500 mt-1">{extra.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleExtraQuantityChange(extra._id, -1)}
                                                            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <span className="w-8 text-center font-medium">
                                                            {selectedExtras[extra._id] || 0}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleExtraQuantityChange(extra._id, 1)}
                                                            className="p-1 rounded-full bg-[#0c7272] hover:bg-[#134e4a] text-white transition"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Special Requests */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Special Requests (Optional)
                                    </label>
                                    <textarea
                                        value={specialRequest}
                                        onChange={(e) => setSpecialRequest(e.target.value)}
                                        rows={3}
                                        placeholder="Any special requests or requirements..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || !selectedRoomType || nights <= 0}
                                    className="w-full bg-[#0c7272] text-white py-3 rounded-lg font-semibold hover:bg-[#134e4a] transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Processing..." : "Confirm Booking"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h2>
                            
                            {accommodation.images && accommodation.images.length > 0 && (
                                <img
                                    src={accommodation.images[0].startsWith('http') 
                                        ? accommodation.images[0] 
                                        : `http://localhost:5050${accommodation.images[0]}`}
                                    alt={accommodation.name}
                                    className="w-full h-32 object-cover rounded-lg mb-4"
                                />
                            )}

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Accommodation:</span>
                                    <span className="font-medium text-gray-800">{accommodation.name}</span>
                                </div>
                                
                                {selectedRoomTypeData && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Room Type:</span>
                                            <span className="font-medium text-gray-800">{selectedRoomTypeData.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Price per night:</span>
                                            <span className="font-medium text-gray-800">Rs. {selectedRoomTypeData.pricePerNight.toLocaleString()}</span>
                                        </div>
                                    </>
                                )}

                                {nights > 0 && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Nights:</span>
                                            <span className="font-medium text-gray-800">{nights}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Rooms:</span>
                                            <span className="font-medium text-gray-800">{roomsBooked}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Guests:</span>
                                            <span className="font-medium text-gray-800">{guests}</span>
                                        </div>
                                    </>
                                )}

                                {Object.keys(selectedExtras).length > 0 && (
                                    <>
                                        <div className="pt-3 border-t border-gray-200">
                                            <p className="font-medium text-gray-700 mb-2">Extras:</p>
                                            {Object.entries(selectedExtras).map(([extraId, quantity]) => {
                                                const extra = optionalExtras.find(e => e._id === extraId);
                                                if (!extra || quantity === 0) return null;
                                                return (
                                                    <div key={extraId} className="flex justify-between text-xs mb-1">
                                                        <span className="text-gray-600">{extra.name} × {quantity}</span>
                                                        <span className="text-gray-800">
                                                            Rs. {(extra.priceType === "per_person" 
                                                                ? extra.price * guests * quantity 
                                                                : extra.price * quantity).toLocaleString()}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}

                                {totalPrice > 0 && (
                                    <div className="pt-3 border-t border-gray-200">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span className="text-gray-800">Total:</span>
                                            <span className="text-[#0c7272]">Rs. {totalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
