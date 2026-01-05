import {Router} from "express";
import {generateContent} from "../controllers/ai.controller";
import {authenticate} from "../middlewares/auth";
import {requireRole} from "../middlewares/role";
import {Role} from "../models/user.model";

const router = Router();

router.post("/generate", authenticate, requireRole([Role.ADMIN, Role.AUTHOR]), generateContent)


export default router;