import { Schema, model } from "mongoose";

const ContactSchema = new Schema({
    name: {type: String, required: true},
    surName: {type: String, required: true},
    phoneNumber: {type: String, required: true}
}, {timestamps: true})

const Contact = model('Request', ContactSchema)

export default Contact;


