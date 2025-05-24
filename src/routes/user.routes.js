import { Router } from "express"; 

import { 
    registerUser,
    logOutUser,
    loginUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getWatchHistory
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router()

//unsecured routes
// /api/v1/healthcheck/test
router.route('/register').post(
    upload.fields([
        {
            name:'avatar',
            maxCount:1
        },{
            name:'coverImage',
            maxCount:1
        }
    ]),
    registerUser)

    router.route('/login').post(loginUser)
    router.route('/refresh-token').post(refreshAccessToken)

//secured routes
router.route('/logout').post(verifyJWT,logOutUser)
router.route('/change-password').post(verifyJWT,changeCurrentPassword)
router.route('/current-user').get(verifyJWT,getCurrentUser)
router.route('/channel/:username').get(verifyJWT,getUserChannelProfile) 
router.route('/update-account-details').patch(verifyJWT,updateAccountDetails)
router.route('/update-avatar').patch(verifyJWT,upload.single('avatar'),updateUserAvatar)
router.route('/update-cover-image').patch(
  verifyJWT,
  upload.single('coverImage'),  // <- expects 'coverImage'
  updateUserCoverImage
);
router.route('/watch-history').get(verifyJWT,getWatchHistory)
export default router