import { ReviewModel, IReview } from "../models/review.model";
import { ClientSession } from "mongoose";

export class ReviewRepository {
  async createReview(data: Partial<IReview>, session?: ClientSession): Promise<IReview> {
    const review = new ReviewModel(data);
    return await review.save({ session });
  }

  async getReviewsByAccommodation(accommodationId: string): Promise<IReview[]> {
    return await ReviewModel.find({ accommodationId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });
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
