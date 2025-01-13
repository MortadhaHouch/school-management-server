import bcrypt from "bcrypt"
import {Schema,model} from "mongoose"
const userSchema =  new Schema({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    courses:{
        type:[Schema.Types.ObjectId]
    },
    time_schedules:{
        type:[Schema.Types.ObjectId]
    },
    isLoggedIn:{
        type:Boolean,
        default:false
    },
    role:{
        type:String,
        enum:["STUDENT","TEACHER","ADMIN"],
        default:"STUDENT"
    },
    avatar:{
        type:Schema.Types.ObjectId,
        required:true
    },
    savedCourses:{
        type: [Schema.Types.ObjectId]
    },
    likedCourses:{
        type: [Schema.Types.ObjectId]
    },
    ratings:{
        required:false,
        default:0,
        type:Number
    }
},{
    timestamps:true
})

userSchema.pre("save",async function(next){
    try{
        if(this.isNew || this.isModified("password")){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(this.password,salt);
            this.password = hashedPassword;
        }
        next();
    }catch(e){
        console.log(e);
    }
})
const userModel = model("user",userSchema)


export default userModel