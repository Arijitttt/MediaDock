import express from "express";
import {
    createTweet,
    getAllTweets,
    getTweetsByUser,
    deleteTweet
} from "../controllers/tweet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// All routes below require authentication
router.use(verifyJWT);

// POST /api/tweets - Create a new tweet
router.post("/", createTweet);

// GET /api/tweets - Get all tweets
router.get("/", getAllTweets);

// GET /api/tweets/user/:userId - Get tweets by specific user
router.get("/user/:userId", getTweetsByUser);

// DELETE /api/tweets/:tweetId - Delete a tweet
router.delete("/:tweetId", deleteTweet);

export default router;
