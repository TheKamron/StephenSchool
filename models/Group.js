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
    homeworks: [{
        homeworkLesson: {type: String, required: true},
        tasks: {type: String, required: true},
        groupId: {type: String, required: true},
        postedAt: { type: Date, default: Date.now}
    }]
}, {timestamps: true})

const Group = model('Group', GroupSchema)
export default Group;