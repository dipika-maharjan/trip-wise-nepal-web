"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye} from "lucide-react";
import { LoginData, loginSchema } from "../schema"; 

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginData) => {
    alert(`Logged in with email: ${data.email}`);
    router.push("/auth/dashboard");
  };

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-[#134e4a] text-xl font-semibold py-5 text-center">
        Login to your account
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email field */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Email Address</label>
          <input
            type="email"
            placeholder="Enter your email address"
            className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-green-50/30 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition-all text-sm"
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password field */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-green-50/30 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition-all text-sm"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Eye size={18} />
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        <div className="text-right">
          <a href="#" className="text-xs text-gray-500 hover:text-[#00a884]">Forgot Password?</a>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#134e4a] text-white py-3 rounded-xl font-semibold hover:bg-[#0e3a38] disabled:opacity-70 transition-colors mt-4"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm font-medium">
        Don't have an account?{" "}
        <a href="/register" className="text-[#00a884] font-bold">Signup</a>
      </p>
    </div>
  );
}