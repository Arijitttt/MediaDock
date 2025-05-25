import { asyncHandler } from "../utils/asyncHadler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import mongoose,{isValidObjectId} from "mongoose";
import { getWatchHistory } from "./user.controllers.js";


const getAllVideos = asyncHandler(async(req,res)=>{
    const {page=1,limit = 10,query,sortBy,sortType,userID} = req.body

    const pipeline = []

    //match stage for search and filters
    const matchStage={isPublished:true}

    if(query){
        matchStage.$or = [
            {title:{$regex:query,$options:'i'}},
            {description:{$regex:query,$options:'i'}}
        ]
    }

    if(userID && isValidObjectId(userID)){
        matchStage.owner = new mongoose.Types.ObjectId(userID)
    }
    pipeline.push({
        $match:matchStage
    })

    //lookup owner details
    pipeline.push({
        $lookup:{
            from:'users',
            localField:'owner',
            foreignField:'_id',
            as:'owner',
            pipeline:[
                {
                    $project:{
                        fullname:1,
                        username:1,
                        avatar:1
                    }
                }
            ]
        }
    })
    pipeline.push({
        $addFields:{
            owner:{$first:'$owner'}
        }
    })

    //sort stage
    const sortCriteria = {}
    if(sortBy && sortType){
        sortCriteria[sortBy] = sortType === 'desc' ? -1 : 1
    }else{
        sortCriteria.createdAt = -1
    }
    pipeline.push({
        $sort:sortCriteria
    })

    const options = {
        page:parseInt(page),
        limit:parseInt(limit)
    }

    const videos = await Video.aggregatePaginate(Video.aggregate(pipeline),options)

    return res
    .status(200)
    .json(new ApiResponse(200,videos,'Videos fetched successfully'))

})


//get video by ID
const getVideoById = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,'Invalid video ID')
    }

    const video = await Video.aggregate([
        {
            $match:{_id:new mongoose.Types.ObjectId(videoId)}
        },
        {
            $lookup:{
                from:'users',
                localField:'owner',
                foreignField:'_id',
                as:'owner',
                pipeline:[
                    {
                        $project:{
                            fullname:1,
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner:{$first:'$owner'}
            }
        }
    ])

    if (!video?.length) {
        throw new ApiError(404,'Video not found')
    }

    //increment view count
    await Video.findByIdAndUpdate(videoId,{$inc:{views:1}})

    //add to user's history if user is logged in
    if(req.user){
        await User.findByIdAndUpdate(req.user._id,{$addToSet:{watchHistory:videoId}})
    }

    return res
    .status(200)
    .json(new ApiResponse(200,video[0],'Video fetched successfully'))
})


//publish a video
const publishAVideo = asyncHandler(async(req,res)=>{
    const {title,description} = req.body

    if (!title || !description){
        throw new ApiError(400,'All fields are required')
    }
    
    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if(!videoFileLocalPath || !thumbnailLocalPath){
        throw new ApiError(400,'Video file and thumbnail are required')
    }

    //upload video file to cloudinary
    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoFile.url || !thumbnail.url){
        throw new ApiError(500,'Failed to upload video file or thumbnail')
    }

    const video = await Video.create({
        title,
        description,
        duration:videoFile.duration,
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        owner:req.user._id,
        isPublished:false
    })

    const uploadedVideo = await Video.findById(video._id)

    if(!uploadedVideo){
        throw new ApiError(500,'something went wrong')
    }

    return res
    .status(200)
    .json(new ApiResponse(200,uploadedVideo,'Video published successfully'))
})

//update video details
const updateVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    const {title,description} = req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,'Invalid video ID')
    }
    if(!title || !description){
        throw new ApiError(400,'All fields are required')
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,'Video not found')
    }

    if(video?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,'You are not authorized to update this video')
    }

    //handle thubnail update if provided
    const thumbnailLocalPath = req.files?.path
    let thumbnail
    if(thumbnailLocalPath){
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if(!thumbnail.url){
            throw new ApiError(500,'Failed to upload thumbnail')
        }
    }

    const updateVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{title,description,thumbnail:thumbnail?.url || video?.thumbnail}
        },
        {new:true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200,updateVideo,'Video details updated successfully'))
})

//delete video
const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,'Invalid video ID')
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,'Video not found')
    }

    if(video?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,'You are not authorized to delete this video')
    }

    await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(new ApiResponse(200,{},'Video deleted successfully'))
})


//toggle publish video
const togglePublishVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,'Invalid video ID')
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,'Video not found')
    }

    if(video?.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403,'You are not authorized to publish this video')
    }

    const toggledVideoPublish = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{isPublished:!video?.isPublished}
        },
        {new:true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200,toggledVideoPublish,'Video published successfully'))
})

export {getAllVideos,publishAVideo,getVideoById,updateVideo,deleteVideo,togglePublishVideo}