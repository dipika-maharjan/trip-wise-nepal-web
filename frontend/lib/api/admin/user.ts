import { API } from "../endpoints";
import axios from "../axios";
import { getAuthToken } from "../../cookie";

export const createUser = async (userData: FormData) => {
    try {
        const token = await getAuthToken();
        const response = await axios.post(
            API.AUTH.CREATE_USER,
            userData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Create user failed');
    }
}

export const getAllUsers = async () => {
    try {
        const token = await getAuthToken();
        const response = await axios.get(API.ADMIN.USER.GET_ALL, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Get users failed');
    }
}

export const getUserById = async (userId: string) => {
    try {
        const token = await getAuthToken();
        const response = await axios.get(`${API.ADMIN.USER.GET_BY_ID}/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Get user failed');
    }
}

export const updateUser = async (userId: string, userData: FormData) => {
    try {
        const token = await getAuthToken();
        const response = await axios.put(
            `${API.ADMIN.USER.UPDATE}/${userId}`,
            userData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                }
            }
        );
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Update user failed');
    }
}

export const deleteUser = async (userId: string) => {
    try {
        const token = await getAuthToken();
        const response = await axios.delete(`${API.ADMIN.USER.DELETE}/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error: Error | any) {
        throw new Error(error.response?.data?.message
            || error.message || 'Delete user failed');
    }
}