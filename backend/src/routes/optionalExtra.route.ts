import { Router } from "express";
import { OptionalExtraController } from "../controllers/optionalExtra.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middleware/authorization.middleware";

const router = Router();
const optionalExtraController = new OptionalExtraController();

// Public routes
router.get("/", optionalExtraController.getOptionalExtras);
router.get("/:id", optionalExtraController.getOptionalExtraById);

// Admin routes
router.post("/", authorizedMiddleware, adminOnlyMiddleware, optionalExtraController.createOptionalExtra);
router.put("/:id", authorizedMiddleware, adminOnlyMiddleware, optionalExtraController.updateOptionalExtra);
router.delete("/:id", authorizedMiddleware, adminOnlyMiddleware, optionalExtraController.deleteOptionalExtra);

export default router;
