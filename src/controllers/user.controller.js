import { asyncHandler } from "../utils/asyncHandler.js";
import{ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async(req,res)=>{
    //get user details from frontend
    //validation
    //check if user alredy exits
    //check for images, check for avatar
    //upload them to cloudinary 
    //create user object -- create entry in db
//remove pwd and refresh token from response
//check for user creation
//return 

const {body}=req;

    const  {fullName,email,username,password} = body;
    if([fullName,email,username,password].some((field)=>
        field?.trim()==="")){
throw new ApiError(400,"All Fields are Required")
    }

const existUser=User.findOne({
    $or:[{username},{email}]
})

if(existUser){
throw new ApiError(409,"User Already Existed with email or username")
}

const avatarLocalPath = req.files?.avatar[0]?.path ;//yha mene pehle upload keri h files now usne hume uska local path diya hain console ker ke aur read keriye

const coverImageLocalPath = req.files?.coverImage[0].path;

if(!avatarLocalPath){
throw new ApiError(400,"Avatar file is required")
}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
    throw new ApiError(400,"Avatar file is required")
}

const user = await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
});

//ye select method by default sare field select ker ke rkhta hain jo apko nhi chhaiye - sign lga ker field ka naam de do
const createdUser =await User.findById(user._id).select(
    "-password -refreshToken"
)

if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering user")
}

return res.status(201).json(
    new ApiResponse(200,createdUser,"User Registered Succesfully ")
)
      
})

export {registerUser}