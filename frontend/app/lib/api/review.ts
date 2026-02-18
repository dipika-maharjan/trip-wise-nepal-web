export async function updateReview(reviewId: string, data: { rating?: number; comment?: string }) {
  const res = await axios.put(
     `/api/reviews/${reviewId}`,
     data
  );
  return res.data.data;
}

export async function deleteReview(reviewId: string) {
  const res = await axios.delete(
     `/api/reviews/${reviewId}`
  );
  return res.data.data;
}
import axios from "@/lib/api/axios";

export async function getReviews(accommodationId: string) {
  const res = await axios.get(`/api/reviews?accommodationId=${accommodationId}`);
  return res.data.data;
}

export async function createReview({ accommodationId, rating, comment }: { accommodationId: string; rating: number; comment: string }) {
  const res = await axios.post(
     "/api/reviews",
     { accommodationId, rating, comment }
  );
  return res.data.data;
}
