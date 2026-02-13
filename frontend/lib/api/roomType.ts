import { API } from "./endpoints";
import axios from "./axios";
import { getAuthToken } from "../cookie";

export const getAllRoomTypes = async (accommodationId?: string, includeInactive?: boolean) => {
    try {
        const params = new URLSearchParams();
        if (accommodationId) params.append('accommodationId', accommodationId);
        if (includeInactive) params.append('includeInactive', 'true');
        
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await axios.get(`${API.ROOM_TYPE.GET_ALL}${query}`);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Get room types failed');
    }
}

export const getRoomTypeById = async (roomTypeId: string) => {
    try {
        const response = await axios.get(`${API.ROOM_TYPE.GET_BY_ID}/${roomTypeId}`);
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Get room type failed');
    }
}

export const createRoomType = async (roomTypeData: any) => {
    try {
        const token = await getAuthToken();
        const response = await axios.post(
            API.ROOM_TYPE.CREATE,
            roomTypeData,
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
            || error.message || 'Create room type failed');
    }
}

export const updateRoomType = async (roomTypeId: string, roomTypeData: any) => {
    try {
        const token = await getAuthToken();
        const response = await axios.put(
            `${API.ROOM_TYPE.UPDATE}/${roomTypeId}`,
            roomTypeData,
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
            || error.message || 'Update room type failed');
    }
}

export const deleteRoomType = async (roomTypeId: string) => {
    try {
        const token = await getAuthToken();
        const response = await axios.delete(`${API.ROOM_TYPE.DELETE}/${roomTypeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Delete room type failed');
    }
}

export const getRoomTypesByAccommodation = async (accommodationId: string) => {
    return getAllRoomTypes(accommodationId, false);
}
