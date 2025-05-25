import { Router } from "express";
import { toggleLike,getLikeCount } from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()
router.use(verifyJWT)

router.route('/:type/:targetId').post(toggleLike)
router.route('/count/:type/:targetId').get(getLikeCount)


export default router