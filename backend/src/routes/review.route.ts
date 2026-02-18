import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authorizedMiddleware } from "../middleware/authorization.middleware";

const router = Router();
const reviewController = new ReviewController();


// Create a review
router.post("/", authorizedMiddleware, reviewController.createReview);
// Get reviews for an accommodation
router.get("/", reviewController.getReviews);
// Update a review
router.put("/:reviewId", authorizedMiddleware, reviewController.updateReview);
// Delete a review
router.delete("/:reviewId", authorizedMiddleware, reviewController.deleteReview);

export default router;
