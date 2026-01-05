import {Router} from 'express';
import {
    forgotPassword, getAllUsers,
    getUserProfile,
    loginUser,
    refreshToken,
    registerUser,
    resetPassword, toggleUserStatus,
    verifyOTP
} from "../controllers/auth.controller";
import {upload} from "../middlewares/upload";
import {authenticate} from "../middlewares/auth";
import {requireRole} from "../middlewares/role";
import {Role} from "../models/user.model";
import {
    createAuthorRequest,
    getAllRequests,
    getMyAuthorRequest,
    updateRequestStatus
} from "../controllers/author.request.controller";

const authRouter = Router();

authRouter.post("/register",upload.single("image"), registerUser)

authRouter.post("/login", loginUser)

authRouter.get("/me", authenticate, requireRole([Role.AUTHOR, Role.ADMIN, Role.USER]), getUserProfile)

authRouter.post("/forgot-password", forgotPassword)

authRouter.post("/verify-otp", verifyOTP)

authRouter.put('/reset-password', resetPassword);

authRouter.post("/refresh-token", refreshToken)

authRouter.get("/users/all", authenticate, requireRole([Role.ADMIN]), getAllUsers)

authRouter.patch("/users/status/:id",authenticate, requireRole([Role.ADMIN]), toggleUserStatus);

authRouter.post("/request-author",authenticate, upload.single("document"), createAuthorRequest)

authRouter.get("/become-author/status", authenticate, getMyAuthorRequest);

authRouter.get("/author-requests/all", authenticate, requireRole([Role.ADMIN]), getAllRequests);

authRouter.patch("/author-requests/status/:id", authenticate, requireRole([Role.ADMIN]), updateRequestStatus);

export default authRouter;