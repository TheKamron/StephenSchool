import { Schema, model } from "mongoose";

const CourseSchema = new Schema ({
    subject: {type: String, required: true},
    level: {type: String, required: true},
    lessonTime: {type: String, required: true},
    lessonDay: {type: String, required: true},
    teacherName: {type: String, required: true},
    coursePrice: {type: String, required: true}
}, {timestamps: true})

const Courses = model("Courses", CourseSchema)
export default Courses;