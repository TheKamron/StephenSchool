import { Router } from "express";
// Models
import Contact from "../models/Contact.js"
import Student from "../models/Student.js"
import Teacher from "../models/Teacher.js"
import Courses from "../models/Courses.js"
// Others
import bcrypt from "bcryptjs"
import generateJWTToken  from "../service/token.js";
const router = Router()

router.get('/',  async (req, res) => {
    const token = req.cookies
    if(token) {
        res.clearCookie('token')
    }

    const courses = await Courses.find()
    res.render('index', {
        layout: "",
        title: "StephenSchool - Step To The Gratness!",
        courses,
        contactSuccess: req.flash("contactSuccess")
    })
})

router.get('/students', async (req, res) => {
    const users = await Student.find()
    res.json(users)
})

router.get('/login', (req, res) => {
    res.render('login', {
        title: "Kirish | StephenSchool",
        loginError: req.flash('loginError'),
        loginSuccess: req.flash('loginSuccess')
    })
})

router.get('/logout', (req, res) => {
    res.clearCookie('token')
    res.redirect('/')
})

// POST

router.post('/contact', async (req, res) => {
    const {name, surName, phoneNumber} = req.body
    const data = await Contact.create(req.body)
    req.flash('contactSuccess', 'Arizangiz Muvaffaqiyatli Yuborildi!')                                     
    res.redirect('/')
})

router.post('/login', async (req, res) => {
    const { phoneNumber, password } = req.body;

    // Bo'sh qiymatlar uchun validatsiya
    if (!phoneNumber || !password) {
        req.flash('loginError', "Profilga kirish uchun barcha qatorlarni to'ldiring!");
        return res.redirect('/login'); // Login sahifasiga qaytadi
    }

    // Foydalanuvchini topish
    const student = await Student.findOne({ phoneNumber });
    const teacher = await Teacher.findOne({ phoneNumber });

    if (!student && !teacher) {
        req.flash('loginError', "Kiritilgan telefon raqami bo'yicha foydalanuvchi topilmadi!");
        return res.redirect('/login');
    }

    if (student) {
        const isStudentPasswordValid = await bcrypt.compare(password, student.password);
        if (!isStudentPasswordValid) {
            req.flash('loginError', "Parol noto'g'ri. Iltimos, qaytadan urinib ko'ring.");
            return res.redirect('/login');
        }

        if (student.role === "student") {
            const token = generateJWTToken(student._id);
            res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
            req.flash('loginSuccess', `Xush Kelibsiz, ${student.firstName}!`)
            return res.redirect(`/student-dashboard/${student._id}`);
        }
    }

    if (teacher) {
        const isTeacherPasswordValid = await bcrypt.compare(password, teacher.password);
        if (!isTeacherPasswordValid) {
            req.flash('loginError', "Parol noto'g'ri! Iltimos, qaytadan urinib ko'ring.");
            return res.redirect('/login');
        }

        if (teacher.role === "teacher") {
            const token = generateJWTToken(teacher._id);
            res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3 * 24 * 60 * 60 * 1000 });
            req.flash('loginSuccess', `Xush Kelibsiz, ${teacher.firstName}!`)
            return res.redirect(`/teacher-dashboard/${teacher._id}`);
        }
    }

    req.flash('loginError', "Kirishda xatolik yuz berdi! Iltimos, qaytadan urinib ko'ring.");
    return res.redirect('/login');
});



export default router;