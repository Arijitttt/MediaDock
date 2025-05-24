import { asyncHandler } from '../utils/asyncHadler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.models.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary,deleteFromCloudinary } from '../utils/cloudinary.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

// generate access and refresh token part
const generateAccessAndRefreshToken = async(userID) =>{
    try {
        const user = await User.findById( userID)
     // small check for user exists or not
     if(!user){
        throw new ApiError(404,'User not found')
     }

      const accessToken = user.generateAcessToken()
     const refreshToken =   user.generateRefreshToken()

     user.refreshToken = refreshToken
     await user.save({validateBeforeSave:false})
     return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500, 'Something went wrong while generating access and refresh tokens')
    }

}
//Ragistration Part
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body

  // ✅ Strong validation
  const requiredFields = { fullname, email, username, password }
  for (const [key, value] of Object.entries(requiredFields)) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new ApiError(400, `${key} is required and must be a non-empty string`)
    }
  }

  // ✅ Check for existing user
  const existed_user = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
  })

  if (existed_user) {
    throw new ApiError(409, 'User with email or username already exists')
  }

  // ✅ File upload checks
  console.log(req.files)

  const avatarLocalPath = req.files?.avatar?.[0]?.path
  const coverLocalPath = req.files?.coverImage?.[0]?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, 'avatar file is missing')
  }

  // ✅ Upload avatar
  let avatar
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log('Avatar uploaded to Cloudinary:', avatar)
  } catch (error) {
    console.error('Error uploading avatar:', error)
    throw new ApiError(500, 'Failed to upload avatar')
  }

  // ✅ Upload cover image (optional)
  let coverImage = { url: '' }
  if (coverLocalPath) {
    try {
      coverImage = await uploadOnCloudinary(coverLocalPath)
      console.log('Cover image uploaded to Cloudinary:', coverImage)
    } catch (error) {
      console.error('Error uploading cover image:', error)
      throw new ApiError(500, 'Failed to upload cover image')
    }
  }

  // ✅ Create user
  try {
    const user = await User.create({
    fullname: fullname.trim(),
    email: email.trim().toLowerCase(),
    username: username.trim().toLowerCase(),
    password,
    avatar: avatar?.url || '',
    coverImage: coverImage?.url || ''
  })

  // ⚠️ This deletes the user after creating it — likely a mistake.
  // You probably meant to **find** and **return** the created user.
  const createdUser = await User.findById(user._id).select('-password -refreshToken')

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong')
  }

  return res
    .status(201)
    .json(new ApiResponse(201, 'User created successfully', createdUser))  
  } catch (error) {
    console.log('Error creating user:', error);

    if(avatar){
        await deleteFromCloudinary(avatar.public_id)
    }
    
  }
  if(coverImage){
    await deleteFromCloudinary(coverImage.public_id)
  }

  throw new ApiError(500, 'Something went wrong while registering a user and immages were deleted')
  
  
})

//login part
const loginUser = asyncHandler(async(req,res)=>{
    //get data from body
    const {email,username,password} = req.body

    //validation
    if(!email || !username || !password){
        throw new ApiError(400,'All fields are required')
    }

    const existedUSer = await User.findOne({
        $or: [{username},{email}]
    })
    if (!existedUSer) {
        throw new ApiError(404,'User not found')   
    }

    //validate password
    const isPasswordCorrect = await existedUSer.isPasswordCorrect(password)
    if (!isPasswordCorrect){
        throw new ApiError(401,'Password is incorrect')
    } 

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(existedUSer._id)


    const loggedInUser = await User.findById(existedUSer._id).select('-password -refreshToken')
    if (!loggedInUser) {
        throw new ApiError(500, 'Something went wrong')
    }

    const options = {
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        
    }

    return res
    .status(200)
    .cookie('accessToken',accessToken,options)
    .cookie('refreshToken',refreshToken,options)
    .json(new ApiResponse(200,
        {user:loggedInUser,accessToken,refreshToken},
        'User logged in successfully'))
        
})

//logout
const logOutUser = asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    //TODO
    req.user._id,
    {
      $set: {refreshToken: undefined},
    },
    {new:true}
  )

  const options = {
    httpOnly:true,
    secure: process.env.NODE_ENV === 'production',
  }

  return res
  .status(200)
  .clearCookie('accessToken',options)
  .clearCookie('refreshToken',options)
  .json(new ApiResponse(200,{},'User logged out successfully'))
})

//refresh token
const refreshAccessToken = asyncHandler(async(req,res)=>{

  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){
    throw new ApiError(401,'Refresh token is missing')
  }
  try {
    const DECODED_TOKEN = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    )
    const user = await User.findById(DECODED_TOKEN?._id)
    if(!user){
      throw new ApiError(401,'Invalid refresh token')
    }

    if(incomingRefreshToken !== user.refreshToken){
      throw new ApiError(401,'Invalid refresh token')
    }

    const options = {
      httpOnly:true,
      secure: process.env.NODE_ENV === 'production',
    }
    const {accessToken,refreshToken:newRefreshToken} = await generateAccessAndRefreshToken(user._id)

    return res
    .status(200)
    .cookie('accessToken',accessToken,options)
    .cookie('refreshToken',newRefreshToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken,
        refreshToken:newRefreshToken},
        'Access token refreshed successfully'))
  } catch (error) {
    throw new ApiError(401,'Invalid refresh token')
  }
})



const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword} = req.body
  const user = await User.findById(req.user?._id)
  const isPasswordValid =  user.isPasswordCorrect(oldPassword)
  if(!isPasswordValid){
    throw new ApiError(401,'Old password is incorrect')
  }
  user.password = newPassword
  await user.save({validateBeforeSave:false})

  return res.status(200).json(new ApiResponse(200,{},'Password changed successfully'))
})
const getCurrentUser = asyncHandler(async(req,res)=>{
  return res.status(200).json(new ApiResponse(200,req.user,"Current user details"))
})
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, 'All fields are required');
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email
      }
    },
    { new: true }
  ).select('-password -refreshToken');

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Account details updated successfully'));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path; // FIXED

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is missing');
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(500, 'Failed to upload avatar');
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select('-password -refreshToken');

  return res.status(200).json(new ApiResponse(200, user, 'Avatar updated successfully'));
});

const updateUserCoverImage = asyncHandler(async(req,res)=>{
  const coverImageLocalPath =  req.file?.path

  if(!coverImageLocalPath){
    throw new ApiError(400,'Cover image file is missing')
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if(!coverImage.url){
    throw new ApiError(500,'Failed to upload cover image')
  }


  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
      }
    },
    {new:true}
  ).select('-password -refreshToken')

  return res.status(200).json(new ApiResponse(200,user,'Cover image updated successfully'))
})



//aggregation pipeline
const getUserChannelProfile = asyncHandler(async(req,res)=>{
  const {username} = req.params
  if(!username?.trim()){
    throw new ApiError(400,'Username is required')
  }

  const channel = await User.aggregate(
    [
      {
        $match:{
          username:username.toLowerCase()
        }
      },
      {
        $lookup:{
          from:'subscriptions',
          localField:'_id',
          foreignField:'channel',
          as:'subscribers'
        }
      },
      {
        $lookup:{
          from:'subscriptions',
          localField:'_id',
          foreignField:'subscriber',
          as:'subscribedTo'
        }
      },
      {
        $addFields:{
          subscribersCount:{$size:'$subscribers'},
          channelsSubscribedToCount:{$size:'$subscribedTo'},
          isSubscribed:{
            $cond:{
              if:{$in: [req.user?._id,'$subscribers.subscriber']},
              then:true,
              else:false
            }
          }
        }
      },
      {
        //Project only the necessary data
        $project:{
          fullname:1,
          username:1,
          avatar:1,
          subscribersCount:1,
          channelsSubscribedToCount:1,
          isSubscribed:1,
          coverImage:1,
          email:1
        }
      }
    ]
  )
  if(!channel?.length){
    throw new ApiError(404,'Channel not found')
  }

  return res.status(200).json(new ApiResponse(200,channel[0],'Channel profile'))

})




const getWatchHistory = asyncHandler(async(req,res)=>{
  const user = await User.aggregate(
    [
      {
        $match:{_id:new mongoose.Types.ObjectId(req.user?._id)}
      },
      {
        $lookup:{
          from:'videos',
          localField:'watchHistory',
          foreignField:'_id',
          as:'watchhistory',
          pipeline:[
            {
              $lookup:{
                from:"users",
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
                owner:{
                  $first:'$owner'
                }
              }
            }
          ]
        }
      }
    ]
  )
  return res.status(200).json(new ApiResponse(200,user[0]?.watchHistory,'Watch history fetched successfully'))
})






export { registerUser,loginUser,refreshAccessToken,logOutUser,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory }
