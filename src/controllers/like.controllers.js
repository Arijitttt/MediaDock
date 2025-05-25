import { asyncHandler } from "../utils/asyncHadler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.models.js";
import { isValidObjectId } from "mongoose";

//common like handler
const toggleLike = asyncHandler(async (req, res) => {
    const {targetId,type} = req.params

    if(!isValidObjectId(targetId)){
        throw new ApiError(400,'Invalid ID')
    }

    const validTypes = ['video','comment','tweet']
    if(!validTypes.includes(type)){
        throw new ApiError(400,'Invalid type')
    }

    //check if already liked
    const existingLike = await Like.findOne({
        [type]:targetId,
        likedBy:req.user._id
    })

    if(existingLike){
        await existingLike.deleteOne()
        return res
        .status(200)
        .json(new ApiResponse(200,{},`Unliked ${type}`))
    }

    const likeData ={
        likedBy:req.user._id,
        [type]:targetId
    }

    await Like.create(likeData)

    return res
    .status(200)
    .json(new ApiResponse(200,{},`Liked ${type}`))
})

const getLikeCount = asyncHandler(async(req,res)=>{
    const {targetId,type} = req.params
    if(!isValidObjectId(targetId)){
        throw new ApiError(400,'Invalid ID')
    }
    const validTypes = ['video','comment','tweet']
    if(!validTypes.includes(type)){
        throw new ApiError(400,'Invalid type')
    }

    const likeCount = await Like.countDocuments({[type]:targetId})
    return res
    .status(200)
    .json(new ApiResponse(200,likeCount,'Like count fetched successfully'))
})

export {toggleLike,getLikeCount}