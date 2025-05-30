import { Tweet } from "../models/tweet.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHadler.js";
import { isValidObjectId } from "mongoose";

//create new tweet
const createTweet = asyncHandler(async(req,res)=>{
    const {content} = req.body
    if (!content || content.trim() === "") {
        throw new ApiError(400, 'Tweet content is required');
    }

    const tweet = await Tweet.create({
        content,
        owner : req.user._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201,tweet,'Tweet created successfully'))
})


// Get tweets by user
const getTweetsByUser = asyncHandler(async(req,res)=>{
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400,'Invalid user ID')
    }
    const tweets = await Tweet.find({owner:userId}).populate('owner','username avatar')
    .sort({createdAt:-1})
    return res
    .status(200)
    .json(new ApiResponse(200,tweets,`User's tweets fetched successfully`))
})

//get all tweets
const getAllTweets = asyncHandler(async(req,res)=>{
    const tweets = await Tweet.find().populate('owner','username avatar').sort({createdAt:-1})

    return res
    .status(200)
    .json(new ApiResponse(200,tweets,'All tweets fetched successfully'))
})

//delete tweet
const deleteTweet  = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,'Invalid tweet ID')
    }
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,'Tweet not found')
    }

    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,'You are not authorized to delete this tweet')
    }

    await tweet.deleteOne()

    return res
    .status(200)
    .json(new ApiResponse(200,{},'Tweet deleted successfully'))
})


export {createTweet,getTweetsByUser,getAllTweets,deleteTweet}