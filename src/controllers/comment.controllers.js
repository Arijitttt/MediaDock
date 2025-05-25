import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHadler.js";
import { isValidObjectId } from "mongoose";

//post a new comment
const addComment = asyncHandler(async(req,res)=>{
    const {content,videoId} = req.body

    if(!content || !videoId){
        throw new ApiError(400,'All fields are required')
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,'Invalid video ID')
    }

    const comment = await Comment.create({
        content,
        video : videoId,
        owner : req.user._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201,comment,'Comment added successfully'))
})

//get all comments for a video
const getCommentsByVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video ID');
    }

    const comments = await Comment.find({ video: videoId })
        .sort({ createdAt: -1 })
        .populate('owner', 'username email');

    return res
        .status(200)
        .json(new ApiResponse(200, comments, 'Comments fetched successfully'));
});

//Delete a comment
const deleteComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,'Invalid comment ID')
    }

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,'Comment not found')
    }

    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,'You are not authorized to delete this comment')
    }

    await comment.deleteOne()

    return res
    .status(200)
    .json(new ApiResponse(200,{},'Comment deleted successfully'))
})

//edit comment
const editComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    const {content} = req.body

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,'Invalid comment ID')
    }

    if (!content || content.trim() === '') {
        throw new ApiError(400, 'Comment content is required');
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, 'You are not authorized to edit this comment');
    }

    comment.content = content;
    await comment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, comment, 'Comment updated successfully'));
})

export {addComment,getCommentsByVideo,deleteComment,editComment}