import { Router } from "express";
import { createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist }
     from "../controllers/playlist.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()
router.use(verifyJWT)

router.post("/", createPlaylist);
router.get("/", getUserPlaylists);
router.get("/:playlistId", getPlaylistById);
router.put("/:playlistId/add-video", addVideoToPlaylist);
router.put("/:playlistId/remove-video", removeVideoFromPlaylist);
router.delete("/:playlistId", deletePlaylist);

export default router