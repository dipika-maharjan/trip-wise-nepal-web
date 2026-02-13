import { API } from "./endpoints";
import axios from "./axios";
import { getAuthToken } from "../cookie";

export const getAllOptionalExtras = async (accommodationId?: string, includeInactive?: boolean) => {
    try {
        const params = new URLSearchParams();
        if (accommodationId) params.append('accommodationId', accommodationId);
        if (includeInactive) params.append('includeInactive', 'true');
        
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await axios.get(`${API.OPTIONAL_EXTRA.GET_ALL}${query}`);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Get optional extras failed');
    }
}

export const getOptionalExtraById = async (extraId: string) => {
    try {
        const response = await axios.get(`${API.OPTIONAL_EXTRA.GET_BY_ID}/${extraId}`);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Get optional extra failed');
    }
}

export const createOptionalExtra = async (extraData: any) => {
    try {
        const token = await getAuthToken();
        const response = await axios.post(
            API.OPTIONAL_EXTRA.CREATE,
            extraData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Create optional extra failed');
    }
}

export const updateOptionalExtra = async (extraId: string, extraData: any) => {
    try {
        const token = await getAuthToken();
        const response = await axios.put(
            `${API.OPTIONAL_EXTRA.UPDATE}/${extraId}`,
            extraData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Update optional extra failed');
    }
}

export const deleteOptionalExtra = async (extraId: string) => {
    try {
        const token = await getAuthToken();
        const response = await axios.delete(`${API.OPTIONAL_EXTRA.DELETE}/${extraId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Delete optional extra failed');
    }
}

export const getOptionalExtrasByAccommodation = async (accommodationId: string) => {
    return getAllOptionalExtras(accommodationId, false);
}
