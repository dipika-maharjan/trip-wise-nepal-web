"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAccommodationByIdAdmin, updateAccommodation } from "@/lib/api/admin/accommodation";
import { toast } from "react-toastify";
import { ArrowLeft, Plus, X, Loader2, Upload } from "lucide-react";
import Link from "next/link";

export default function EditAccommodationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        overview: "",
        pricePerNight: "",
        lat: "",
        lng: "",
        mapUrl: "",
        availableFrom: "",
        availableUntil: "",
        isActive: true,
    });
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([""]);
    const [amenities, setAmenities] = useState<string[]>([""]);
    const [ecoFriendlyHighlights, setEcoFriendlyHighlights] = useState<string[]>([""]);

    useEffect(() => {
        fetchAccommodation();
    }, [id]);

    const fetchAccommodation = async () => {
        try {
            setLoading(true);
            const response = await getAccommodationByIdAdmin(id);
            if (response.success) {
                const data = Array.isArray(response.data) ? response.data[0] : response.data;
                
                console.log('Accommodation data:', data);
                console.log('Images from data:', data.images);
                
                setFormData({
                    name: data.name,
                    address: data.address,
                    overview: data.overview,
                    pricePerNight: data.pricePerNight.toString(),
                    lat: data.location.lat.toString(),
                    lng: data.location.lng.toString(),
                    mapUrl: data.location.mapUrl || "",
                    availableFrom: data.availableFrom ? new Date(data.availableFrom).toISOString().split('T')[0] : "",
                    availableUntil: data.availableUntil ? new Date(data.availableUntil).toISOString().split('T')[0] : "",
                    isActive: data.isActive,
                });
                setExistingImages(data.images || []);
                setAmenities(data.amenities.length > 0 ? data.amenities : [""]);
                setEcoFriendlyHighlights(data.ecoFriendlyHighlights.length > 0 ? data.ecoFriendlyHighlights : [""]);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch accommodation");
            setTimeout(() => router.push("/admin/accommodations"), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
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

    const removeExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
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
        
        if (!formData.name || !formData.address || !formData.overview || !formData.pricePerNight) {
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
            setSubmitting(true);
            const formDataToSend = new FormData();
            
            // Add basic fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('address', formData.address);
            formDataToSend.append('overview', formData.overview);
            formDataToSend.append('pricePerNight', formData.pricePerNight);
            formDataToSend.append('location', JSON.stringify({
                lat: Number(formData.lat),
                lng: Number(formData.lng),
                mapUrl: formData.mapUrl || undefined,
            }));
            formDataToSend.append('isActive', String(formData.isActive));

            // Combine all images (existing + new files + new URLs)
            const allImageUrls = [...existingImages, ...filteredUrls];
            
            // Add new image files
            imageFiles.forEach((file) => {
                formDataToSend.append('images', file);
            });

            // Add image URLs (existing + new) as JSON
            if (allImageUrls.length > 0) {
                formDataToSend.append('images', JSON.stringify(allImageUrls));
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

            const response = await updateAccommodation(id, formDataToSend);
            if (response.success) {
                toast.success("Accommodation updated successfully!");
                router.push("/admin/accommodations");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update accommodation");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-[#0c7272]" size={48} />
            </div>
        );
    }

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
                <h1 className="text-2xl font-bold text-gray-800">Edit Accommodation</h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                {/* Status Toggle */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-[#0c7272] border-gray-300 rounded focus:ring-[#0c7272]"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Active (visible to users)
                    </label>
                </div>

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
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price Per Night (Rs) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="pricePerNight"
                            value={formData.pricePerNight}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
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
                        />
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Images <span className="text-gray-500 text-sm font-normal">(optional - upload files or add URLs)</span>
                        </h2>

                        {/* Image Upload Section */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Images
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#0c7272] transition-colors"
                            >
                                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                                <p className="text-sm text-gray-600">
                                    Click to upload images or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG, WEBP up to 5MB
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Existing Images Preview */}
                        {existingImages.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Images
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {existingImages.map((image, index) => (
                                        <div key={`existing-${index}`} className="relative group">
                                            <img
                                                src={image.startsWith('http') ? image : `http://localhost:5050${image}`}
                                                alt={`Existing ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
                                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Uploaded Images Preview */}
                        {imagePreviews.length > 0 && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Uploaded Images
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={`preview-${index}`} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImageFile(index)}
                                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Image URLs Section */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Or Add Image URLs
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setImageUrls([...imageUrls, ''])}
                                    className="flex items-center gap-1 text-[#0c7272] hover:text-[#0a5555] text-sm"
                                >
                                    <Plus size={16} /> Add URL
                                </button>
                            </div>
                            {imageUrls.map((url, index) => (
                                <div key={`url-${index}`} className="flex gap-2 mb-2">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => {
                                            const newUrls = [...imageUrls];
                                            newUrls[index] = e.target.value;
                                            setImageUrls(newUrls);
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0c7272]"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== index))}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
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
                        disabled={submitting}
                        className="flex-1 bg-[#0c7272] text-white py-2 px-4 rounded-lg hover:bg-[#0a5555] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Updating..." : "Update Accommodation"}
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
