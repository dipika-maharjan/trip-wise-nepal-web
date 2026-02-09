import { Router } from "express";
import { AccommodationController } from "../controllers/accommodation.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middleware/authorization.middleware";

const accommodationController = new AccommodationController();
const router = Router();

// Public routes
router.get("/active", accommodationController.getActiveAccommodations);
router.get("/search", accommodationController.searchAccommodations);
router.get("/price-range", accommodationController.getAccommodationsByPrice);
router.get("/:id", accommodationController.getAccommodationById);
router.get("/", accommodationController.getAllAccommodations);

// Admin routes (protected with authorization middleware)
router.post("/", authorizedMiddleware, adminOnlyMiddleware, accommodationController.createAccommodation);
router.put("/:id", authorizedMiddleware, adminOnlyMiddleware, accommodationController.updateAccommodation);
router.delete("/:id", authorizedMiddleware, adminOnlyMiddleware, accommodationController.deleteAccommodation);

export default router;
