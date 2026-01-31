"use client";

import { useAuth } from "@/app/components/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/app/components/navbar/Navbar";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import himalayanLodge from "../../assets/images/himlayan-eco-resort.jpg";
import barauliLodge from "../../assets/images/barauli.jpg";
import organicFarmstay from "../../assets/images/organic-farm.jpg";
export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="text-center py-10">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Optionally render nothing or a spinner while redirecting
    return null;
  }

  const DESTINATIONS = [
    {
      id: 1,
      title: "Himalayan Eco Lodge",
      location: "Kaski District",
      rating: 4.9,
      description:
        "Breathtaking views, comfortable lodging, and sustainable tourism.",
      image: himalayanLodge,
    },
    {
      id: 2,
      title: "Barauli Community Homestay",
      location: "Chitwan District",
      rating: 4.9,
      description:
        "Experience Tharu culture with local food and community-run stays.",
      image: barauliLodge,
    },
    {
      id: 3,
      title: "Organic Farmstay",
      location: "Dhading District",
      rating: 4.8,
      description:
        "Peaceful eco-friendly retreat surrounded by nature and farms.",
      image: organicFarmstay,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="px-10 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, Traveler 
          </h1>
          <p className="text-gray-500 mt-1">
            Discover destinations curated just for you.
          </p>
        </div>

        {/* Destinations */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recommended stays
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DESTINATIONS.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition overflow-hidden"
              >
                <Image
                  src={place.image}
                  alt={place.title}
                  className="w-full h-48 object-cover"
                />

                <div className="p-5 space-y-2">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {place.title}
                  </h3>

                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={14} />
                    {place.location}
                  </div>

                  <div className="flex items-center gap-1 text-sm text-yellow-500">
                    <Star size={14} fill="currentColor" />
                    {place.rating}
                  </div>

                  <p className="text-sm text-gray-600">
                    {place.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Map Section */}
        <section className="mt-14">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Explore on map
          </h2>

          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <iframe
              title="Nepal Map"
              src="https://www.google.com/maps?q=Nepal&z=7&output=embed"
              className="w-full h-[420px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <p className="text-sm text-gray-500 mt-2">
            *Map preview only. Interactive features coming soon.
          </p>
        </section>
      </main>
    </div>
  );
}
