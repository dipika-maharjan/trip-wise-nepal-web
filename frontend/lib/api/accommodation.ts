//backend api call for accommodation operations
import axios from "./axios";
import { API } from "./endpoints";

export interface Accommodation {
    _id: string;
    name: string;
    address: string;
    overview: string;
    images: string[];
    pricePerNight: number;
    location: {
        lat: number;
        lng: number;
        mapUrl?: string;
    };
    amenities: string[];
    ecoFriendlyHighlights: string[];
    rating: number;
    totalReviews: number;
    availableFrom?: string;
    availableUntil?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AccommodationResponse {
    success: boolean;
    message: string;
    data: Accommodation | Accommodation[];
}

// Get all accommodations
export const getAllAccommodations = async (): Promise<AccommodationResponse> => {
    try {
        const response = await axios.get(API.ACCOMMODATION.GET_ALL);
        return response.data;
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch accommodations"
        );
    }
};

// Get active accommodations
export const getActiveAccommodations = async (): Promise<AccommodationResponse> => {
    try {
        const response = await axios.get(API.ACCOMMODATION.GET_ACTIVE);
        return response.data;
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch active accommodations"
        );
    }
};

// Get accommodation by ID
export const getAccommodationById = async (id: string): Promise<AccommodationResponse> => {
    try {
        const response = await axios.get(`${API.ACCOMMODATION.GET_BY_ID}/${id}`);
        return response.data;
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch accommodation"
        );
    }
};

// Search accommodations
export const searchAccommodations = async (query: string): Promise<AccommodationResponse> => {
    try {
        const response = await axios.get(`${API.ACCOMMODATION.SEARCH}?query=${encodeURIComponent(query)}`);
        return response.data;
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Search failed"
        );
    }
};

// Get accommodations by price range
export const getAccommodationsByPriceRange = async (minPrice: number, maxPrice: number): Promise<AccommodationResponse> => {
    try {
        const response = await axios.get(`${API.ACCOMMODATION.PRICE_RANGE}?minPrice=${minPrice}&maxPrice=${maxPrice}`);
        return response.data;
    } catch (err: any) {
        throw new Error(
            err.response?.data?.message || err.message || "Failed to fetch accommodations by price range"
        );
    }
};
