"use client";

import { useEffect, useState } from "react";
import { Star, Pencil, Trash2, Filter } from "lucide-react";
import { toast } from "react-toastify";
import axios from "@/lib/api/axios";

interface Review {
  _id: string;
  accommodation: { _id: string; name: string };
  user: { _id: string; name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

interface Accommodation {
  _id: string;
  name: string;
}

const AdminReviewsPage = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    const [selectedAccommodation, setSelectedAccommodation] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [sort, setSort] = useState("latest");
    const [hasMore, setHasMore] = useState(false);
    const [totalReviews, setTotalReviews] = useState(0);

    useEffect(() => {
      fetchAccommodations();
      fetchReviews();
      // eslint-disable-next-line
    }, []);

    useEffect(() => {
      fetchReviews();
      // eslint-disable-next-line
    }, [selectedAccommodation, page, sort]);

    const fetchAccommodations = async () => {
      try {
        const res = await axios.get("/api/accommodations");
        setAccommodations(res.data.data || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch accommodations");
      }
    };

    const fetchReviews = async () => {
      setLoading(true);
      try {
        let url = `/api/reviews?page=${page}&limit=${limit}&sort=${sort}`;
        if (selectedAccommodation) url += `&accommodationId=${selectedAccommodation}`;
        const res = await axios.get(url);
        // If backend returns total count, use it. Otherwise, estimate.
        setReviews(res.data.data || []);
        setHasMore((res.data.data || []).length === limit);
        if (typeof res.data.total === "number") {
          setTotalReviews(res.data.total);
        } else {
          // Estimate total pages if not available
          setTotalReviews((page - 1) * limit + (res.data.data?.length || 0) + (hasMore ? limit : 0));
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to fetch reviews");
      } finally {
        setLoading(false);
      }
    };

    const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedAccommodation(e.target.value);
      setPage(1);
    };

    const handleEdit = (review: Review) => {
      setEditingReview(review);
      setEditRating(review.rating);
      setEditComment(review.comment);
    };

    const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingReview) return;
      setSubmitting(true);
      try {
        await axios.put(`/api/reviews/${editingReview._id}`, { rating: editRating, comment: editComment });
        toast.success("Review updated successfully!");
        setEditingReview(null);
        fetchReviews();
      } catch (err: any) {
        toast.error(err.message || "Failed to update review");
      } finally {
        setSubmitting(false);
      }
    };

    const handleDelete = async (reviewId: string) => {
      if (!window.confirm("Are you sure you want to delete this review?")) return;
      setSubmitting(true);
      try {
        await axios.delete(`/api/reviews/${reviewId}`);
        toast.success("Review deleted successfully!");
        fetchReviews();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete review");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
          <h1 className="text-2xl font-bold text-[#0c7272]">All Reviews</h1>
          <div className="flex items-center gap-2">
            <Filter size={18} />
            <select
              className="border rounded px-2 py-1 text-sm"
              value={selectedAccommodation}
              onChange={handleFilter}
            >
              <option value="">All Accommodations</option>
              {accommodations.map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
            <label className="ml-2 font-medium text-sm">Sort by:</label>
            <select
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="latest">Latest</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>
        </div>
        {/* Reviews Table and Pagination */}
        {loading ? (
          <div>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-500">No reviews found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Accommodation</th>
                    <th className="p-2 border">User</th>
                    <th className="p-2 border">Rating</th>
                    <th className="p-2 border">Comment</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r._id} className="border-b">
                      <td className="p-2 border">{r.accommodation?.name || "-"}</td>
                      <td className="p-2 border">{r.user?.name || "-"}</td>
                      <td className="p-2 border">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((i) => (
                            <Star key={i} size={16} className={i <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                          ))}
                        </div>
                      </td>
                      <td className="p-2 border">{r.comment}</td>
                      <td className="p-2 border">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="p-2 border">
                        <button
                          className="p-1 rounded hover:bg-blue-50 text-blue-600 mr-1"
                          title="Edit"
                          onClick={() => handleEdit(r)}
                          disabled={submitting}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="p-1 rounded hover:bg-red-50 text-red-600"
                          title="Delete"
                          onClick={() => handleDelete(r._id)}
                          disabled={submitting}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Styled Pagination Controls (Bookings style) */}
            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between mt-6">
              {/* Showing X to Y of Z reviews */}
              <div className="text-sm text-gray-600">
                {(() => {
                  const startIdx = (page - 1) * limit + 1;
                  const endIdx = Math.min(page * limit, totalReviews);
                  return `Showing ${startIdx} to ${endIdx} of ${totalReviews} reviews`;
                })()}
              </div>
              <div className="flex gap-2">
                {/* Prev chevron */}
                <button
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"></path></svg>
                </button>
                <div className="flex items-center gap-1">
                  {(() => {
                    const totalPages = Math.max(1, Math.ceil(totalReviews / limit));
                    const maxLinks = 5;
                    let start = Math.max(1, page - 2);
                    let end = Math.min(totalPages, page + 2);
                    if (page <= 2) end = Math.min(totalPages, maxLinks);
                    if (page >= totalPages - 1) start = Math.max(1, totalPages - maxLinks + 1);
                    const links = [];
                    if (start > 1) {
                      links.push(<span key="start-ellipsis" className="px-2">...</span>);
                    }
                    for (let i = start; i <= end; i++) {
                      links.push(
                        <button
                          key={i}
                          className={`px-3 py-1 rounded-lg transition ${page === i ? 'bg-[#0c7272] text-white' : 'bg-gray-50 text-gray-700'}`}
                          onClick={() => setPage(i)}
                          disabled={page === i}
                        >{i}</button>
                      );
                    }
                    if (end < totalPages) {
                      links.push(<span key="end-ellipsis" className="px-2">...</span>);
                    }
                    return links;
                  })()}
                </div>
                {/* Next chevron */}
                <button
                  disabled={page === Math.max(1, Math.ceil(totalReviews / limit)) || !hasMore}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  onClick={() => setPage(p => Math.min(Math.ceil(totalReviews / limit), p + 1))}
                  aria-label="Next page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"></path></svg>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Edit Modal */}
        {editingReview && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4 text-[#0c7272]">Edit Review</h2>
              <form onSubmit={handleUpdate} className="space-y-3">
                <div>
                  <label className="block font-medium mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setEditRating(star)}
                        className="focus:outline-none"
                      >
                        <Star size={22} className={star <= editRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-1">Comment</label>
                  <textarea
                    value={editComment}
                    onChange={e => setEditComment(e.target.value)}
                    required
                    className="border rounded px-3 py-2 w-full"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition font-semibold"
                    onClick={() => setEditingReview(null)}
                    disabled={submitting}
                  >Cancel</button>
                  <button
                    type="submit"
                    disabled={submitting || editRating === 0}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold"
                  >{submitting ? "Updating..." : "Update"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
};

export default AdminReviewsPage;
