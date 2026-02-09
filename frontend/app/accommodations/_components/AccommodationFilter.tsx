'use client';

import React, { useState } from 'react';
import {
    searchAccommodations,
    getAccommodationsByPriceRange,
    Accommodation,
} from '@/lib/api/accommodation';

interface AccommodationFilterProps {
    onFilter: (accommodations: Accommodation[], loading: boolean, error: string | null) => void;
}

export const AccommodationFilter: React.FC<AccommodationFilterProps> = ({
    onFilter,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [minPrice, setMinPrice] = useState<number | string>('');
    const [maxPrice, setMaxPrice] = useState<number | string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (searchQuery.trim()) {
                const results = await searchAccommodations(searchQuery);
                onFilter(results, false, null);
            }
        } catch (err: Error | any) {
            setError(err.message);
            onFilter([], false, err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePriceFilter = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (minPrice !== '' && maxPrice !== '') {
                const results = await getAccommodationsByPriceRange(
                    parseFloat(minPrice as string),
                    parseFloat(maxPrice as string)
                );
                onFilter(results, false, null);
            }
        } catch (err: Error | any) {
            setError(err.message);
            onFilter([], false, err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSearchQuery('');
        setMinPrice('');
        setMaxPrice('');
        setError(null);
        onFilter([], true, null);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search by Name */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search by name, city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        🔍
                    </button>
                </form>

                {/* Price Range Filter */}
                <form onSubmit={handlePriceFilter} className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Min price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <input
                        type="number"
                        placeholder="Max price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                    >
                        Filter
                    </button>
                </form>

                {/* Reset */}
                <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition"
                >
                    Reset
                </button>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}
        </div>
    );
};
