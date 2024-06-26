import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User} from "../models/user.models.js"
import { ApiResponse } from "../utils/ApiResponce.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId)=>
    {
        try {
          const user = await User.findById(userId) 
          const accessToken = user.generateAccessToken()
          const refreshToken = user.generateRefreshToken()
    
          user.refreshToken = refreshToken;  //get refresh token from user
          await user.save({validateBeforeSave : false});    // .save , save to the db.validteBeforeSave dosen't check any validation
    
          return {accessToken,refreshToken};
    
        } catch (error) {
            throw new ApiError(500,"Something went wrong while generating refresh and access token");
        }
}

const refreshAccessToken = asyncHandler(async(req,res)=>
        {
            const incomingRefreshToken = req.cookies.
            refreshToken || req.body.refreshToken;
        
            if(!incomingRefreshToken)
            {
                throw new ApiError(401,"Invalid request ")
            }
        
            const decodedToken = jwt.verify
            (incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET);
        
            const user = await User.findById(decodedToken?._id);
        
            if(!user) 
            {
                throw new ApiError(401,"Invalid refresh token")
            }
        
            if(incomingRefreshToken !==user?.refreshToken)
            {
                throw new ApiError(401,"Refresh token is Expired")
            }
        
        
            const options =    
            {
                httpOnly : ture,
                secure : true
            };
            const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user._id);
        
            return res
            .status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",newRefreshToken,options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken},
                    " Access token refreshed "
                     
                )
            );
})

const registerUser = asyncHandler( async (req, res) => {
    const {username, email, age , password , city , zipCode } = req.body
    console.log("email: ", email);

    if (
        [ email, username, password , age , city , zipCode].some((field) => field?.trim() === "")
    ) 
    {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    // console.log(req.files);

    const user = await User.create({
        username: username.toLowerCase(),
        email, 
        password,
        age,
        city,
        zipCode,
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
}
);

const updateUserDetails = asyncHandler(async(req,
    res)=>{
        const {username,eamil ,age,city,zipCode } = req.body           // for update files , use a differnet method

        if(!(username || eamil || age || city || zipCode)){
           throw new ApiError(400,"All fields are required") 
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set:{
                    username,
                    eamil,
                    age,
                    city,
                    zipCode,
                }
            },
            {new : true}

        ).select("-password")

        return res
        .status(200)
        .json(new ApiResponse(200,user,
        "Account details updated sucessfully "))
});

const listAllUsers = asyncHandler( async ( req,res )=>{
    try {
        const users = await User.find();

        return res
        .status(200)
        .json(
            new ApiResponse(200,users,"All users data fetched sucessfully")
        )
    } catch (error) {
        throw new ApiError(404,"User data could not fetched")
    }
});

const getUserDetalis = asyncHandler( async ( req,res )=>{
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId)

        if (!user){
            throw new ApiError(404,"User not found")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(200,user,"User data got sucessfully")
        )
    } catch (error) {
        throw new ApiError(404," User details not found in this Id")
    }
});


const softDeleteUser = asyncHandler( async ( req,res )=>{
    const userId = req.params.userId;

    try {
        const user = await User.findByIdAndUpdate(userId,{ isActive:false }, { new:true });

        if(!user){
            throw new ApiError(403,"User not found")
        }

        return res
        .status(200)
        .json(new ApiResponse(200,user,
        "Account soft deleted sucessfully "))

    } catch (error) {
        throw new ApiError(400,"User soft delete did not sucessfully")
    }
});


export {
    refreshAccessToken,
    listAllUsers,
    getUserDetalis,
    registerUser,
    updateUserDetails,
    softDeleteUser,
}