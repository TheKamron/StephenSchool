import {Schema, model} from "mongoose";

const StudentSchema = new Schema({
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
        default: null,
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    invitations: {
        type: Schema.Types.ObjectId,
        ref: "Group",
        default: null,
    },
    mockResults: [{
        listeningScore: {type: Number},
        readingScore: {type: Number},
        writingScore: {type: Number},
        speakingScore: {type: Number},
        overall: {type: Number},
        feedback: {type: String},
        date: {type: Date}
    }],
    status: {type: String},
    admin: {type: String, default: false}
}, {timestamps: true})

const Student = model('Student', StudentSchema)

export default Student;