import {Router} from "express";
import {authenticate} from "../middlewares/auth";
import {
    addComment,
    getAllCommentsAdmin,
    getCommentsByBlog,
    toggleCommentStatus
} from "../controllers/comment.controller";
import {requireRole} from "../middlewares/role";
import {Role} from "../models/user.model";

const commentRouter = Router();

commentRouter.post("/add", authenticate, addComment);

commentRouter.get("/:blogId", getCommentsByBlog);

commentRouter.get("/admin/all", authenticate, requireRole([Role.ADMIN]), getAllCommentsAdmin);

commentRouter.patch("/admin/status/:id", authenticate, requireRole([Role.ADMIN]), toggleCommentStatus);


export default commentRouter;