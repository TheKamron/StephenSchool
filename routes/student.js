import { Router } from "express"
import studentMiddleware from "../middleware/studentMid.js"
import Student from "../models/Student.js"
import Group from "../models/Group.js"
import bcrypt from "bcryptjs"
import moment from "moment"

const router = Router()

router.get('/student-dashboard', studentMiddleware, (req, res) => {
    res.redirect(`/student-dashboard/${req.userId}`)
})

router.get('/student-dashboard/:id', studentMiddleware, async (req,res) => {
    const id = req.userId
    const user = await Student.findById(id)
    const invitation = user.invitations
    const existGroup = user.group
    if(!existGroup) {
    const inviteInfo = await Group.findById(invitation)             
    
    res.render('student-dash', {
        layout: '',
        title: 'Student Paneli | StephenSchool',
        firstName: user.firstName,
        surName: user.surName,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        invitation,
        inviteInfo,
        id,
       })
       return     
    }   
    const studentGroup = user.group._id
    const inviteInfo = await Group.findById(invitation)
    const group = await Group.findById(studentGroup)
    const homework = group.homeworks
    res.render('student-dash', {
        layout: '',
        title: 'Student Paneli | StephenSchool',
        firstName: user.firstName,
        surName: user.surName,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        studentGroup,
        group,
        invitation,
        inviteInfo,
        homework,
        id,
       }) 
})

router.get('/student-settings/:id', studentMiddleware, async (req, res) => {
    const id = req.userId
    const user = await Student.findById(id)
    res.render('student-settings', {
        layout: "",
        title: "Sozlamalar | Student Paneli",
        firstName: user.firstName,
        surName: user.surName,
        phoneNumber: user.phoneNumber,
        id,
        avatar: user.avatar,
        settingsError: req.flash('settingsError'),
        success: req.flash('success')
    })
})

router.get('/student-profile/:id', studentMiddleware, async (req, res) => {
    const id = req.userId
    const user = await Student.findById(id)
    const groupId = user.group
    const birthYear = moment(user.birthDate).year();
    const currentYear = moment().year();
    const age = currentYear - birthYear;
    if(groupId === null) {
    res.render('student-profile', {
        layout: "",
        title: "Mening Profilim | Student Paneli",
        firstName: user.firstName,
        surName: user.surName,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        birthDate: user.birthDate,
        user,
        id,
        age
    })        
    } else {
        const group = await Group.findById(groupId)
        res.render('student-profile', {
            layout: "",
            title: "Mening Profilim | StephenSchool",
            firstName: user.firstName,
            surName: user.surName,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
            birthDate: user.birthDate,
            groupName: group.groupName,
            groupSubject: group.subject,
            groupLevel: group.level,
            group,
            id,
            age
        })   
    }
})
// POST

router.post('/student-update/:id', studentMiddleware, async (req, res) => {
    const {password, newPassword} = req.body
    const id = req.userId
    if(!newPassword && !password) {
        req.flash('settingsError', "Barcha qatorlar to'ldirilishi shart!")
        res.redirect(`/student-settings/${id}`)
        return
    }

    if(!password) {
        req.flash('settingsError', "Yangi Parolni Kiriting!")
        res.redirect(`/student-settings/${id}`)
        return
    }

    
    if(!newPassword) {
        req.flash('settingsError', "Yangi Parolni Tasdiqlang!")
        res.redirect(`/student-settings/${id}`)
        return
    }

    if(password !== newPassword) {
        req.flash('settingError', "Parollar mos emas!")
        res.redirect(`/student-settings/${id}`)
        return
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await Student.findByIdAndUpdate(id, {password: hashedPassword}, {new: true})
    req.flash('success', "Parol Muvaffaqiyatli O'zgartirildi!")
    res.redirect(`/student-settings/${id}`)
})

router.post('/join/:id', studentMiddleware, async (req, res) => {
    const groupId = req.params.id
    const userId = req.userId
    await Group.findByIdAndUpdate({_id: groupId}, { $push: { students: userId } }, {new: true})
    await Student.findByIdAndUpdate({_id: userId}, {group: groupId, invitations: null}, {new: true})
  
    res.redirect(`/student-dashboard/${userId}`)
})

router.post('/cancel/:id', async (req, res) => {
    const userId = req.params.id
    
    await Student.findByIdAndUpdate({_id: userId}, {invitations: null}, {new: true})

    res.redirect(`/student-dashboard/${userId}`)
})


export default router;