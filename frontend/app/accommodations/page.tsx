'use client';

import React, { useEffect, useState } from 'react';
import { getActiveAccommodations, Accommodation } from '@/lib/api/accommodation';
import { AccommodationCard } from './_components/AccommodationCard';

export default function AccommodationsPage() {
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAccommodations = async () => {
            try {
                setLoading(true);
                const data = await getActiveAccommodations();
                setAccommodations(data);
                setError(null);
            } catch (err: Error | any) {
                setError(err.message);
                setAccommodations([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAccommodations();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-4">Accommodations</h1>
                    <p className="text-blue-100 text-lg">
                        Find your perfect stay in Nepal
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {loading && (
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
                        <h3 className="font-semibold mb-2">Error loading accommodations</h3>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && accommodations.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">
                            No accommodations available at the moment
                        </p>
                    </div>
                )}

                {!loading && !error && accommodations.length > 0 && (
                    <div>
                        <p className="text-gray-600 mb-8">
                            Showing {accommodations.length} accommodation{accommodations.length !== 1 ? 's' : ''}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {accommodations.map((accommodation) => (
                                <AccommodationCard
                                    key={accommodation._id}
                                    accommodation={accommodation}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
