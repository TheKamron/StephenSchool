import { Schema, model } from "mongoose";

const GroupSchema = new Schema({
    groupName: {type: String, required: true},
    subject: {type: String, required: true},
    level: {type: String, required: true},
    lessonTime: {type: String, required: true},
    lessonDay: {type: String, required: true},
    status: {type: String, default: "active"},
    teacherId: {
        type: Schema.Types.ObjectId,
        ref: "Teacher", 
        required: true
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'Student'
    }],
    tasks: [{
        image: [{type: String, required: true}],
        studentId: {type: Schema.Types.ObjectId, required: true, ref: "Student"},
        firstName: {type: String},
        surName: {type: String},
        avatar: {type: String},
        status: {type: String},
        date: {type: Date}
    }]
}, {timestamps: true})

const Group = model('Group', GroupSchema)
export default Group;