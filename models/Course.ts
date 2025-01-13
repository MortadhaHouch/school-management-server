import {Schema,model} from "mongoose"

const courseSchema = new Schema({
    title: {
        type: String, required: true
    },
    description: {
        type: String, required: true
    },
    instructor: {
        type: Schema.Types.ObjectId, required: true
    },
    students: {
        type: [Schema.Types.ObjectId]
    },
    assignments: {
        type: [Schema.Types.ObjectId], required:true
    },
    resources:{
        type: [String]
    },
    views:{
        type: Number,
        default: 0
    }
},{
    timestamps:true
})
const courseModel = model("course",courseSchema)
export default courseModel