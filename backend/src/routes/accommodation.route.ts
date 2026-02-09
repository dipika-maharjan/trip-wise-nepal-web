import { Router } from "express";
import { AccommodationController } from "../controllers/accommodation.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middleware/authorization.middleware";
import { uploads } from "../middleware/upload.middleware";

const accommodationController = new AccommodationController();
const router = Router();

// Public routes
router.get("/active", accommodationController.getActiveAccommodations);
router.get("/search", accommodationController.searchAccommodations);
router.get("/price-range", accommodationController.getAccommodationsByPrice);
router.get("/:id", accommodationController.getAccommodationById);
router.get("/", accommodationController.getAllAccommodations);

// Admin routes (protected with authorization middleware)
router.post("/", authorizedMiddleware, adminOnlyMiddleware, uploads.array('images', 10), accommodationController.createAccommodation);
router.put("/:id", authorizedMiddleware, adminOnlyMiddleware, uploads.array('images', 10), accommodationController.updateAccommodation);
router.delete("/:id", authorizedMiddleware, adminOnlyMiddleware, accommodationController.deleteAccommodation);

export default router;
