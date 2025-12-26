import Link from "next/link";
import Image from "next/image";
import logo from "../assets/images/logo.png";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-15 py-4 bg-white border-b border-gray-50">
      <Link href="/">
        <Image src={logo} alt="Logo" width={65} height={65} />
      </Link>
      
      <div className="flex items-center gap-8 text-sm font-medium text-[#0c7272]">
        <Link href="/" className="hover:text-black">Home</Link>
        <Link href="/map" className="hover:text-black">Map</Link>
        <Link href="/bookings" className="hover:text-black">Bookings</Link>
        <Link href="/auth/dashboard" className="hover:text-black">Profile</Link>

        <Link href="/login" className="border border-[#0c7272] px-4 py-2 rounded-full hover:bg-[#0c7272] hover:text-white transition">
        <button>Login</button>
        </Link>

        <Link href="/register" className="border border-[#0c7272] px-4 py-2 rounded-full hover:bg-[#0c7272] hover:text-white transition">
        <button>Register</button>
        </Link>
    
      </div>
    </nav>
  );
}