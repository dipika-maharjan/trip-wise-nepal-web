import axios from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";

export async function updateReview(reviewId: string, data: { rating?: number; comment?: string }) {
  const res = await axios.put(
    API.REVIEW.UPDATE(reviewId),
    data
  );
  return res.data.data;
}

export async function deleteReview(reviewId: string) {
  const res = await axios.delete(
    API.REVIEW.DELETE(reviewId)
  );
  return res.data.data;
}

export async function getReviews(accommodationId: string, { page = 1, limit = 5, sort = "latest" } = {}) {
  const res = await axios.get(API.REVIEW.GET_ALL(accommodationId, page, limit, sort));
  return res.data.data;
}

export async function createReview({ accommodationId, rating, comment }: { accommodationId: string; rating: number; comment: string }) {
  const res = await axios.post(
    API.REVIEW.CREATE,
    { accommodationId, rating, comment }
  );
  return res.data.data;
}
