import express from "express"
import { create } from "express-handlebars"
import mongoose from "mongoose"
import cookieParser from "cookie-parser"
import flash from "connect-flash"
import session from "express-session"
import * as dotenv from "dotenv"
import hbsHelper from "./utils/function.js"
dotenv.config()
import indexRoutes from "./routes/index.js"
import AdminRoutes from "./routes/admin.js"
import teacherRoutes from "./routes/teacher.js"
import studentRoutes from "./routes/student.js"
import varMiddle from "./middleware/var.js"

const app = express()
const hbs = create({defaultLayout: 'main', extname: 'hbs', helpers: hbsHelper,  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
} })
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs');
app.set('views', "./views")

app.use(session({secret: "appSecretKey", resave: false, saveUninitialized: false}))
app.use(flash())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static("assets"))
app.use(express.static("vendor"))
app.use((req, res, next) => {
    res.locals.loginSuccess = req.flash('loginSuccess')
    res.locals.createSuccess = req.flash('createSuccess')
    res.locals.editSuccess = req.flash('editSuccess')
    res.locals.adminLoginSuccess = req.flash('adminLoginSuccess')
    next()
})


app.use(varMiddle)
app.use(indexRoutes)
app.use(AdminRoutes)
app.use(teacherRoutes)
app.use(studentRoutes)

const startApp = async () => {
    try {
        mongoose.set('strictQuery', true)
        mongoose.connect(process.env.MONGO_URI_ADRESS)
        .then(() => console.log('MongoDB Connected'))
            
        const PORT = 5500 || process.env.PORT
        app.listen(PORT, () => console.log(`Server is running on Port: ${PORT}`))
    } catch (error) {
        console.log(error)
        console.error('Error:', error.message);
        console.error('Stack Trace:', error.stack);
    }
}

startApp()