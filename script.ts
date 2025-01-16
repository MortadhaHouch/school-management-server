import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import userController from './controllers/user_controller';
import courseController from './controllers/course_controller';
import time_schedule_controller from './controllers/time_schedule_controller';
import roomController from './controllers/room_controller';
import connectToDB from './db/db';

dotenv.config();
const app = express();
const { PORT } = process.env;

connectToDB();

app.use(cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: "http://localhost:4200",//allow requests from origin http://localhost:4200
    credentials: true // Allow credentials to be sent
}));

app.use(helmet());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser(process.env.SECRET_KEY || "secret_key"));

app.use("/user", userController);
app.use("/course", courseController);
app.use("/schedule", time_schedule_controller);
app.use("/room", roomController);

app.listen(PORT || 5000, () => console.log("Server listening on port " + PORT));