"use client";

import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/lib/api/auth";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const ResetPasswordSchema = z.object({
    newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" })
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordData>({
        resolver: zodResolver(ResetPasswordSchema)
    });

    const onSubmit = async (data: ResetPasswordData) => {
        if (!token) {
            toast.error('Invalid or expired reset link.');
            return;
        }

        try {
            const response = await resetPassword(token, data.newPassword);
            if (response.success) {
                toast.success('Password reset successfully! Redirecting to login...');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                toast.error(response.message || 'Failed to reset password.');
            }
        } catch (error) {
            toast.error((error as Error).message || 'Failed to reset password.');
        }
    };

    if (!token) {
        return (
            <div className="w-full max-w-sm">
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
                    Invalid or expired reset link. Please try requesting a new one.
                </div>
                <Link href="/forget-password" className="flex items-center gap-2 text-[#134e4a] hover:underline">
                    <ArrowLeft size={16} />
                    Request New Link
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm">
            <Link href="/login" className="flex items-center gap-2 text-[#134e4a] hover:underline mb-6">
                <ArrowLeft size={16} />
                Back to Login
            </Link>

            <h2 className="text-[#134e4a] text-xl font-semibold py-5 text-center">
                Reset Password
            </h2>
            <p className="text-gray-500 text-sm text-center mb-6">
                Enter your new password below.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* New Password */}
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-green-50/30 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition-all text-sm"
                            {...register("newPassword")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Eye size={18} />
                        </button>
                    </div>
                    {errors.newPassword && (
                        <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-green-50/30 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition-all text-sm"
                            {...register("confirmPassword")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <Eye size={18} />
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#134e4a] text-white py-3 rounded-xl font-semibold hover:bg-[#0e3a38] disabled:opacity-70 transition-colors mt-6"
                >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium">
                Remember your password?{" "}
                <Link href="/login" className="text-[#00a884] font-bold hover:underline">
                    Login
                </Link>
            </p>
        </div>
    );
}
