"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/images/logo.png";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className="flex items-center px-15 py-4 bg-white border-b border-gray-50">
      <Link href="/">
        <Image src={logo} alt="Logo" width={65} height={65} />
      </Link>
      <div className="ml-auto flex items-center gap-8 text-sm font-medium text-[#0c7272]">
        <Link href="/" className="hover:text-black">Home</Link>
        <Link href="/accommodations" className="hover:text-black">Accommodations</Link>
        {isAuthenticated && (
          <Link href="/user/bookings" className="hover:text-black">My Bookings</Link>
        )}
        {isAuthenticated ? (
          <div className="relative ml-4" ref={dropdownRef}>
            {user?.imageUrl ? (
              <img
                src={
                  user.imageUrl.startsWith("http")
                    ? user.imageUrl
                    : user.imageUrl.startsWith("/")
                      ? `http://localhost:5050${user.imageUrl}`
                      : `http://localhost:5050/uploads/${user.imageUrl}`
                }
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-[#0c7272] cursor-pointer transition-shadow shadow-sm hover:shadow-lg"
                onClick={() => setDropdownOpen((open) => !open)}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full border-2 border-[#0c7272] bg-[#0c7272] text-white flex items-center justify-center cursor-pointer font-bold text-xs"
                onClick={() => setDropdownOpen((open) => !open)}
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-[#0c7272]"
                  onClick={() => {
                    setDropdownOpen(false);
                    router.push("/user/profile");
                  }}
                >
                  Go to Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-[#0c7272] border-t border-gray-100"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/login">
              <button className="border border-[#0c7272] px-4 py-2 rounded-full hover:bg-[#0c7272] hover:text-white transition">
                Login
              </button>
            </Link>
            <Link href="/register">
              <button className="border border-[#0c7272] px-4 py-2 rounded-full hover:bg-[#0c7272] hover:text-white transition">
                Register
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}