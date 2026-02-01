import Image from "next/image";
import { EarthIcon } from "lucide-react";
import logo from "../../public/images/logo.png";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* Main Container */}
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Left Side */}
        <div className="md:w-1/2 bg-[#0C7272] p-12 flex flex-col items-center justify-center text-white text-center">
          <h1 className="text-4xl font-bold italic mb-4">TripWiseNepal</h1>
          <div className="mb-6">
            <EarthIcon size={48} className="opacity-90" />
          </div>
          <p className="text-lg font-medium">Find Your Dream Destination With Us!</p>
        </div>

        {/* Right Side */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col items-center justify-center">
          {/* Logo and Header */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 relative ">
              <Image alt="Logo" src={logo} width={64} height={64} priority />
            </div>
          </div>

          {/* Render nested page (login, register, etc.) */}
          {children}
        </div>

      </div>
    </div>
  );
}