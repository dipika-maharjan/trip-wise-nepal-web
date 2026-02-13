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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAccommodations = accommodations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(accommodations.length / itemsPerPage);

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
            setCurrentPage(1); // Reset to first page
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
            setCurrentPage(1); // Reset to first page
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
        setCurrentPage(1); // Reset to first page
        fetchAccommodations();
    };

    return (
        <div className="min-h-screen bg-white text-[#134e4a]">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Compact Header with Search */}
                <div className="mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#0c7272] mb-1">Find Your Perfect Accommodations</h1>
                            <p className="text-gray-600 text-sm">Discover sustainable stays across Nepal</p>
                        </div>
                        
                        {/* Compact Search Bar */}
                        <div className="flex gap-2 lg:w-96">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search accommodations..."
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]/20"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="bg-[#0c7272] text-white px-4 py-2 rounded-lg hover:bg-[#134e4a] transition disabled:opacity-50 text-sm"
                            >
                                {isSearching ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Compact Price Filter */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="relative w-32">
                                <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]/20"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    min="0"
                                />
                            </div>
                            <span className="text-gray-500 text-sm">to</span>
                            <div className="relative w-32">
                                <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]/20"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    min="0"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handlePriceFilter}
                            disabled={isSearching}
                            className="bg-[#0c7272] text-white px-4 py-1.5 rounded-lg hover:bg-[#134e4a] transition disabled:opacity-50 text-sm"
                        >
                            {isSearching ? <Loader2 className="animate-spin" size={14} /> : "Filter"}
                        </button>
                        <button
                            onClick={handleClearFilters}
                            className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition text-sm"
                        >
                            Clear
                        </button>
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
                        {/* Results Count and Pagination Info */}
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-gray-600 text-sm">
                                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, accommodations.length)} of {accommodations.length} {accommodations.length === 1 ? 'accommodation' : 'accommodations'}
                            </p>
                            {totalPages > 1 && (
                                <p className="text-gray-600 text-sm">Page {currentPage} of {totalPages}</p>
                            )}
                        </div>

                        {/* Accommodation Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-6">
                            {currentAccommodations.map((accommodation) => (
                                <Link
                                    key={accommodation._id}
                                    href={`/accommodations/${accommodation._id}`}
                                    className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
                                >
                                    {/* Image */}
                                    <div className="relative h-44 bg-linear-to-br from-gray-200 to-gray-300 overflow-hidden">
                                        {accommodation.images && accommodation.images.length > 0 ? (
                                            <>
                                                <img
                                                    src={accommodation.images[0].startsWith('http') 
                                                        ? accommodation.images[0] 
                                                        : `http://localhost:5050${accommodation.images[0]}`}
                                                    alt={accommodation.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                {/* Eco Badge */}
                                                {accommodation.ecoFriendlyHighlights && accommodation.ecoFriendlyHighlights.length > 0 && (
                                                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg flex items-center gap-1">
                                                        🌱 Eco-Friendly
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <MapPin size={40} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-base text-[#0c7272] mb-1.5 line-clamp-1 group-hover:text-[#134e4a] transition">{accommodation.name}</h3>
                                        <p className="text-gray-500 text-xs flex items-center gap-1 mb-2">
                                            <MapPin size={12} />
                                            <span className="line-clamp-1">{accommodation.address}</span>
                                        </p>
                                        <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">{accommodation.overview}</p>
                                        {/* Rating */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-1">
                                                <Star className="text-yellow-400 fill-yellow-400" size={14} />
                                                <span className="font-semibold text-sm text-gray-700">{accommodation.rating?.toFixed(1) ?? '-'}</span>
                                                <span className="text-gray-400 text-xs">({accommodation.totalReviews ?? 0})</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pb-10">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                                >
                                    Previous
                                </button>
                                
                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        // Show first page, last page, current page, and pages around current
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-3 py-2 rounded-lg text-sm transition ${
                                                        currentPage === page
                                                            ? 'bg-[#0c7272] text-white'
                                                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (
                                            page === currentPage - 2 ||
                                            page === currentPage + 2
                                        ) {
                                            return <span key={page} className="px-2 py-2 text-gray-400">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
