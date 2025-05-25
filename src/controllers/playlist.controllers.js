import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";
import { asyncHandler } from "../utils/asyncHadler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {isValidObjectId} from "mongoose";

//create new playlist
const createPlaylist = asyncHandler(async(req,res)=>{
    const {name,description} = req.body

    if(!name || !description){
        throw new ApiError(400,'All fields are required')
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user._id
    })

    return res
    .status(201)
    .json(new ApiResponse(201,playlist,'Playlist created successfully'))
})


//get all playlist of a user
const getUserPlaylists = asyncHandler(async(req,res)=>{
    const playlists = await Playlist.find({
        owner:req.user._id
    }).populate('videos')

    return res
    .status(200)
    .json(new ApiResponse(200,playlists,'Playlists fetched successfully'))
})

//get a specific playlist by ID
const getPlaylistById = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400,'Invalid playlist ID')
    }

    const playlist = await Playlist.findById(playlistId).populate('videos')
    if (!playlist) {
        throw new ApiError(404,'Playlist not found')
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,'Playlist fetched successfully'))
})

//add video to playlist
const addVideoToPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    const {videoId} = req.body

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,'Invalid playlist ID')
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,'Invalid video ID')
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404,'Playlist not found')
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,'You are not authorized to update this playlist')
    }

    
    
    if(!playlist.videos.includes(videoId)){
        playlist.videos.push(videoId)
        await playlist.save()
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,'Video added to playlist successfully'))

})

//remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    const {videoId} = req.body

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,'Invalid playlist ID')
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,'Invalid video ID')
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,'Playlist not found')
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,'You are not authorized to update this playlist')
    }

    playlist.videos = playlist.videos.filter(id=>id.toString() !== videoId.toString())
    await playlist.save()

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,'Video removed from playlist successfully'))
})

//delete playlist
const deletePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,'Invalid playlist ID')
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404,'Playlist not found')
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403,'You are not authorized to delete this playlist')
    }

    await playlist.deleteOne()

    return res
    .status(200)
    .json(new ApiResponse(200,{},'Playlist deleted successfully'))
})

export {createPlaylist,getUserPlaylists,getPlaylistById,addVideoToPlaylist,removeVideoFromPlaylist,deletePlaylist}