import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); //user ke ander refreshToken dala aur save ker diya lekin yad ho to save kerne per jo model ke ander jo save per humne validation lgaye hain ki pwd hona chhaiye aur  ye sab validation bhi chlengye but yha save per to hum ek he field de rhe h to koi issue na aaye uske liye hum validation save kerwane se pehle wale ko bnd ker dengye

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation
  //check if user alredy exits
  //check for images, check for avatar
  //upload them to cloudinary
  //create user object -- create entry in db
  //remove pwd and refresh token from response
  //check for user creation
  //return

  const { body } = req;

  const { fullName, email, username, password } = body;
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are Required");
  }

  const existUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existUser) {
    throw new ApiError(409, "User Already Existed with email or username");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path; //yha mene pehle upload keri h files now usne hume uska local path diya hain console ker ke aur read keriye

  // const coverImageLocalPath = req.files?.coverImage[0].path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.lenght > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  //ye select method by default sare field select ker ke rkhta hain jo apko nhi chhaiye - sign lga ker field ka naam de do
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Succesfully "));
});

const loginUser = asyncHandler(async (req, res) => {
  const { body } = req;
  const { email, username, password } = body;
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPwdValid = await user.isPasswordCorrect(password);

  if (!isPwdValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  //yha se pehle mere pass jo reference hain user ka usme refreshToken nhi hain yha niche generate ker ke mene dala hain user me

  const { accessToken, refreshToken } = await generateAccessAandRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true, // yeh mujhe updated wala return ker ke dega jisme refreshtoken undefined h nhi to purana wala bhi aa sakta hain jisme refreshtoken hain
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }
try {
  
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  
    const user = await User.findById(decodedToken?._id);
  
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
  
    if(incomingRefreshToken!==user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired or used");
  
    }
  
    const options={
      httpOnly:true,
      secure:true
    }
  
   const {accessToken,refreshToken:newRefreshToken}= await generateAccessAandRefreshTokens(user._id)
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newRefreshToken,options)
  .json(
    new ApiResponse(
      200,
      {accessToken,
        refreshToken:newRefreshToken},
        "Access Token Refreshed"
    )
  )
} catch (error) {
  throw new ApiError(401,error?.message || "Invalid refresh token")
}

});
export { registerUser, loginUser, logoutUser, refreshAccessToken };
