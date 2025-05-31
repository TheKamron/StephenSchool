import jwt from 'jsonwebtoken'
import Teacher from "../models/Teacher.js"

export default async function (req, res, next) {
    if(!req.cookies.token) {
        res.redirect('/')
        return
    }
    const token = req.cookies.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await Teacher.findById(decoded.userId)
    console.log(user)
    
    req.userId = user._id

    if(user.role !== 'teacher') {
        res.redirect('/')
        return
    }
    
    next()
}
