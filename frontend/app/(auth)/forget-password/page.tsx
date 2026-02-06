"use client";

import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@/lib/api/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const ForgetPasswordSchema = z.object({
    email: z.email({ message: "Please enter a valid email address" })
});

type ForgetPasswordData = z.infer<typeof ForgetPasswordSchema>;

export default function ForgetPasswordPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgetPasswordData>({
        resolver: zodResolver(ForgetPasswordSchema)
    });

    const onSubmit = async (data: ForgetPasswordData) => {
        try {
            const response = await requestPasswordReset(data.email);
            if (response.success) {
                toast.success('Password reset link sent to your email. Please check your inbox.');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                toast.error(response.message || 'Failed to request password reset.');
            }
        } catch (error) {
            toast.error((error as Error).message || 'Failed to request password reset.');
        }
    };

    return (
        <div className="w-full max-w-sm">
            <Link href="/login" className="flex items-center gap-2 text-[#134e4a] hover:underline mb-6">
                <ArrowLeft size={16} />
                Back to Login
            </Link>

            <h2 className="text-[#134e4a] text-xl font-semibold py-5 text-center">
                Forgot Password?
            </h2>
            <p className="text-gray-500 text-sm text-center mb-6">
                Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-gray-700">
                        Email Address
                    </label>
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-green-50/30 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition-all text-sm"
                        {...register("email")}
                    />
                    {errors.email && (
                        <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#134e4a] text-white py-3 rounded-xl font-semibold hover:bg-[#0e3a38] disabled:opacity-70 transition-colors mt-6"
                >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
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
