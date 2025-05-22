import { asyncHandler } from '../utils/asyncHadler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.models.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary,deleteFromCloudinary } from '../utils/cloudinary.js'

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

export { registerUser }
