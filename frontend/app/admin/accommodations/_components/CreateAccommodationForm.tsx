"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createAccommodation } from "@/lib/api/admin/accommodation";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function CreateAccommodationForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        overview: "",
        lat: "",
        lng: "",
        mapUrl: "",
        availableFrom: "",
        availableUntil: "",
    });
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([""]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [amenities, setAmenities] = useState<string[]>([""]);
    const [ecoFriendlyHighlights, setEcoFriendlyHighlights] = useState<string[]>([""]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setImageFiles((prev) => [...prev, ...files]);
            
            // Generate previews
            files.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews((prev) => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImageFile = (index: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleArrayChange = (index: number, value: string, setter: Function, array: string[]) => {
        const newArray = [...array];
        newArray[index] = value;
        setter(newArray);
    };

    const addArrayItem = (setter: Function, array: string[]) => {
        setter([...array, ""]);
    };

    const removeArrayItem = (index: number, setter: Function, array: string[]) => {
        if (array.length > 1) {
            const newArray = array.filter((_, i) => i !== index);
            setter(newArray);
        }
    };

    // Get today's date in YYYY-MM-DD format for min date attribute
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name || !formData.address || !formData.overview) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (!formData.lat || !formData.lng) {
            toast.error("Please provide location coordinates");
            return;
        }

        // Validate availability dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (formData.availableFrom) {
            const fromDate = new Date(formData.availableFrom);
            fromDate.setHours(0, 0, 0, 0);
            if (fromDate < today) {
                toast.error("Available From date cannot be in the past");
                return;
            }
        }

        if (formData.availableUntil) {
            const untilDate = new Date(formData.availableUntil);
            untilDate.setHours(0, 0, 0, 0);
            if (untilDate < today) {
                toast.error("Available Until date cannot be in the past");
                return;
            }
        }

        if (formData.availableFrom && formData.availableUntil) {
            const fromDate = new Date(formData.availableFrom);
            const untilDate = new Date(formData.availableUntil);
            if (untilDate < fromDate) {
                toast.error("Available Until date must be after Available From date");
                return;
            }
        }

        const filteredUrls = imageUrls.filter(img => img.trim() !== "");

        try {
            setLoading(true);
            const formDataToSend = new FormData();
            
            // Add basic fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('address', formData.address);
            formDataToSend.append('overview', formData.overview);
            formDataToSend.append('location', JSON.stringify({
                lat: Number(formData.lat),
                lng: Number(formData.lng),
                mapUrl: formData.mapUrl || undefined,
            }));

            // Add image files
            imageFiles.forEach((file) => {
                formDataToSend.append('images', file);
            });

            // Add image URLs as JSON if any
            if (filteredUrls.length > 0) {
                formDataToSend.append('images', JSON.stringify(filteredUrls));
            }

            // Add arrays
            const filteredAmenities = amenities.filter(a => a.trim() !== "");
            if (filteredAmenities.length > 0) {
                formDataToSend.append('amenities', JSON.stringify(filteredAmenities));
            }

            const filteredHighlights = ecoFriendlyHighlights.filter(e => e.trim() !== "");
            if (filteredHighlights.length > 0) {
                formDataToSend.append('ecoFriendlyHighlights', JSON.stringify(filteredHighlights));
            }

            if (formData.availableFrom) {
                formDataToSend.append('availableFrom', formData.availableFrom);
            }
            if (formData.availableUntil) {
                formDataToSend.append('availableUntil', formData.availableUntil);
            }

            // Log FormData contents for debugging
            console.log('FormData entries before sending:');
            for (let [key, value] of formDataToSend.entries()) {
                if (value instanceof File) {
                    console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }
            console.log('Image files count:', imageFiles.length);
            console.log('Image URLs count:', filteredUrls.length);

            const response = await createAccommodation(formDataToSend);
            if (response.success) {
                toast.success("Accommodation created successfully!");
                router.push("/admin/accommodations");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to create accommodation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/accommodations"
                    className="text-[#0c7272] hover:text-[#0a5555]"
                >
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Create New Accommodation</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                            placeholder="e.g. Lodge Name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                            placeholder="e.g. Address of the accommodation"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Overview <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="overview"
                            value={formData.overview}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                            placeholder="Describe the accommodation..."
                            required
                        />
                    </div>

                </div>

                {/* Location */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Location</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Latitude <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="lat"
                                value={formData.lat}
                                onChange={handleInputChange}
                                step="any"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                                placeholder="e.g. 27.7172"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Longitude <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="lng"
                                value={formData.lng}
                                onChange={handleInputChange}
                                step="any"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                                placeholder="e.g. 85.3240"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Map URL (optional)
                        </label>
                        <input
                            type="url"
                            name="mapUrl"
                            value={formData.mapUrl}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                            placeholder="https://maps.google.com/..."
                        />
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Images <span className="text-gray-500 text-sm font-normal">(optional)</span>
                    </h2>
                    
                    {/* File Upload Section */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-2">
                                <label htmlFor="image-upload" className="cursor-pointer">
                                    <span className="text-[#0c7272] hover:text-[#0a5555] font-medium">
                                        Upload images
                                    </span>
                                    <input
                                        id="image-upload"
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB each (optional)</p>
                            </div>
                        </div>
                        
                        {/* Image Previews */}
                        {imagePreviews.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImageFile(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* URL Input Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Or add image URLs</label>
                            <button
                                type="button"
                                onClick={() => addArrayItem(setImageUrls, imageUrls)}
                                className="flex items-center gap-1 text-[#0c7272] hover:text-[#0a5555] text-sm"
                            >
                                <Plus size={16} /> Add URL
                            </button>
                        </div>
                        {imageUrls.map((url, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => handleArrayChange(index, e.target.value, setImageUrls, imageUrls)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                                    placeholder="https://example.com/image.jpg"
                                />
                                {imageUrls.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem(index, setImageUrls, imageUrls)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Amenities</h2>
                        <button
                            type="button"
                            onClick={() => addArrayItem(setAmenities, amenities)}
                            className="flex items-center gap-1 text-[#0c7272] hover:text-[#0a5555] text-sm"
                        >
                            <Plus size={16} /> Add Amenity
                        </button>
                    </div>
                    {amenities.map((amenity, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={amenity}
                                onChange={(e) => handleArrayChange(index, e.target.value, setAmenities, amenities)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                                placeholder="e.g., Free WiFi, Parking, etc."
                            />
                            {amenities.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem(index, setAmenities, amenities)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Eco-Friendly Highlights */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Eco-Friendly Highlights</h2>
                        <button
                            type="button"
                            onClick={() => addArrayItem(setEcoFriendlyHighlights, ecoFriendlyHighlights)}
                            className="flex items-center gap-1 text-[#0c7272] hover:text-[#0a5555] text-sm"
                        >
                            <Plus size={16} /> Add Highlight
                        </button>
                    </div>
                    {ecoFriendlyHighlights.map((highlight, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                value={highlight}
                                onChange={(e) => handleArrayChange(index, e.target.value, setEcoFriendlyHighlights, ecoFriendlyHighlights)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                                placeholder="e.g., Solar powered, Organic farming, etc."
                            />
                            {ecoFriendlyHighlights.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem(index, setEcoFriendlyHighlights, ecoFriendlyHighlights)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Availability */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Availability (optional)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Available From
                            </label>
                            <input
                                type="date"
                                name="availableFrom"
                                value={formData.availableFrom}
                                onChange={handleInputChange}
                                min={getTodayDate()}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Available Until
                            </label>
                            <input
                                type="date"
                                name="availableUntil"
                                value={formData.availableUntil}
                                onChange={handleInputChange}
                                min={getTodayDate()}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-[#0c7272] text-white py-2 px-4 rounded-lg hover:bg-[#0a5555] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Creating..." : "Create Accommodation"}
                    </button>
                    <Link
                        href="/admin/accommodations"
                        className="flex-1 text-center border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}