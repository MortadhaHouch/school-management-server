import jwt from 'jsonwebtoken';
import User from '../models/User';
import { Request, Response } from 'express';
const verifyUser = async (req: Request, res: Response) => {
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
export default verifyUser