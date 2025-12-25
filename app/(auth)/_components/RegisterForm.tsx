import Image from "next/image";
import { Apple, Chrome, EarthIcon, Eye, Facebook } from "lucide-react";
import logo from "../../assets/images/logo.png";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            {/* main container */}
            <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* left side */}
                <div className="md:w-1/2 bg-[#0C7272] p-12 flex flex-col items-center justify-center text-white text-center">
                    <h1 className="text-4xl font-bold italic mb-4">TripWiseNepal</h1>
                    <div className="mb-6">
                        <span><EarthIcon size={24}/></span>
                    </div>

                    <p className="text-lg font-medium">Find Your Dream Destination With Us!</p>
                </div>

                {/* right side */}
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col items-center justify-center">
                    <div className="w-full max-w-sm">
                        {/* logo */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-16 h-16 relative mb-2">
                                <Image alt="Logo" src={logo} width={64} height={64} />
                            </div>
                            <h2 className="text-[#134e4a] text-xl font-semibold">Create new account</h2>
                        </div>

                        {/* form */}
                        <form className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                <input type="email" placeholder="Enter your email address" className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-green-50/30 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition-all text-sm"/>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                <div className="relative">
                                    <input type="password" placeholder="Enter your password" className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-green-50/30 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition-all text-sm"/>

                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                        <Eye size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700"> Confirm Password</label>
                                <div className="relative">
                                    <input type="password" placeholder="Enter your confirm password" className="w-full px-4 py-3 rounded-xl border border-blue-100 bg-green-50/30 focus:outline-none focus:ring-2 focus:ring-[#00a884]/20 transition-all text-sm"/>

                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                        <Eye size={18} />
                                    </button>
                                </div>
                            </div>


                            <button className="w-full bg-[#134e4a] text-white py-3 rounded-xl font-semibold hover:bg-[#0e3a38] transition-colors mt-4">
                                Register
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-xs text-[#00a884] font-medium mb-4">Or continue with</p>
                            <div className="flex justify-center gap-4">
                                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"><Chrome size={20} /></button>
                                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"><Facebook size={20} /></button>
                                <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"><Apple size={20} /></button>
                            </div>
                        </div>

                        <p className="mt-8 text-center text-sm font-medium">
                            Already have an account? <a href="/login" className="text-[#00a884] font-bold">Login</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}