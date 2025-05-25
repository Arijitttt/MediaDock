import { Router } from "express";
import { addComment,getCommentsByVideo,deleteComment,editComment } from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

router.use(verifyJWT)

router.route('/').post(addComment)
router.route('/:videoId').get(getCommentsByVideo)
router.route('/:commentId').delete(deleteComment)
router.route('/:commentId').put(editComment)

export default router