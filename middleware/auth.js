import jwt from "jsonwebtoken"
import Student from "../models/Student.js"
import Teacher from "../models/Teacher.js"

export default async function (req, res, next) {
    const token = req.cookies.token
    if(token) {
        res.redirect('/') 
        return
    }

    
    next()
}


