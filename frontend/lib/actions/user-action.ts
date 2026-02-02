"use server";

import { updateUserProfile } from "../api/user";
import { setUserData } from "../cookie";

export const handleUpdateProfile = async (userId: string, formData: FormData) => {
    try {
        const result = await updateUserProfile(userId, formData);
        
        if (result.success) {
            // Update user data in cookies after successful profile update
            await setUserData(result.data);
            return {
                success: true,
                message: "Profile updated successfully",
                data: result.data
            };
        }
        return {
            success: false,
            message: result.message || "Profile update failed"
        };
    } catch (err: Error | any) {
        return {
            success: false,
            message: err.message || "Profile update failed"
        };
    }
}
