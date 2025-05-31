import {Schema, model} from "mongoose";

const TeacherSchema = new Schema({
    firstName: {type: String, required: true},
    surName: {type: String, required: true},
    phoneNumber: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String},
    gender: {type: String},
    avatar: {type: String},
    birthDate: {type: String, required: true},
    group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
    },  
    subject: {type: String, required: true},
    status: {type: String},
    admin: {type: String, default: false}
}, {timestamps: true})

const Teacher = model('Teacher', TeacherSchema)

export default Teacher;