import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";
import logo from "../../assets/images/logo.png";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-15 py-4 bg-white border-b border-gray-50">
      <Link href="/">
        <Image src={logo} alt="Logo" width={65} height={65} />
      </Link>
      
      <div className="flex items-center gap-15 text-sm font-medium text-[#0c7272]">
        <Link href="/" className="hover:text-black">Home</Link>
        <Link href="/planner" className="hover:text-black">Trip Planner</Link>
        <Link href="/bookings" className="hover:text-black">Bookings</Link>
        <Link href="/auth/dashboard" className="hover:text-black">Profile</Link>
    
      </div>
    </nav>
  );
}