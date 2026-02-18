import { AccommodationModel } from "../models/accommodation.model";
import { ReviewModel, IReview } from "../models/review.model";
import { ClientSession } from "mongoose";

export class ReviewRepository {

  // Admin: update any review by id
  async updateReviewById(reviewId: string, update: Partial<IReview>): Promise<IReview | null> {
    return await ReviewModel.findByIdAndUpdate(reviewId, update, { new: true });
  }

  // Admin: delete any review by id
  async deleteReviewById(reviewId: string): Promise<IReview | null> {
    return await ReviewModel.findByIdAndDelete(reviewId);
  }

  async getAllReviews({ page = 1, limit = 10, sort = "latest" }: { page?: number; limit?: number; sort?: string } = {}): Promise<any[]> {
    let sortOption: any = { createdAt: -1 };
    if (sort === "highest") sortOption = { rating: -1 };
    if (sort === "lowest") sortOption = { rating: 1 };
    // Populate and map to match frontend expectations (user, accommodation fields)
    const reviews = await ReviewModel.find({})
      .populate("userId", "name email")
      .populate("accommodationId", "name")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);
    return reviews.map((r: any) => ({
      _id: r._id,
      user: r.userId ? { _id: r.userId._id, name: r.userId.name || r.userId.email } : null,
      accommodation: r.accommodationId ? { _id: r.accommodationId._id, name: r.accommodationId.name } : null,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));
  }

  // Helper to recalculate and update accommodation's average rating and totalReviews
  async updateAccommodationRating(accommodationId: string) {
    const reviews = await ReviewModel.find({ accommodationId });
    const totalReviews = reviews.length;
    let avgRating = 0;
    if (totalReviews > 0) {
      avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
    }
    await AccommodationModel.findByIdAndUpdate(accommodationId, {
      rating: avgRating,
      totalReviews: totalReviews
    });
  }
  async createReview(data: Partial<IReview>, session?: ClientSession): Promise<IReview> {
    const review = new ReviewModel(data);
    return await review.save({ session });
  }

  async getReviewsByAccommodation(accommodationId: string, { page = 1, limit = 10, sort = "latest" }: { page?: number; limit?: number; sort?: string } = {}): Promise<any[]> {
    let sortOption: any = { createdAt: -1 };
    if (sort === "highest") sortOption = { rating: -1 };
    if (sort === "lowest") sortOption = { rating: 1 };
    // Populate both user and accommodation, map to frontend DTO
    const reviews = await ReviewModel.find({ accommodationId })
      .populate("userId", "name email")
      .populate("accommodationId", "name")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);
    return reviews.map((r: any) => ({
      _id: r._id,
      user: r.userId ? { _id: r.userId._id, name: r.userId.name || r.userId.email } : null,
      accommodation: r.accommodationId ? { _id: r.accommodationId._id, name: r.accommodationId.name } : null,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));
  }

  async getUserReviewForAccommodation(userId: string, accommodationId: string): Promise<IReview | null> {
    return await ReviewModel.findOne({ userId, accommodationId });
  }
  async updateReview(reviewId: string, userId: string, update: Partial<IReview>): Promise<IReview | null> {
    return await ReviewModel.findOneAndUpdate(
      { _id: reviewId, userId },
      update,
      { new: true }
    );
  }

  async deleteReview(reviewId: string, userId: string): Promise<IReview | null> {
    return await ReviewModel.findOneAndDelete({ _id: reviewId, userId });
  }
}
