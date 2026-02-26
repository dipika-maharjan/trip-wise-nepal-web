import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Mail, Phone } from "lucide-react";
import logo from "../../../public/images/logo.png";

export default function Footer() {
  return (
    <footer className="bg-[#134e4a] text-white pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Column 1: Brand & About */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-white w-fit p-1 rounded-lg">
            <Image src={logo} alt="Logo" width={40} height={40} />
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            TripWiseNepal helps you discover the hidden gems of the Himalayas with personalized travel experiences.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="font-bold text-lg mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-[#ff9f1c]">Home</Link></li>
            <li><Link href="/accommodations" className="hover:text-[#ff9f1c]">Accommodations</Link></li>
            <li><Link href="/user/bookings" className="hover:text-[#ff9f1c]">My Bookings</Link></li>
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div>
          <h4 className="font-bold text-lg mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-center gap-2"><Mail size={16} /> info@tripwisenepal.com</li>
            <li className="flex items-center gap-2"><Phone size={16} /> +977 9800000000</li>
          </ul>
        </div>

        {/* Column 4: Social Media */}
        <div>
          <h4 className="font-bold text-lg mb-4">Follow Us</h4>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-[#ff9f1c] transition-colors">
              <Facebook size={20} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-[#ff9f1c] transition-colors">
              <Instagram size={20} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-[#ff9f1c] transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-6xl mx-auto px-6 mt-12 pt-8 border-t border-white/10 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} TripWiseNepal. All rights reserved.
      </div>
    </footer>
  );
}