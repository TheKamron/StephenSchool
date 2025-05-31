import { Router } from "express";
import teacherMid from "../middleware/teacherMid.js"
import Teacher from "../models/Teacher.js"
import Group from "../models/Group.js";
import Student from "../models/Student.js"
import bcrypt from "bcryptjs"

const router = Router()

router.get("/teacher-dashboard/:id", teacherMid, async  (req, res) => {
    const id = req.userId
    const user = await Teacher.findById(id)
    const myGroup = await Group.find({teacherId: id})
    res.render('teacher-dash', {
        layout: "",
        title: "O'qituvchi Paneli | StephenSchool",
        id,
        firstName: user.firstName,
        surName: user.surName,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        myGroup,
    })
})

router.get('/teacher-settings/:id', teacherMid, async (req, res) => {
    const id = req.userId
    const user = await Teacher.findById(id)
    res.render('teacher-settings', {
        layout: "",
        title: "Sozlamalar | O'qituvchi Paneli",
        id,
        firstName: user.firstName,
        surName: user.surName,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        settingsError: req.flash('settingsError'),
        settingsSuccess: req.flash('settingsSuccess')
    })
  
})

router.get('/teacher-profile/:id', teacherMid, async (req, res) => {
    const id = req.userId
    const user = await Teacher.findById(id)
    res.render('teacher-profile', {
        title: "Mening Profilim | O'qituvchi Paneli",
        id,
        firstName: user.firstName,
        surName: user.surName,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        user
    })
})

router.get('/create-group', teacherMid, async (req, res) => {
    const id = req.userId
    const user = await Teacher.findById(id)
    res.render('create-group', {
        layout: "",
        title: "Yangi Guruh Ochish | O'qituvchi Paneli",
        id,
        firstName: user.firstName,
        surName: user.surName,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        createError: req.flash('createError'),
        createSuccess: req.flash('createSuccess')
    })
})

router.get('/my-group/:id', async (req, res) => {
    const id = req.params.id
    const group = await Group.findById(id)
    const userId = group.teacherId
    const user = await Teacher.findById(userId)
    const studentIds = group.students
    const students = await Student.find({ _id: { $in: studentIds } }).populate()
    const homeworks = group.homeworks.reverse()
    const groupId = homeworks.groupId
    console.log(groupId)
    res.render('my-group', {
        title: "Mening Guruhim | O'qituvchi Paneli",
        students: group.students,
        id,
        userId,
        firstName: user.firstName,
        surName: user.surName,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        students,
        homeworks,
        groupId,
        groupError: req.flash('groupError'),
        inviteSuccess: req.flash('inviteSuccess')
    })
})

router.get('/edit-group/:id', teacherMid, async (req, res) => {
    const id = req.params.id
    const userId = req.userId
    const user = await Teacher.findById(userId)
    const group = await Group.findById(id)
    console.log(group)
    res.render('edit-group', {
        layout: '',
        title: "Guruh Sozlamalari | O'qituvchi Paneli",
        group,
        id,
        firstName: user.firstName,
        surName: user.surName,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        editSuccess: req.flash("editSuccess")
    })
})

router.get('/journal/:id', teacherMid, async (req, res) => {
    const id = req.params.id
    console.log(id)
    res.render('journal', {
        layout: "",
        title: "Jurnal"
    })
})

// POST
router.post('/teacher-update/:id', teacherMid, async (req, res) => {
    const {password, newPassword} = req.body
    const id = req.userId
    if(!newPassword && !password) {
        req.flash('settingsError', "Barcha qatorlar to'ldirilishi shart!")
        res.redirect(`/teacher-settings/${id}`)
        return
    }

    if(!password) {
        req.flash('settingsError', "Yangi Parolni Kiriting!")
        res.redirect(`/teacher-settings/${id}`)
        return
    }

    
    if(!newPassword) {
        req.flash('settingsError', "Yangi Parolni Tasdiqlang!")
        res.redirect(`/teacher-settings/${id}`)
        return
    }

    if(password !== newPassword) {
        req.flash('settingError', "Parollar mos emas!")
        res.redirect(`/teacher-settings/${id}`)
        return
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await Teacher.findByIdAndUpdate(id, {password: hashedPassword}, {new: true})
    req.flash('settingsSuccess', "Parol Muvaffaqiyatli Yangilandi!")
    res.redirect(`/teacher-settings/${id}`)
})  

router.post('/create-group', teacherMid, async (req, res) => {
    const id = req.userId
    const {groupName, subject, level, lessonTime, lessonDay} = req.body
    if(!groupName) {
        req.flash('createError', "Guruh nomini kiriting!")
        res.redirect('/create-group')
        return
    }
    const groupData = {
        groupName,
        subject,
        level,
        lessonTime,
        lessonDay,
        teacherId: id
    }
    const group = await Group.create(groupData)
    req.flash('createSuccess', 'Guruh Muvaffaqiyatli Yaratildi!')
    res.redirect(`/teacher-dashboard/${id}`)
})

router.post('/edit-group/:id', teacherMid, async (req, res) => {
    const id = req.params.id
    const newLevel = req.body.newLevel
    const newLessonTime = req.body.newLessonTime
    const newLessonDay = req.body.newLessonDay
    await Group.findByIdAndUpdate({_id: id}, {level: newLevel, lessonTime: newLessonTime, lessonDay: newLessonDay}, {new: true})
    req.flash('editSuccess', "Guruh Ma'lumotlari O'zgartirildi!")
    res.redirect(`/teacher-dashboard/${req.userId}`)
})

router.get('/delete-group/:id', teacherMid, async (req, res) => {
    const id = req.params.id
    await Group.findByIdAndDelete(id)
    res.redirect(`/teacher-dashboard/${req.userId}`)
})

router.post('/invite-student/:id', async (req, res) => {
    const groupId = req.params.id
    const phoneNumber = req.body.phoneNumber
    const student = await Student.findOne({phoneNumber})
    if(!student) {
        req.flash("groupError", "Ushbu Student Mavjud Emas!")
        res.redirect(`/my-group/${groupId}`)
        return
    }
    const studentGroup = student.group
    if(studentGroup !== null) {
        req.flash('groupError', 'Ushbu Student Allaqachon Guruhda!')
        res.redirect(`/my-group/${groupId}`)
        return
    }
    await Student.findOneAndUpdate({phoneNumber}, {invitations: groupId}, {new: true})
    req.flash('inviteSuccess', "Taklifnoma Yuborildi!")
    res.redirect(`/my-group/${groupId}`)
})

router.post('/post-homework/:id', async (req, res) => {
    const id = req.params.id
    const homeworkLesson = req.body.homeworkLesson
    const tasks = req.body.tasks
    const homework = {
        homeworkLesson: req.body.homeworkLesson,
        tasks: req.body.tasks,
        groupId: id
    }
    if(!homeworkLesson && !tasks) {
        req.flash('groupError', "Barcha qatorlarni to'ldirish kerak!")
        res.redirect(`/my-group/${id}`)
        return
    }
    if(!homeworkLesson) {
        req.flash('groupError', "Uyga Vazifa Mavzusini Kiriting!")
        res.redirect(`/my-group/${id}`)
        return
    }
    if(!tasks) {
        req.flash('groupError', "Vazifa Berilishi Shart!")
        res.redirect(`/my-group/${id}`)
        return
    }
    const group = await Group.findByIdAndUpdate({_id: id}, { $push: {homeworks: homework} }, {new: true})
    console.log(group.homeworks)
    res.redirect(`/my-group/${id}`)
})

router.post('/delete-homework/:id', async (req, res) => {
    const id = req.params.id
    console.log(req.body)
})

router.post('/remove-student/:id', async (req, res) => {
    const studentId = req.params.id
    const groupId = req.body.groupId
    const group = await Group.findById(groupId)
    const student = await Student.findByIdAndUpdate({_id: studentId}, {group: null}, {new: true})
    group.students = group.students.filter(id => id.toString() !== studentId);
    await group.save()
    res.redirect(`/my-group/${groupId}`)
})          


export default router;