import { Router } from "express";
import { RoomTypeController } from "../controllers/roomType.controller";
import { authorizedMiddleware, adminOnlyMiddleware } from "../middleware/authorization.middleware";

const router = Router();
const roomTypeController = new RoomTypeController();

// Public routes
router.get("/", roomTypeController.getRoomTypes);
router.get("/:id", roomTypeController.getRoomTypeById);

// Admin routes
router.post("/", authorizedMiddleware, adminOnlyMiddleware, roomTypeController.createRoomType);
router.put("/:id", authorizedMiddleware, adminOnlyMiddleware, roomTypeController.updateRoomType);
router.delete("/:id", authorizedMiddleware, adminOnlyMiddleware, roomTypeController.deleteRoomType);

export default router;
