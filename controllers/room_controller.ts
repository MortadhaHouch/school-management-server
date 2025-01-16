import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Room from '../models/Room';
import User from '../models/User';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
const roomController = express.Router();
roomController.get('/', async (req: Request, res: Response) => {
    try {
        const authHeader = req.cookies["auth-token"]
        if(authHeader){
            const {email} = jwt.verify(authHeader, process.env.SECRET_KEY||"secret_key") as {email:string};
            const user = await User.findOne({email});
            if(user){
                let rooms = await Room.find()
                let data = []
                for await (const element of rooms) {
                    data.push({
                        name:element.name,
                        capacity:element.capacity,
                        status:element.status,
                        course:element.course,
                        id:element._id
                    })
                }
                res.json({rooms:data});
            }else{
                res.json({message:"unauthorized"});
            }
        }
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Create a new room
roomController.post('/', async (req: Request, res: Response) => {
    try {
        const authHeader = req.cookies["auth-token"]
        console.log(authHeader);
        if(authHeader){
            const {email} = jwt.verify(authHeader, process.env.SECRET_KEY||"secret_key") as {email:string};
            if(email){
                const {name,capacity,status} = req.body;
                const user = await User.findOne({email})
                if(user && user.role === "ADMIN"){
                    const newRoom = new Room({name,capacity,status});
                    await newRoom.save();
                    res.status(201).json({room:newRoom});
                }else{
                    res.status(401).json({ message:"Unauthorized"});
                }
            }else{
                res.status(401).json({ message:"Unauthorized"});
            }
        }else{
            res.status(401).json({ message:"Unauthorized"});
        }
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Update a room
roomController.put('/:id', async (req: Request, res: Response) => {
    try {
        const authHeader = req.cookies["auth-token"]
        if(authHeader){
            const {email} = jwt.verify(authHeader, process.env.SECRET_KEY||"secret_key") as {email:string};
            if(email){
                const user = await User.findOne({email})
                if(user && user.role === "ADMIN"){
                    const {name,capacity,status} = req.body
                    const updatedRoom = await Room.findByIdAndUpdate(new mongoose.Types.ObjectId(req.params.id), {name,capacity,status,});
                    if (!updatedRoom) {
                        res.status(404).json({ message: "Room not found" });
                    }else{
                        res.json({...updatedRoom,id:req.params.id});
                    }
                }else{
                    res.status(401).json({ message:"Unauthorized"});
                }
            }
        }
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Delete a room
roomController.delete('/:id', async (req: Request, res: Response) => {
    try {
        const authHeader = req.cookies["auth-token"]
        if(authHeader){
            const {email} = jwt.verify(authHeader, process.env.SECRET_KEY||"secret_key") as {email:string};
            if(email){
                const user = await User.findOne({email})
                if(user && user.role === "ADMIN"){
                    await Room.findByIdAndDelete(req.params.id);
                    res.json({ message: "Room deleted successfully" });
                }else{
                    res.status(401).json({ message:"Unauthorized"});
                }
            }
        }
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ message: "Server Error" });
    }

});

// Check room availability and add course
roomController.post('/:id/add-course', async (req: Request, res: Response) => {
    try {
        const authHeader = req.cookies["auth-token"]
        if(authHeader){
            const {email} = jwt.verify(authHeader, process.env.SECRET_KEY||"secret_key") as {email:string};
            if(email){
                const user = await User.findOne({email})
                if(user && user.role === "ADMIN"){
                    const room = await Room.findByIdAndUpdate(req.params.id, { $push: { courses: req.body.courseId }}, {new: true});
                    if (!room) {
                        res.status(404).json({ message: "Room not found" });
                    } else{
                        res.json(room);
                    }
                }else{
                    res.status(401).json({ message:"Unauthorized"});
                }
            }
        }
    } catch (error) {
        console.error('Error adding course to room:', error);
    }

});

export default roomController;