'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAccommodationById, Accommodation } from '@/lib/api/accommodation';
import { AccommodationDetails } from '../_components/AccommodationDetails';
import Link from 'next/link';

export default function AccommodationDetailsPage() {
    const params = useParams();
    const id = params.id as string;

    const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchAccommodation = async () => {
            try {
                setLoading(true);
                const data = await getAccommodationById(id);
                setAccommodation(data);
                setError(null);
            } catch (err: Error | any) {
                setError(err.message);
                setAccommodation(null);
            } finally {
                setLoading(false);
            }
        };

        fetchAccommodation();
    }, [id]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Link
                        href="/accommodations"
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
                    >
                        ← Back to Accommodations
                    </Link>
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
                        <h3 className="font-semibold mb-2">Error loading accommodation</h3>
                        <p>{error}</p>
                        <Link
                            href="/accommodations"
                            className="text-red-600 hover:text-red-800 font-semibold mt-4 inline-block"
                        >
                            Return to Accommodations
                        </Link>
                    </div>
                )}

                {!loading && !error && accommodation && (
                    <AccommodationDetails accommodation={accommodation} />
                )}
            </div>
        </div>
    );
}
