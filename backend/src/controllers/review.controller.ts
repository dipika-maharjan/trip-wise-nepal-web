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
      const userId = (req.user as any)?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const { reviewId } = req.params;
      const parseData = UpdateReviewDTO.safeParse(req.body);
      if (!parseData.success) {
        return res.status(400).json({ success: false, message: z.prettifyError(parseData.error) });
      }
      const updated = await reviewRepository.updateReview(reviewId, userId, parseData.data);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Review not found or not authorized" });
      }
      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Delete a review
  async deleteReview(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?._id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const { reviewId } = req.params;
      const deleted = await reviewRepository.deleteReview(reviewId, userId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Review not found or not authorized" });
      }
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
      return res.status(201).json({ success: true, data: review });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get reviews for an accommodation
  async getReviews(req: Request, res: Response) {
    try {
      const { accommodationId } = req.query;
      if (!accommodationId) {
        return res.status(400).json({ success: false, message: "accommodationId is required" });
      }
      const reviews = await reviewRepository.getReviewsByAccommodation(String(accommodationId));
      return res.status(200).json({ success: true, data: reviews });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
