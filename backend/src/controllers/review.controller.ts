import { Request, Response } from "express";
import { CreateReviewDTO } from "../dtos/review.dto";
import { UpdateReviewDTO } from "../dtos/review-update.dto";
import { ReviewRepository } from "../repositories/review.repository";
import z from "zod";

const reviewRepository = new ReviewRepository();

export class ReviewController {
  // Update a review
  async updateReview(req: Request, res: Response) {
    try {
      const user = req.user as any;
      if (!user?._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const { reviewId } = req.params;
      const parseData = UpdateReviewDTO.safeParse(req.body);
      if (!parseData.success) {
        return res.status(400).json({ success: false, message: z.prettifyError(parseData.error) });
      }
      let updated;
      if (user.role === 'admin') {
        // Admin can update any review
        updated = await reviewRepository.updateReviewById(reviewId, parseData.data);
      } else {
        // User can only update their own review
        updated = await reviewRepository.updateReview(reviewId, user._id, parseData.data);
      }
      if (!updated) {
        return res.status(404).json({ success: false, message: "Review not found or not authorized" });
      }
      await reviewRepository.updateAccommodationRating(updated.accommodationId.toString());
      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Delete a review
  async deleteReview(req: Request, res: Response) {
    try {
      const user = req.user as any;
      if (!user?._id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const { reviewId } = req.params;
      let deleted;
      if (user.role === 'admin') {
        // Admin can delete any review
        deleted = await reviewRepository.deleteReviewById(reviewId);
      } else {
        // User can only delete their own review
        deleted = await reviewRepository.deleteReview(reviewId, user._id);
      }
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Review not found or not authorized" });
      }
      await reviewRepository.updateAccommodationRating(deleted.accommodationId.toString());
      return res.status(200).json({ success: true, data: deleted });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  // Create a new review
  async createReview(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const parseData = CreateReviewDTO.safeParse(req.body);
      if (!parseData.success) {
        return res.status(400).json({ success: false, message: z.prettifyError(parseData.error) });
      }
      // Prevent duplicate review by same user for same accommodation
      const existing = await reviewRepository.getUserReviewForAccommodation(userId, parseData.data.accommodationId);
      if (existing) {
        return res.status(409).json({ success: false, message: "You have already reviewed this accommodation." });
      }
      const review = await reviewRepository.createReview({
        userId: new (require('mongoose')).Types.ObjectId(userId),
        accommodationId: new (require('mongoose')).Types.ObjectId(parseData.data.accommodationId),
        rating: parseData.data.rating,
        comment: parseData.data.comment,
      });
      // Update accommodation rating after review create
      await reviewRepository.updateAccommodationRating(review.accommodationId.toString());
      return res.status(201).json({ success: true, data: review });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get reviews for an accommodation or all reviews (with pagination and sorting)
  async getReviews(req: Request, res: Response) {
    try {
      const { accommodationId, page = 1, limit = 10, sort = "latest" } = req.query;
      let reviews;
      if (accommodationId) {
        reviews = await reviewRepository.getReviewsByAccommodation(String(accommodationId), {
          page: Number(page),
          limit: Number(limit),
          sort: String(sort)
        });
      } else {
        reviews = await reviewRepository.getAllReviews({
          page: Number(page),
          limit: Number(limit),
          sort: String(sort)
        });
      }
      return res.status(200).json({ success: true, data: reviews });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
