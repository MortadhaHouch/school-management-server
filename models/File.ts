import {model,Schema} from "mongoose"
const fileSchema = new Schema({
    path: {
        type: String, required: true
    },
})
const fileModel = model("file",fileSchema)

export default fileModel