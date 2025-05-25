import { asyncHandler } from "../utils/asyncHadler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.models.js"; 
import mongoose,{isValidObjectId} from "mongoose";
import { User } from "../models/user.models.js";

//subscribe to a channel
const subscribeToChannel = asyncHandler(async(req,res)=>{
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,'Invalid channel ID')
    }

    if(channelId === req.user._id.toString()){
        throw new ApiError(400,'You cannot subscribe to yourself')
    }

    const channnel = await User.findById(channelId)
    if (!channnel) {
        throw new ApiError(404,'Channel not found')
    }


    const alreadySubscribed = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })
    if (alreadySubscribed) {
        throw new ApiError(400,'You are already subscribed to this channel')
    }

    await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    })

    return res
    .status(200)
    .json(new ApiResponse(200,{},'Subscribed to channel successfully'))
})

//unsubscribe from a channel
const unsubscribeFromChannel = asyncHandler(async(req,res)=>{
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,'Invalid channel ID')
    }

    const subscription = await Subscription.findOneAndDelete({
        subscriber: req.user._id,
        channel: channelId
    })
    if (!subscription) {
        throw new ApiError(400,'You are not subscribed to this channel')
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{},'Unsubscribed from channel successfully'))
})

//get the list of subscription(channels a user subscribed to)
const getSubscribedChannels = asyncHandler(async(req,res)=>{
    const subscriptions = await Subscription.find({
        subscriber:req.user._id
    }).populate('channel','username fullname avatar')

    return res
    .status(200)
    .json(new ApiResponse(200,subscriptions,'Subscribed channels fetched successfully'))
})

//get list of subscribers for a channel
const getChannelSubscribers = asyncHandler(async(req,res)=>{
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,'Invalid channel ID')
    }

    const subscribers = await Subscription.find({
        channel: channelId
    }).populate('subscriber','username fullname avatar')

    return res
    .status(200)
    .json(new ApiResponse(200,subscribers,'Subscribers fetched successfully'))
})

//check if current user is subscribed to a channel
const isSubscribed = asyncHandler(async(req,res)=>{
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,'Invalid channel ID')
    }
    const subscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    return res
    .status(200)
    .json(new ApiResponse(200,subscription,'Subscription status fetched successfully'))
})


export {subscribeToChannel,unsubscribeFromChannel,getSubscribedChannels,getChannelSubscribers,isSubscribed}