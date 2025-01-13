import { Schema, model } from 'mongoose';


const assignmentSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    courseId: { type: String, required: true },
    status:{
        type: String,
        enum: ['PENDING', 'COMPLETED', 'IN_PROGRESS'],
        default: 'PENDING'
    }
},{
    timestamps:true
});

const Assignment = model('Assignment', assignmentSchema);

export default Assignment;