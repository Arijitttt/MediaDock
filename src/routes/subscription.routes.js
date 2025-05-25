import { Router } from "express";
import { subscribeToChannel,unsubscribeFromChannel,getChannelSubscribers,getSubscribedChannels,isSubscribed } from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()
router.use(verifyJWT)

router.route('/subscribe/:channelId').post(subscribeToChannel)
router.route('/unsubscribe/:channelId').post(unsubscribeFromChannel)
router.route('/subscribed-channels').get(getSubscribedChannels)
router.route('/channel-subscribers/:channelId').get(getChannelSubscribers)
router.route('/is-subscribed/:channelId').get(isSubscribed)

export default router