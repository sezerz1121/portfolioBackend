import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv  from "dotenv";
dotenv.config();
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
    },
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        
    },
    saved: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    }],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }],
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
});


userSchema.pre("save",async function (next) 
{
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)
    next()
});

userSchema.methods.isPasswordCorrect = async function (password)
{
    return await bcrypt.compare(password, this.password);
}
userSchema.methods.generateAccessToken =  function()
{
    return jwt.sign
    (
        {
            _id: this._id,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn :process.env.ACCESS_TOKEN_EXPIRY

        }
    )
}
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};


export const User = mongoose.model("User",userSchema)