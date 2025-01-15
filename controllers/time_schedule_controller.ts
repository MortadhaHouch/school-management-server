import dotenv from 'dotenv';
import { Request, Response, Router } from "express";
import TimeSchedule from "../models/TimeSchedule";
import User from "../models/User";
import jwt from "jsonwebtoken"
dotenv.config();
const time_schedule_controller = Router();

// Get all time schedules
time_schedule_controller.get("/", async (req: Request, res: Response) => {
    try {
        const authHeader = req.cookies["auth-token"]
        if(authHeader){
            const {email} = jwt.verify(authHeader, process.env.SECRET_KEY||"secret_key") as {email:string};
            if(email){
                const user = await User.findOne({email});
                if(user){
                    const schedules = await TimeSchedule.find({})
                    res.status(200).json({schedules})
                }else{
                    res.status(401).json({message:"unauthorized"})
                }
            }
        }else{
            res.status(401).json({message:"unauthorized"})
        }
    } catch (error) {
        console.error(error);
    }
});

// Create a new time schedule
time_schedule_controller.post("/", async (req: Request, res: Response) => {
    try {
        const authHeader = req.cookies["auth-token"]
        if(authHeader){
            const {email} = jwt.verify(authHeader, process.env.SECRET_KEY||"secret_key") as {email:string};
            if(email){
                const user = await User.findOne({email});
                if(user){
                    const newTimeSchedule = new TimeSchedule(req.body);
                    await newTimeSchedule.save();
                    res.status(201).json({newTimeSchedule});
                }else{
                    res.status(401).json({message:"unauthorized"})
                }
            }
        }
    } catch (error) {
        console.error(error);
    }

});

// Update a time schedule
time_schedule_controller.put("/:id", async (req: Request, res: Response) => {
    try {
        const authHeader = req.cookies["auth-token"]
        if(authHeader){
            const {email} = jwt.verify(authHeader, process.env.SECRET_KEY||"secret_key") as {email:string};
            if(email){
                const user = await User.findOne({email});
                if(user){
                    const foundObj = await TimeSchedule.findById(req.params.id);
                    if(foundObj){
                        foundObj.set({...foundObj,...req.body});
                        await foundObj.save();
                        res.json({schedule:foundObj})
                    }else{
                        res.status(404).json({error:"not found"});
                    }
                }else{
                    res.status(401).json({message:"unauthorized"})
                }
            }
        }
    } catch (error) {
        console.error(error);
    }

});

// Delete a time schedule
time_schedule_controller.delete("/:id", async (req: Request, res: Response) => {
    try {
        const authHeader = req.cookies["auth-token"]
        if(authHeader){
            const {email} = jwt.verify(authHeader, process.env.SECRET_KEY||"secret_key") as {email:string};
            if(email){
                const user = await User.findOne({email});
                if(user && user.role === "ADMIN"){
                    const foundObj = await TimeSchedule.findByIdAndDelete(req.params.id);
                    if(foundObj){
                        res.json({message:"schedule deleted"});
                    }else{
                        res.status(404).json({error:"not found"});
                    }
                }else{
                    res.status(401).json({message:"unauthorized"})
                }
            }
        }
    } catch (error) {
        console.error(error);
    }

});
time_schedule_controller.get("/count", async (req: Request, res: Response) => {
    try {
        const authHeader = req.cookies["auth-token"]
        if(authHeader){
            const {email} = jwt.verify(authHeader, process.env.SECRET_KEY||"secret_key") as {email:string};
            if(email){
                const user = await User.findOne({email});
                if(user){
                    const count = await TimeSchedule.countDocuments({});
                    res.json({count});
                }else{
                    res.status(401).json({message:"unauthorized"})
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
});
export default time_schedule_controller;
