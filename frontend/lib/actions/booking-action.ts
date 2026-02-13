"use server";
import { createBooking, cancelBooking } from "@/lib/api/booking";
import { revalidatePath } from 'next/cache';

export const handleCreateBooking = async (data: any) => {
    try {
        const response = await createBooking(data);
        if (response.success) {
            revalidatePath('/user/bookings');
            return {
                success: true,
                message: 'Booking created successfully',
                data: response.data
            }
        }
        return {
            success: false,
            message: response.message || 'Create booking failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Create booking action failed' }
    }
}

export const handleCancelBooking = async (bookingId: string) => {
    try {
        const response = await cancelBooking(bookingId);
        if (response.success) {
            revalidatePath('/user/bookings');
            revalidatePath('/admin/bookings');
            return {
                success: true,
                message: 'Booking cancelled successfully'
            }
        }
        return {
            success: false,
            message: response.message || 'Cancel booking failed'
        }
    } catch (error: Error | any) {
        return { success: false, message: error.message || 'Cancel booking action failed' }
    }
}
