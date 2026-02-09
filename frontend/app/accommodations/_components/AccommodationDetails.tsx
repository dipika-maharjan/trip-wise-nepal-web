'use client';

import React, { useState } from 'react';
import { Accommodation } from '@/lib/api/accommodation';
import Image from 'next/image';

interface AccommodationDetailsProps {
    accommodation: Accommodation;
}

export const AccommodationDetails: React.FC<AccommodationDetailsProps> = ({
    accommodation,
}) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [showMap, setShowMap] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Image Gallery */}
            <div className="grid grid-cols-12 gap-4 p-6">
                <div className="col-span-8">
                    <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
                        {accommodation.images && accommodation.images.length > 0 ? (
                            <Image
                                src={accommodation.images[selectedImage]}
                                alt={accommodation.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No image available
                            </div>
                        )}
                    </div>

                    {/* Thumbnail Gallery */}
                    {accommodation.images && accommodation.images.length > 1 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto">
                            {accommodation.images.map((image, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 ${
                                        selectedImage === idx ? 'ring-2 ring-blue-500' : ''
                                    }`}
                                >
                                    <Image
                                        src={image}
                                        alt={`${accommodation.name} ${idx}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Panel */}
                <div className="col-span-4">
                    {/* Name and Rating */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {accommodation.name}
                        </h1>
                        {accommodation.rating > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">⭐</span>
                                <span className="text-xl font-semibold text-gray-900">
                                    {accommodation.rating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Address */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">
                            📍 Address
                        </h3>
                        <p className="text-gray-900">{accommodation.address}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Price per night</div>
                        <div className="text-4xl font-bold text-gray-900">
                            Rs. {accommodation.pricePerNight.toLocaleString()}
                        </div>
                    </div>

                    {/* Capacity Info */}
                    <div className="mb-6 grid grid-cols-3 gap-4">
                        {accommodation.maxGuests && (
                            <div className="text-center">
                                <div className="text-2xl mb-1">👥</div>
                                <div className="text-sm text-gray-600">
                                    {accommodation.maxGuests} Guests
                                </div>
                            </div>
                        )}
                        {accommodation.rooms && (
                            <div className="text-center">
                                <div className="text-2xl mb-1">🛏️</div>
                                <div className="text-sm text-gray-600">
                                    {accommodation.rooms} Room{accommodation.rooms > 1 ? 's' : ''}
                                </div>
                            </div>
                        )}
                        {accommodation.bathrooms && (
                            <div className="text-center">
                                <div className="text-2xl mb-1">🚿</div>
                                <div className="text-sm text-gray-600">
                                    {accommodation.bathrooms} Bath{accommodation.bathrooms > 1 ? 's' : ''}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Features */}
                    {accommodation.ecoFriendlyHighlights &&
                        accommodation.ecoFriendlyHighlights.length > 0 && (
                            <div className="mb-6 p-3 bg-green-50 rounded-lg">
                                <div className="text-sm font-semibold text-green-700 mb-2">
                                    🌱 Eco-friendly Highlights
                                </div>
                                <ul className="text-sm text-green-700 space-y-1">
                                    {accommodation.ecoFriendlyHighlights.map((highlight, idx) => (
                                        <li key={idx}>✓ {highlight}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                    {/* CTA Buttons */}
                    <div className="flex gap-3">
                        <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                            Book Now
                        </button>
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            View Map
                        </button>
                    </div>
                </div>
            </div>

            {/* Overview Section */}
            <div className="px-6 py-8 border-t">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                <p className="text-gray-700 leading-relaxed">{accommodation.overview}</p>
            </div>

            {/* Amenities Section */}
            {accommodation.amenities && accommodation.amenities.length > 0 && (
                <div className="px-6 py-8 border-t bg-gray-50">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {accommodation.amenities.map((amenity, idx) => (
                            <div
                                key={idx}
                                className="p-3 bg-white rounded-lg border border-gray-200 text-center"
                            >
                                <span className="text-sm text-gray-700">{amenity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Map Section */}
            {showMap && accommodation.location && (
                <div className="px-6 py-8 border-t">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
                    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-4xl mb-2">📍</div>
                            <div className="text-gray-600">
                                Latitude: {accommodation.location.lat.toFixed(4)}
                            </div>
                            <div className="text-gray-600">
                                Longitude: {accommodation.location.lng.toFixed(4)}
                            </div>
                            <div className="text-sm text-gray-500 mt-2">
                                (Map integration coming soon)
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews Section (Placeholder) */}
            <div className="px-6 py-8 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
                    <button disabled className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
                        View All Reviews
                    </button>
                </div>
                <p className="text-gray-600">
                    Review system coming soon. Be the first to review this accommodation!
                </p>
            </div>
        </div>
    );
};
