import { Router } from "express";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middleware/authorization.middleware";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { uploads } from "../../middleware/upload.middleware";
let adminUserController = new AdminUserController();

const router = Router();

router.use(authorizedMiddleware); 
router.use(adminOnlyMiddleware); 

router.post("/", uploads.single("image"), adminUserController.createUser);
router.get("/", adminUserController.getAllUsers);
router.put("/:id", uploads.single("image"), adminUserController.updateUser);
router.delete("/:id", adminUserController.deleteUser);
router.get("/:id", adminUserController.getUserById);

export const adminUserRoutes = router;