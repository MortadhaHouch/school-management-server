import dotenv from 'dotenv';
import express, { Request, Response } from "express"
import User from "../models/User";
import File from "../models/File";
import jwt from "jsonwebtoken"
dotenv.config()
import Course from "../models/Course";
import { Types } from 'mongoose';
const courseController = express.Router();
courseController.get("/:p?",async(req:Request,res:Response)=>{
    try {
        const {p} = req.params
        if(p && !isNaN(parseInt(p))){
            const items = await Course.find().skip(Number(p)*10).limit(10);
            const searchTasks = await Promise.all(items);
            const courses = searchTasks.map(async(item,idx)=>{
                const instructor = await User.findById(item.instructor);
                const instructorAvatar = await File.findById(instructor?.avatar);
                return {
                    course:{
                        title:item.title,
                        description:item.description,
                        resources:item.resources.length
                    },
                    instructor:{
                        firstName:instructor?.firstName,
                        lastName:instructor?.lastName,
                        avatar:instructorAvatar?.path
                    },
                }
            })
            res.status(200).json({courses});
        }else{
            const items = await Course.find();
            const searchTasks = await Promise.all(items);
            const courses = searchTasks.map(async(item,idx)=>{
                const instructor = await User.findById(item.instructor);
                const instructorAvatar = await File.findById(instructor?.avatar);
                return {
                    course:{
                        title:item.title,
                        description:item.description,
                        resources:item.resources.length,
                        views:item.views
                    },
                    instructor:{
                        firstName:instructor?.firstName,
                        lastName:instructor?.lastName,
                        avatar:instructorAvatar?.path,
                        ratings:instructor?.role === "TEACHER" && instructor.ratings
                    },
                }
            })
            res.status(200).json({courses});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({server_error:"An error occurred while fetching courses"})
    }
})
courseController.get("/by-id/:id",async (req:Request,res:Response)=>{
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ").length ===2 && req.headers.authorization.split(" ")[1];
        if(authToken){
            const {email} = jwt.verify(authToken,process.env.SECRET_KEY||"secret_key") as {email:string,firstName:string,lastName:string};
            if(email){
                const foundUser = await User.findOne({email});
                if(foundUser){
                    const {id} = req.params;
                    const course = await Course.findById(id);
                    if(course){
                        res.status(200).json({course})
                    }else{
                        res.status(404).json({message:"Course not found"})
                    }
                }else{
                    res.status(401).json({message:"Unauthorized"})
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
})

courseController.post("/create",async (req:Request,res:Response)=>{
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ").length ===2 && req.headers.authorization.split(" ")[1];
        if(authToken){
            const {email} = jwt.verify(authToken,process.env.SECRET_KEY||"secret_key") as {email:string,firstName:string,lastName:string};
            if(email){
                const foundUser = await User.findOne({email});
                if(foundUser){
                    const {title,description,instructor} = req.body;
                    const newCourse = new Course({title,description,instructor});
                    await newCourse.save();
                    foundUser.courses.push(newCourse._id);
                    await foundUser.save();
                    res.status(201).json({message:"Course created successfully",course:newCourse})
                }else{
                    res.status(401).json({message:"Unauthorized"})
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
})
courseController.put("/add-ref",async(req:Request,res:Response)=>{
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ").length ===2 && req.headers.authorization.split(" ")[1];
        if(authToken){
            const {email} = jwt.verify(authToken,process.env.SECRET_KEY||"secret_key") as {email:string,firstName:string,lastName:string};
            const foundUser = await User.findOne({email});
            if(foundUser){
                const {courseId,resource} = req.body;
                const course = await Course.findById(courseId);
                if(course){
                    course.resources.push(resource);
                    await course.save();
                    res.status(200).json({message:"resource added successfully",course})
                }
            }else{
                res.status(401).json({message:"Unauthorized"})
            }
        }
    } catch (error) {
        console.log(error);
    }
})
courseController.put("/edit",async (req:Request,res:Response)=>{
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ").length ===2 && req.headers.authorization.split(" ")[1];
        if(authToken){
            const {email} = jwt.verify(authToken,process.env.SECRET_KEY||"secret_key") as {email:string,firstName:string,lastName:string};
            if(email){
                const foundUser = await User.findOne({email});
                if(foundUser){
                    const {id,title,description,instructor} = req.body;
                    const course = await Course.findByIdAndUpdate(id,{title,description,instructor});
                    if(course){
                        res.status(200).json({message:"Course updated successfully",course})
                    }else{
                        res.status(404).json({message:"Course not found"})
                    }
                }else{
                    res.status(401).json({message:"Unauthorized"})
                }
            }
        }else{
            res.status(401).json({message:"Unauthorized"})
        }
    } catch (error) {
        console.log(error);
    }
})
courseController.delete("/:id",async(req:Request,res:Response)=>{
    try {
        const authToken = req.headers.authorization && req.headers.authorization.split(" ").length ===2 && req.headers.authorization.split(" ")[1];
        if(authToken){
            const {email} = jwt.verify(authToken,process.env.SECRET_KEY||"secret_key") as {email:string,firstName:string,lastName:string};
            if(email){
                const foundUser = await User.findOne({email});
                if(foundUser){
                    const {id} = req.params;
                    const course = await Course.findById(id);
                    if(course){
                        foundUser.courses.splice(foundUser.courses.indexOf(new Types.ObjectId(id)),1);
                        await foundUser.save();
                        await Course.findByIdAndDelete(id);
                        res.status(200).json({message:"Course deleted successfully"})
                    }else{
                        res.status(404).json({message:"Course not found"})
                    }
                }else{
                    res.status(401).json({message:"Unauthorized"})
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
})
export default  courseController