"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, Calendar, Leaf, ChevronLeft, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import Navbar from "@/app/components/navbar/Navbar";
import Footer from "@/app/components/footer/Footer";
import { getAccommodationById, Accommodation } from "@/lib/api/accommodation";
import { toast } from "react-toastify";

export default function AccommodationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const router = useRouter();

    useEffect(() => {
        fetchAccommodation();
    }, [id]);

    const fetchAccommodation = async () => {
        try {
            setLoading(true);
            const response = await getAccommodationById(id);
            if (response.success) {
                const data = Array.isArray(response.data) ? response.data[0] : response.data;
                setAccommodation(data);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch accommodation");
            setTimeout(() => router.push("/accommodations"), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleNextImage = () => {
        if (accommodation && accommodation.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % accommodation.images.length);
        }
    };

    const handlePrevImage = () => {
        if (accommodation && accommodation.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + accommodation.images.length) % accommodation.images.length);
        }
    };

    const handleBookNow = () => {
        if (accommodation) {
            router.push(`/bookings/create?accommodationId=${accommodation._id}&price=${accommodation.pricePerNight}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="flex justify-center items-center py-40">
                    <Loader2 className="animate-spin text-[#0c7272]" size={48} />
                </div>
                <Footer />
            </div>
        );
    }

    if (!accommodation) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="flex justify-center items-center py-40">
                    <p className="text-gray-500 text-lg">Accommodation not found</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-[#134e4a]">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Back Button */}
                <Link
                    href="/accommodations"
                    className="inline-flex items-center gap-2 text-[#0c7272] hover:text-[#134e4a] mb-6 text-sm sm:text-base"
                >
                    <ArrowLeft size={18} />
                    Back to Accommodations
                </Link>

                {/* Image Gallery */}
                {accommodation.images && accommodation.images.length > 0 ? (
                    <div className="relative mb-8 rounded-lg overflow-hidden bg-gray-200">
                        <div className="relative h-64 sm:h-96">
                            <img
                                src={accommodation.images[currentImageIndex].startsWith('http') 
                                    ? accommodation.images[currentImageIndex] 
                                    : `http://localhost:5050${accommodation.images[currentImageIndex]}`}
                                alt={accommodation.name}
                                className="w-full h-full object-cover"
                            />
                            {accommodation.images.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
                                    >
                                        <ChevronLeft size={24} className="text-[#0c7272]" />
                                    </button>
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
                                    >
                                        <ChevronRight size={24} className="text-[#0c7272]" />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                        {currentImageIndex + 1} / {accommodation.images.length}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="relative mb-8 rounded-lg overflow-hidden bg-gray-200 h-64 sm:h-96 flex items-center justify-center">
                        <MapPin size={64} className="text-gray-400" />
                    </div>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title and Location */}
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-[#0c7272] mb-3">{accommodation.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-gray-600">
                                <div className="flex items-center gap-1">
                                    <MapPin size={18} />
                                    <span className="text-sm sm:text-base">{accommodation.address}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="text-yellow-400 fill-yellow-400" size={18} />
                                    <span className="font-medium text-sm sm:text-base">{accommodation.rating.toFixed(1)}</span>
                                    <span className="text-gray-500 text-sm">({accommodation.totalReviews} reviews)</span>
                                </div>
                            </div>
                        </div>

                        {/* Overview */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-[#0c7272] mb-3">Overview</h2>
                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{accommodation.overview}</p>
                        </div>

                        {/* Amenities */}
                        {accommodation.amenities && accommodation.amenities.length > 0 && (
                            <div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-[#0c7272] mb-3">Amenities</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {accommodation.amenities.map((amenity, index) => (
                                        <div key={index} className="flex items-center gap-2 text-gray-700">
                                            <div className="w-2 h-2 bg-[#0c7272] rounded-full"></div>
                                            <span className="text-sm sm:text-base">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Eco-Friendly Highlights */}
                        {accommodation.ecoFriendlyHighlights && accommodation.ecoFriendlyHighlights.length > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Leaf className="text-green-600" size={24} />
                                    <h2 className="text-xl sm:text-2xl font-semibold text-green-800">Eco-Friendly Highlights</h2>
                                </div>
                                <ul className="space-y-2">
                                    {accommodation.ecoFriendlyHighlights.map((highlight, index) => (
                                        <li key={index} className="flex items-start gap-2 text-green-700">
                                            <span className="text-green-600 mt-1">🌱</span>
                                            <span className="text-sm sm:text-base">{highlight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Location */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-[#0c7272] mb-3">Location</h2>
                            <div className="border border-gray-300 rounded-lg p-4 sm:p-6 bg-gray-50">
                                <p className="text-gray-600 mb-2 text-sm sm:text-base">
                                    <strong>Coordinates:</strong> {accommodation.location.lat}, {accommodation.location.lng}
                                </p>
                                {accommodation.location.mapUrl ? (
                                    <a
                                        href={accommodation.location.mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#0c7272] hover:underline text-sm sm:text-base"
                                    >
                                        View on Map →
                                    </a>
                                ) : (
                                    <p className="text-gray-500 italic text-sm sm:text-base">Map integration coming soon</p>
                                )}
                            </div>
                        </div>

                        {/* Availability */}
                        {(accommodation.availableFrom || accommodation.availableUntil) && (
                            <div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-[#0c7272] mb-3">Availability</h2>
                                <div className="flex flex-wrap gap-4">
                                    {accommodation.availableFrom && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Calendar size={18} />
                                            <span className="text-sm sm:text-base" suppressHydrationWarning>
                                                <strong>From:</strong> {new Date(accommodation.availableFrom).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                    {accommodation.availableUntil && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Calendar size={18} />
                                            <span className="text-sm sm:text-base" suppressHydrationWarning>
                                                <strong>To:</strong> {new Date(accommodation.availableUntil).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="border border-gray-300 rounded-lg p-6 sticky top-8 bg-white shadow-lg">
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2 mb-2">
                                    {accommodation.pricePerNight && accommodation.pricePerNight > 0 && (
                                        <>
                                            <span className="text-3xl sm:text-4xl font-bold text-[#0c7272]">Rs. {accommodation.pricePerNight}</span>
                                            <span className="text-gray-600 text-sm sm:text-base">per night</span>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                                    <span className="font-medium text-sm">{accommodation.rating.toFixed(1)}</span>
                                    <span className="text-gray-500 text-xs">({accommodation.totalReviews} reviews)</span>
                                </div>
                            </div>

                            <button
                                onClick={handleBookNow}
                                className="w-full bg-[#0c7272] text-white py-3 sm:py-4 rounded-full hover:bg-[#134e4a] transition font-semibold text-base sm:text-lg shadow-md hover:shadow-lg"
                            >
                                Book Now
                            </button>

                            <p className="text-center text-gray-500 text-xs sm:text-sm mt-4">
                                You won't be charged yet
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
