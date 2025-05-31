import jwt from 'jsonwebtoken'
import Admin from "../models/Admin.js"

export default async function (req, res, next) {
    if(!req.cookies.token) {
        res.redirect('/')
        return
    }
    const token = req.cookies.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await Admin.findById(decoded.userId)
    req.userId = user._id
    
    
    next()
}
