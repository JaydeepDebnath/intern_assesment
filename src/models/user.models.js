import mongoose, { Schema } from "mongoose" ;
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new Schema({
   username : {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true, 
    index: true
   } ,
   email : {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true, 
   },
   age : {
    type : Number,
    required : true,
   },
   city : {
    type : String,
    required : true,
   },
   zipCode : {
    type : Number,
    required : true,
   },
   isActive : {
    type : Boolean,
    default : true
    },
   refreshToken: {
    type: String
    },
    password: {
    type: String,
    required: [true, 'Password is required']
    },

},{
    timestamps:true
}
)


// hooks 

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})


userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            password : this.password,
            age : this.age,
            city : this.city,
            zipCode : this.zipCode,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User",userSchema)