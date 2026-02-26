import Link from "next/link";

export default function PaymentFailurePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold text-red-700 mb-4">Payment Failed</h1>
        <p className="mb-6">There was an issue processing your payment. Please try again or contact support if the amount was deducted.</p>
        <Link href="/user/bookings" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded">
          Back to My Bookings
        </Link>
      </div>
    </div>
  );
}
