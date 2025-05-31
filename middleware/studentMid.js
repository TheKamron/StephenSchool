import jwt from 'jsonwebtoken'
import Student from "../models/Student.js"

export default async function (req, res, next) {
    if(!req.cookies.token) {
        res.redirect('/')
        return
    }
    const token = req.cookies.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await Student.findById(decoded.userId)
    req.userId = user._id
    
   
    if(user.role !== 'student') {
        res.redirect('/')
        return
    }
    
    next()
}
