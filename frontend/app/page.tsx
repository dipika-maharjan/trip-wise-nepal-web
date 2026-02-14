"use client";

import Image from "next/image";

import { Search, Star } from "lucide-react";

// Assets

import mainImage from "../public/images/main-section.png";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllAccommodations, searchAccommodations, Accommodation } from "../lib/api/accommodation";




export default function HomePage() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAllAccommodations()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAccommodations(res.data.filter((a) => a.isActive !== false));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim() === "") {
      setLoading(true);
      getAllAccommodations()
        .then((res) => {
          if (Array.isArray(res.data)) {
            setAccommodations(res.data.filter((a) => a.isActive !== false));
          }
        })
        .finally(() => setLoading(false));
      return;
    }
    setLoading(true);
    searchAccommodations(value)
      .then((res) => {
        if (Array.isArray(res.data)) {
          setAccommodations(res.data.filter((a) => a.isActive !== false));
        }
      })
      .finally(() => setLoading(false));
  };


  // Scroll to 'For You' section or go to /accommodations if no results
  const handleExploreNow = () => {
    const forYouSection = document.getElementById('for-you-section');
    if (accommodations.length > 0 && forYouSection) {
      forYouSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/accommodations';
    }
  };

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
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative h-[350px] rounded-3xl overflow-hidden mb-12 shadow-xl">
          <Image src={mainImage} alt="Nepal Mountains" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white text-center">
            <h2 className="text-4xl font-bold mb-2">Discover Your Nepal</h2>
            <p className="mb-6 opacity-90">Personalized trips to breathtaking destinations.</p>
            <button
              className="bg-[#ff9f1c] hover:bg-[#f39200] text-white px-8 py-3 rounded-full font-bold transition-transform hover:scale-105"
              onClick={handleExploreNow}
              disabled={accommodations.length === 0}
            >
              Explore Now
            </button>
          </div>
        </section>

        {/* For You Section */}
        <section id="for-you-section" className="mb-12 scroll-mt-24">
          <h3 className="text-2xl font-bold mb-6">For You</h3>
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading...</div>
          ) : accommodations.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No accommodations found. Try searching or check back later!</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accommodations.map((acc) => (
                <Link
                  key={acc._id}
                  href={`/accommodations/${acc._id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow"
                  title={acc.name}
                >
                  <div className="h-48 relative">
                    {(() => {
                      const imgSrc = acc.images && acc.images.length > 0
                        ? acc.images[0].startsWith('http')
                          ? acc.images[0]
                          : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}${acc.images[0]}`
                        : "/images/main-section.png";
                      const isLocal = imgSrc.startsWith("/images/") || imgSrc.startsWith("/_next/");
                      if (isLocal) {
                        return (
                          <Image
                            src={imgSrc}
                            alt={acc.name}
                            fill
                            className="object-cover"
                          />
                        );
                      } else {
                        return (
                          <img
                            src={imgSrc}
                            alt={acc.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        );
                      }
                    })()}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-lg leading-tight line-clamp-1" title={acc.name}>{acc.name}</h4>
                      <span className="flex items-center text-xs font-bold gap-1 shrink-0">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        {acc.rating?.toFixed(1) ?? "-"}
                      </span>
                    </div>
                    <p className="text-xs text-[#0c7272] mb-2 font-medium line-clamp-1" title={acc.address}>{acc.address}</p>
                    <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-3">
                      {acc.overview}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}