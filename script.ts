import express from "express"
import cors from "cors"
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import helmet from "helmet"
import dotenv from "dotenv"
import userController from "./controllers/user_controller"
import connectToDB from "./db/db"
import courseController from "./controllers/course_controller"
dotenv.config()
const app = express()
const {PORT} = process.env;
connectToDB()
app.use(cors({
    methods:["GET","POST","PUT","DELETE"],
    origin:"http://localhost:4200"
}))
app.use(bodyParser.json())

app.use(helmet())
app.use(express.json({limit:Infinity}));
app.use(bodyParser.urlencoded({ extended: true}))
app.use(bodyParser.json({limit:Infinity}));
app.use(cookieParser())
app.use("/user",userController)
app.use("/course",courseController);
app.listen(PORT||5000,()=>console.log("server listening on port " + PORT))