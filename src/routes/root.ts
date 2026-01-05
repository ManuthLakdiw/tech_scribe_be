import {Router} from 'express';
import authRouter from "./auth.router";
import blogRouter from "./blog.router";
import commentRouter from "./comment.router";
import aiRouter from "./ai.router";

const router = Router();

router.use("/auth", authRouter)
router.use("/blogs", blogRouter)
router.use("/comments", commentRouter)
router.use("/ai", aiRouter)

export default router;