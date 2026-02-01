"use client";

import Image from "next/image";

import { Search, Star } from "lucide-react";

// Assets
import mainImage from "../public/images/main-section.png";
import himalayanLodge from "../public/images/himlayan-eco-resort.jpg";
import barauliLodge from "../public/images/barauli.jpg";
import organicFarmstay from "../public/images/organic-farm.jpg";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";

const DESTINATIONS = [
  {
    id: 1,
    title: "Himalayan Eco Lodge",
    location: "Kaski District",
    rating: 4.9,
    description: "Breathtaking views, comfortable lodging, and a commitment to sustainable tourism.",
    image: himalayanLodge, 
  },
  {
    id: 2,
    title: "Barauli Community Homestay",
    location: "Chitwan District",
    rating: 4.9,
    description: "Culture of the Tharu people through community-run cottages, local food, and activities.",
    image: barauliLodge, 
  },
  {
    id: 3,
    title: "Organic Farmstay",
    location: "Dhading District",
    rating: 4.8,
    description: "Peaceful, eco-friendly retreat with options ranging from simple homestays to comfortable resorts.",
    image: organicFarmstay,
  },
  {
    id: 4,
    title: "Himalayan Eco Lodge",
    location: "Kaski District",
    rating: 4.9,
    description: "Breathtaking views, comfortable lodging, and a commitment to sustainable tourism.",
    image: himalayanLodge, 
  },
  {
    id: 5,
    title: "Barauli Community Homestay",
    location: "Chitwan District",
    rating: 4.9,
    description: "Culture of the Tharu people through community-run cottages, local food, and activities.",
    image: barauliLodge, 
  },
  {
    id: 6,
    title: "Organic Farmstay",
    location: "Dhading District",
    rating: 4.8,
    description: "Peaceful, eco-friendly retreat with options ranging from simple homestays to comfortable resorts.",
    image: organicFarmstay,
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#134e4a]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="flex justify-center mb-10">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search destinations, places" 
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0c7272]/20"
            />
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative h-[350px] rounded-3xl overflow-hidden mb-12 shadow-xl">
          <Image src={mainImage} alt="Nepal Mountains" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white text-center">
            <h2 className="text-4xl font-bold mb-2">Discover Your Nepal</h2>
            <p className="mb-6 opacity-90">Personalized trips to breathtaking destinations.</p>
            <button className="bg-[#ff9f1c] hover:bg-[#f39200] text-white px-8 py-3 rounded-full font-bold transition-transform hover:scale-105">
              Explore Now
            </button>
          </div>
        </section>

        {/* For You Section */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-6">For You</h3>
          
          {/* Grid handles columns automatically */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DESTINATIONS.map((dest) => (
              <div key={dest.id} className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden flex flex-col">
                <div className="h-48 relative">
                    <Image 
                        src={dest.image} 
                        alt={dest.title} 
                        fill 
                        className="object-cover" 
                    />
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-lg leading-tight">{dest.title}</h4>
                    <span className="flex items-center text-xs font-bold gap-1 shrink-0">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" /> 
                        {dest.rating}
                    </span>
                  </div>
                  
                  <p className="text-xs text-[#0c7272] mb-2 font-medium">{dest.location}</p>
                  <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-3">
                    {dest.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer/>
    </div>
  );
}