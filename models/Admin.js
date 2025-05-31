import { Schema, model} from "mongoose";

const AdminSchema = new Schema({
    userName: {type: String, required: true},
    phoneNumber: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    gender: {type: String},
    avatar: {type: String},
    status: {type: String}
}, {timestamps: true})

const Admin = model('Admin', AdminSchema)

export default Admin;

