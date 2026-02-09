"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Star, MapPin, DollarSign, Loader2, IndianRupee } from "lucide-react";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import { getActiveAccommodations, searchAccommodations, getAccommodationsByPriceRange, Accommodation } from "@/lib/api/accommodation";
import { toast } from "react-toastify";

export default function AccommodationsPage() {
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // Fetch active accommodations on mount
    useEffect(() => {
        fetchAccommodations();
    }, []);

    const fetchAccommodations = async () => {
        try {
            setLoading(true);
            const response = await getActiveAccommodations();
            if (response.success) {
                const data = Array.isArray(response.data) ? response.data : [response.data];
                console.log('Fetched active accommodations:', data.length);
                if (data.length > 0) {
                    console.log('First accommodation:', data[0]);
                    console.log('First accommodation images:', data[0].images);
                }
                setAccommodations(data);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch accommodations");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error("Please enter a search term");
            return;
        }
        try {
            setIsSearching(true);
            const response = await searchAccommodations(searchQuery);
            if (response.success) {
                setAccommodations(Array.isArray(response.data) ? response.data : [response.data]);
                if (Array.isArray(response.data) && response.data.length === 0) {
                    toast.info("No accommodations found");
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Search failed");
        } finally {
            setIsSearching(false);
        }
    };

    const handlePriceFilter = async () => {
        if (!minPrice || !maxPrice) {
            toast.error("Please enter both min and max price");
            return;
        }
        if (Number(minPrice) < 0 || Number(maxPrice) < 0) {
            toast.error("Price cannot be negative");
            return;
        }
        if (Number(minPrice) > Number(maxPrice)) {
            toast.error("Min price cannot be greater than max price");
            return;
        }
        try {
            setIsSearching(true);
            const response = await getAccommodationsByPriceRange(Number(minPrice), Number(maxPrice));
            if (response.success) {
                setAccommodations(Array.isArray(response.data) ? response.data : [response.data]);
                if (Array.isArray(response.data) && response.data.length === 0) {
                    toast.info("No accommodations found in this price range");
                }
            }
        } catch (error: any) {
            toast.error(error.message || "Price filter failed");
        } finally {
            setIsSearching(false);
        }
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setMinPrice("");
        setMaxPrice("");
        fetchAccommodations();
    };

    return (
        <div className="min-h-screen bg-white text-[#134e4a]">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-[#0c7272] mb-3">Eco-Friendly Accommodations</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Discover sustainable stays across Nepal</p>
                </div>

                {/* Search and Filter Section */}
                <div className="mb-10 space-y-4">
                    {/* Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, location, or amenities..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0c7272]/20 text-sm sm:text-base"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="bg-[#0c7272] text-white px-6 sm:px-8 py-3 rounded-full hover:bg-[#134e4a] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                            {isSearching ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                            Search
                        </button>
                    </div>

                    {/* Price Filter */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 flex gap-3">
                            <div className="flex-1 relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    placeholder="Min Price"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0c7272]/20 text-sm sm:text-base"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    min="0"
                                />
                            </div>
                            <div className="flex-1 relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="number"
                                    placeholder="Max Price"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0c7272]/20 text-sm sm:text-base"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handlePriceFilter}
                                disabled={isSearching}
                                className="flex-1 sm:flex-none bg-[#0c7272] text-white px-6 sm:px-8 py-3 rounded-full hover:bg-[#134e4a] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                Filter
                            </button>
                            <button
                                onClick={handleClearFilters}
                                disabled={isSearching}
                                className="flex-1 sm:flex-none border border-[#0c7272] text-[#0c7272] px-6 sm:px-8 py-3 rounded-full hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="animate-spin text-[#0c7272]" size={48} />
                    </div>
                ) : accommodations.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No accommodations found</p>
                    </div>
                ) : (
                    <>
                        {/* Results Count */}
                        <div className="mb-6">
                            <p className="text-gray-600 text-sm">{accommodations.length} {accommodations.length === 1 ? 'accommodation' : 'accommodations'} found</p>
                        </div>

                        {/* Accommodation Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                            {accommodations.map((accommodation) => (
                                <Link
                                    key={accommodation._id}
                                    href={`/accommodations/${accommodation._id}`}
                                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition group"
                                >
                                    {/* Image */}
                                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                                        {accommodation.images && accommodation.images.length > 0 ? (
                                            <img
                                                src={accommodation.images[0]}
                                                alt={accommodation.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <MapPin size={48} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg text-[#0c7272] mb-2 line-clamp-1">{accommodation.name}</h3>
                                        <p className="text-gray-600 text-sm flex items-center gap-1 mb-2">
                                            <MapPin size={14} />
                                            {accommodation.address}
                                        </p>
                                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{accommodation.overview}</p>

                                        {/* Eco Highlights */}
                                        {accommodation.ecoFriendlyHighlights && accommodation.ecoFriendlyHighlights.length > 0 && (
                                            <div className="mb-3">
                                                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                                    🌱 Eco-Friendly
                                                </span>
                                            </div>
                                        )}

                                        {/* Rating and Price */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Star className="text-yellow-400 fill-yellow-400" size={16} />
                                                <span className="font-medium text-sm">{accommodation.rating.toFixed(1)}</span>
                                                <span className="text-gray-500 text-xs">({accommodation.totalReviews})</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[#0c7272] font-bold text-lg">${accommodation.pricePerNight}</p>
                                                <p className="text-gray-500 text-xs">per night</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
