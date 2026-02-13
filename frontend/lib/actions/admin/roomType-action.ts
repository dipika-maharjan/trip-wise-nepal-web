"use server";
import { createRoomType, updateRoomType, deleteRoomType } from "@/lib/api/roomType";
import { revalidatePath } from 'next/cache';

export const handleCreateRoomType = async (data: any) => {
    try {
        const response = await createRoomType(data);
        if (response.success) {
            revalidatePath('/admin/room-types');
            return {
                success: true,
                message: 'Room type created successfully',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Create room type failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Create room type action failed' }
    }
}

export const handleUpdateRoomType = async (roomTypeId: string, data: any) => {
    try {
        const response = await updateRoomType(roomTypeId, data);
        if (response.success) {
            revalidatePath('/admin/room-types');
            return {
                success: true,
                message: 'Room type updated successfully',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Update room type failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Update room type action failed' }
    }
}

export const handleDeleteRoomType = async (roomTypeId: string) => {
    try {
        const response = await deleteRoomType(roomTypeId);
        if (response.success) {
            revalidatePath('/admin/room-types');
            return {
                success: true,
                message: 'Room type deleted successfully'
            }
        }
        return {
            success: false,
            message: response.message || 'Delete room type failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Delete room type action failed' }
    }
}
