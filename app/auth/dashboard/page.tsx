import Navbar from "@/app/components/navbar/page";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-10">
        <h1 className="text-2xl font-bold">Welcome back, Traveler!</h1>
        <p className="text-gray-500">This is your private dashboard area.</p>
        <div className="mt-6 p-10 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300 text-center">
          Upcoming Trips will appear here.
        </div>
      </div>
    </div>
  );
}