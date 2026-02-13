import { API } from "./endpoints";
import axios from "./axios";
import { getAuthToken } from "../cookie";

export const createBooking = async (bookingData: any) => {
    try {
        const token = await getAuthToken();
        const response = await axios.post(
            API.BOOKING.CREATE,
            bookingData,
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
            || error.message || 'Create booking failed');
    }
}

export const getMyBookings = async () => {
    try {
        const token = await getAuthToken();
        const response = await axios.get(API.BOOKING.GET_MY_BOOKINGS, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Get bookings failed');
    }
}

export const getAllBookings = async () => {
    try {
        const token = await getAuthToken();
        const response = await axios.get(API.BOOKING.GET_ALL, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Get bookings failed');
    }
}

export const getBookingById = async (bookingId: string) => {
    try {
        const token = await getAuthToken();
        const response = await axios.get(`${API.BOOKING.GET_BY_ID}/${bookingId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Get booking failed');
    }
}

export const cancelBooking = async (bookingId: string) => {
    try {
        const token = await getAuthToken();
        const response = await axios.patch(
            `${API.BOOKING.CANCEL}/${bookingId}/cancel`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Cancel booking failed');
    }
}

export const updateBooking = async (bookingId: string, data: any) => {
    try {
        const token = await getAuthToken();
        const response = await axios.patch(
            `${API.BOOKING.UPDATE}/${bookingId}`,
            data,
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
            || error.message || 'Update booking failed');
    }
}

export const updateBookingStatuses = async (
    bookingId: string,
    data: { bookingStatus?: string; paymentStatus?: string }
) => {
    try {
        const token = await getAuthToken();
        const response = await axios.patch(
            `${API.BOOKING.UPDATE_STATUS}/${bookingId}/status`,
            data,
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
            || error.message || 'Update booking failed');
    }
}

export const deleteBooking = async (bookingId: string) => {
    try {
        const token = await getAuthToken();
        const response = await axios.delete(`${API.BOOKING.DELETE}/${bookingId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Delete booking failed');
    }
}
