//backend api call for user operations
import axios from "./axios";
import { API } from "./endpoints";
import { getAuthToken } from "../cookie";

// Update user profile with image upload support
export const updateUserProfile = async (userId: string, formData: FormData) => {
    try {
        const token = await getAuthToken();
        const response = await axios.put(
            `${API.AUTH.UPDATE_PROFILE}/${userId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Profile update failed"
        );
    }
}

// Get user by ID (for admin)
export const getUserById = async (userId: string) => {
    try {
        const token = await getAuthToken();
        const response = await axios.get(`${API.ADMIN.USER_BY_ID}/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (err: Error | any) {
        throw new Error(
            err.response?.data?.message
            || err.message
            || "Failed to fetch user"
        );
    }
}
