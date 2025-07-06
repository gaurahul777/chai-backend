import {ApiError} from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js"

export const verifyJWT = asyncHandler(async(req, _,next)=>{
try {
    
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
    if(!token){
    throw new ApiError(401,"Unauthorized request")
    }
    
    const decodedToken= jwt.verify(token,process.env.ACCSS_TOKEN_SECRET) //jab apne token bnaya tha usme kuch chheje daali thi like id aur sari chheje 
    // aur han remember ki koi bhi aese data leke same bna sakta hain but secret key nhi ho to kuch bhi nhi ker payega
    
    const user =await User.findById(decodedToken?._id).select("-password -refreshToken")
    
    if(!user){
        throw new ApiError(401,"Invalid Access Token")
    }
    
    req.user=user;
    next();
} catch (error) {
    throw new ApiError(401,error?.message || "Invalid access token")
}

})