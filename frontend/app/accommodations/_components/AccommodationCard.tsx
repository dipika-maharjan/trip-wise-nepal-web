'use client';

import React from 'react';
import Link from 'next/link';
import { Accommodation } from '@/lib/api/accommodation';
import Image from 'next/image';

interface AccommodationCardProps {
    accommodation: Accommodation;
}

export const AccommodationCard: React.FC<AccommodationCardProps> = ({
    accommodation,
}) => {
    return (
        <Link href={`/accommodations/${accommodation._id}`}>
            <div className="rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white">
                {/* Image */}
                <div className="relative w-full h-48 bg-gray-200">
                    {accommodation.images && accommodation.images.length > 0 ? (
                        <Image
                            src={accommodation.images[0]}
                            alt={accommodation.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image available
                        </div>
                    )}
                    {/* Rating Badge */}
                    {accommodation.rating > 0 && (
                        <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            ⭐ {accommodation.rating.toFixed(1)}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                        {accommodation.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {accommodation.address}
                    </p>

                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                        {accommodation.overview}
                    </p>

                    {/* Amenities Preview */}
                    {accommodation.amenities && accommodation.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {accommodation.amenities.slice(0, 3).map((amenity, idx) => (
                                <span
                                    key={idx}
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                >
                                    {amenity}
                                </span>
                            ))}
                            {accommodation.amenities.length > 3 && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    +{accommodation.amenities.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">
                            Rs. {accommodation.pricePerNight.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">per night</span>
                    </div>

                    {/* Eco-friendly badge */}
                    {accommodation.ecoFriendlyHighlights &&
                        accommodation.ecoFriendlyHighlights.length > 0 && (
                            <div className="mt-2 text-xs text-green-600 font-semibold">
                                🌱 Eco-friendly
                            </div>
                        )}
                </div>
            </div>
        </Link>
    );
};
