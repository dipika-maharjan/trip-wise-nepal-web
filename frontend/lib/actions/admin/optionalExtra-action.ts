"use server";
import { createOptionalExtra, updateOptionalExtra, deleteOptionalExtra } from "@/lib/api/optionalExtra";
import { revalidatePath } from 'next/cache';

export const handleCreateOptionalExtra = async (data: any) => {
    try {
        const response = await createOptionalExtra(data);
        if (response.success) {
            revalidatePath('/admin/optional-extras');
            return {
                success: true,
                message: 'Optional extra created successfully',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Create optional extra failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Create optional extra action failed' }
    }
}

export const handleUpdateOptionalExtra = async (extraId: string, data: any) => {
    try {
        const response = await updateOptionalExtra(extraId, data);
        if (response.success) {
            revalidatePath('/admin/optional-extras');
            return {
                success: true,
                message: 'Optional extra updated successfully',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Update optional extra failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Update optional extra action failed' }
    }
}

export const handleDeleteOptionalExtra = async (extraId: string) => {
    try {
        const response = await deleteOptionalExtra(extraId);
        if (response.success) {
            revalidatePath('/admin/optional-extras');
            return {
                success: true,
                message: 'Optional extra deleted successfully'
            }
        }
        return {
            success: false,
            message: response.message || 'Delete optional extra failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Delete optional extra action failed' }
    }
}
