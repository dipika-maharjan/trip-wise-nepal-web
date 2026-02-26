import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold text-green-700 mb-4">Payment Successful!</h1>
        <p className="mb-6">Thank you for your payment. Your booking has been confirmed.</p>
        <Link href="/user/bookings" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">
          Go to My Bookings
        </Link>
      </div>
    </div>
  );
}
