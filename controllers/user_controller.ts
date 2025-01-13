import dotenv from 'dotenv';
import express, { Request, Response } from "express"
import User from "../models/User";
import File from "../models/File";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
dotenv.config()
const userController = express.Router();
userController.post("/login",async (req,res)=>{
    // validate the request body
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(user){
            const isMatch = await bcrypt.compare(password, user.password)
            if(isMatch){
                const userAvatar = await File.findById(user.avatar)
                const token = jwt.sign({
                    id:user._id,
                    email:user.email,
                    firstName:user.firstName,
                    lastName:user.lastName,
                    avatar:userAvatar?userAvatar.path:"",
                    isLoggedIn:true,
                    isVerified:true
                },process.env.SECRET_KEY||"secret_key",{
                    expiresIn:60*60*24*7
                })
                user.isLoggedIn = true
                await user.save();
                res.json({token})
            }else{
                res.status(400).json({password_error:"Invalid password"})
            }
        }else{
            res.status(404).json({email_error:"User not found"})
        }
    } catch (error) {
        console.log(error);
    }
})
userController.post("/register",async(req:Request,res:Response)=>{
    try {
        const {email, password, firstName, lastName,path} = req.body
        console.log(firstName,lastName,email,password);
        const foundUser = await User.findOne({email});
        if(!foundUser){
            const avatar = await File.create({path});
            const user = new User({email,password,firstName,lastName,avatar:avatar._id})
            const token = jwt.sign({
                id:user._id,
                email:user.email,
                firstName:user.firstName,
                lastName:user.lastName,
                isVerified:true,
                avatar:avatar.path
            },process.env.SECRET_KEY||"secret_key",{
                expiresIn:60*60*24*7
            })
            user.isLoggedIn = true;
            await user.save()
            res.status(201).json({token})
        }else{
            res.status(404).json({email_error:"user with this email already exists"})
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({server_error:"An error occurred while registering the user"})
    }
})
userController.post("/logout",async(req:Request,res:Response)=>{
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ").length ===2 && req.headers.authorization.split(" ")[1];
        if(authToken){
            const credentials = jwt.verify(authToken,process.env.SECRET_KEY||"secret_key");
            if(typeof credentials === "object"){
                const {email} = credentials;
                const foundUser = await User.findOne({email});
                if(foundUser){
                    foundUser.isLoggedIn = false;
                    await foundUser.save();
                    res.json({message:"User logged out successfully"})
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
})
export default userController