import { Schema, model, Document } from 'mongoose';

interface IRoom extends Document {
    name: string;
    capacity: number;
    status: boolean;
    course: Schema.Types.ObjectId;
}

const RoomSchema: Schema = new Schema({
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    status: { type: Boolean, required: true },
    course: { type: Schema.Types.ObjectId, required: false }
});

const Room = model<IRoom>('Room', RoomSchema);

export default Room;