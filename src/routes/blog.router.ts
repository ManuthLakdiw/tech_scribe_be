import {Router} from "express";
import {
    createBlog,
    deleteBlog, getAllBlogs, getAllPostsAdmin,
    getBlogBySlug, getBlogsByCategory, getCategoryCounts,
    getDraftBlogs,
    getPublishedBlogs, togglePostStatus,
    updateBlog
} from "../controllers/blog.controller";
import {authenticate} from "../middlewares/auth";
import {requireRole} from "../middlewares/role";
import {Role} from "../models/user.model";

const blogRouter = Router();

blogRouter.post("/create", authenticate, requireRole([Role.AUTHOR, Role.ADMIN]), createBlog)

blogRouter.get("/all", getAllBlogs);

blogRouter.put("/update/:id", authenticate, requireRole([Role.AUTHOR, Role.ADMIN]), updateBlog);

blogRouter.delete("/delete/:id", authenticate, requireRole([Role.ADMIN, Role.AUTHOR]), deleteBlog);

blogRouter.get("/published",authenticate, requireRole([Role.ADMIN, Role.AUTHOR]), getPublishedBlogs)

blogRouter.get("/drafts", authenticate,requireRole([Role.ADMIN, Role.AUTHOR]), getDraftBlogs);

blogRouter.get("/:slug", getBlogBySlug);

blogRouter.get("/admin/all", authenticate, requireRole([Role.ADMIN]), getAllPostsAdmin);

blogRouter.patch("/admin/status/:id", authenticate, requireRole([Role.ADMIN]), togglePostStatus);

blogRouter.get("/categories/counts", getCategoryCounts);

blogRouter.get("/category/:category", getBlogsByCategory);


export default blogRouter;