import dotenv from 'dotenv';
import { Request, Response, Router } from "express";
import TimeSchedule from "../models/TimeSchedule";
import User from "../models/User";
import jwt from "jsonwebtoken"
export const verifyUser = async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const authToken = authHeader && authHeader.split(" ").length === 2 && authHeader.split(" ")[1];

    if (!authToken) {
        res.status(401).json({ message: "Unauthorized" });
        return null;
    }

    try {
        const { email } = jwt.verify(authToken, process.env.SECRET_KEY || "secret_key") as { email: string };
        if (email) {
            const foundUser = await User.findOne({ email });
            if (foundUser) {
                return foundUser;
            }
        }
        res.status(403).json({ message: "Forbidden" });
        return null;
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Unauthorized" });
        return null;
    }
};

dotenv.config();
const time_schedule_controller = Router();

// Function to verify user
const verifyAdmin = async (req: Request, res: Response): Promise<boolean> => {
    const user = await verifyUser(req, res);
    if (user && user.role === 'ADMIN') {
        return true;
    }
    res.status(403).json({ message: "Forbidden" });
    return false;
};

// Get all time schedules
time_schedule_controller.get("/", async (req: Request, res: Response) => {
    const user = await verifyUser(req, res);
    if (!user) return;
    try {
        const time_schedules = await TimeSchedule.find({});
        res.json({time_schedules});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Create a new time schedule
time_schedule_controller.post("/", async (req: Request, res: Response) => {
    if (!(await verifyAdmin(req, res))) {
        res.status(401).json({ message: "Not authorized" })
    }else{
        try {
            const newTimeSchedule = new TimeSchedule(req.body);
            await newTimeSchedule.save();
            res.status(201).json({newTimeSchedule});
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    }

});

// Update a time schedule
time_schedule_controller.put("/:id", async (req: Request, res: Response) => {
    if (!(await verifyAdmin(req, res))){
        res.status(401).json({ message: "Not authorized" });
    }else{
        try {
            const updatedTimeSchedule = await TimeSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedTimeSchedule) {
                res.status(404).json({ message: "Time Schedule not found" });
            }else{
                res.json({updatedTimeSchedule});
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    }

});

// Delete a time schedule
time_schedule_controller.delete("/:id", async (req: Request, res: Response) => {
    if (!(await verifyAdmin(req, res))) {
        res.status(401).json({ message: "Not authorized" })
    }else{
        try {
            const deletedTimeSchedule = await TimeSchedule.findByIdAndDelete(req.params.id);
            if (!deletedTimeSchedule) {
                res.status(404).json({ message: "Time Schedule not found" });
            }else{
                res.json({ message: "Time Schedule deleted successfully" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    }

});

export default time_schedule_controller;
