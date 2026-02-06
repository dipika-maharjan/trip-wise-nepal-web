import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middleware/authorization.middleware";
import { uploads } from "../middleware/upload.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/user", uploads.single("image"), authController.createUserWithImage);

router.get('/profile', authorizedMiddleware, authController.getProfile);
router.put(
    '/update-profile', 
    authorizedMiddleware,   
    uploads.single('image'),   
    authController.updateProfile
);
router.put(
    '/:id',
    authorizedMiddleware,
    uploads.single('image'),
    authController.updateUserById
);

router.post("/request-password-reset", 
    authController.sendResetPasswordEmail);

router.post("/reset-password/:token", authController.resetPassword);

export default router;