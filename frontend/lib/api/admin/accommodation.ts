import { API } from "../endpoints";
import axios from "../axios";
import { getAuthToken } from "../../cookie";

export const createAccommodation = async (accommodationData: any) => {
    try {
        const token = await getAuthToken();
        const isFormData = accommodationData instanceof FormData;
        
        const config: any = {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        };
        
        // Only set Content-Type if NOT FormData (Axios handles FormData boundaries automatically)
        if (!isFormData) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        const response = await axios.post(
            API.ACCOMMODATION.CREATE,
            accommodationData,
            config
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Create accommodation failed');
    }
};

export const getAllAccommodationsAdmin = async () => {
    try {
        const token = await getAuthToken();
        const response = await axios.get(API.ACCOMMODATION.GET_ALL, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Get accommodations failed');
    }
};

export const getAccommodationByIdAdmin = async (accommodationId: string) => {
    try {
        const token = await getAuthToken();
        const response = await axios.get(`${API.ACCOMMODATION.GET_BY_ID}/${accommodationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Get accommodation failed');
    }
};

export const updateAccommodation = async (accommodationId: string, accommodationData: any) => {
    try {
        const token = await getAuthToken();
        const isFormData = accommodationData instanceof FormData;
        
        const config: any = {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        };
        
        // Only set Content-Type if NOT FormData (Axios handles FormData boundaries automatically)
        if (!isFormData) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        const response = await axios.put(
            `${API.ACCOMMODATION.UPDATE}/${accommodationId}`,
            accommodationData,
            config
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Update accommodation failed');
    }
};

export const deleteAccommodation = async (accommodationId: string) => {
    try {
        const token = await getAuthToken();
        const response = await axios.delete(`${API.ACCOMMODATION.DELETE}/${accommodationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Delete accommodation failed');
    }
};
