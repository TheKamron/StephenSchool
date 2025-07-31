import { Router } from "express"
import studentMiddleware from "../middleware/studentMid.js"
import Student from "../models/Student.js"
import Group from "../models/Group.js"
import bcrypt from "bcryptjs"
import moment from "moment"
import path from 'path';
import { fileURLToPath } from 'url';
import { upload } from '../middleware/upload.js';
import { uploadToImgbb } from '../utils/uploadToImgbb.js';

const router = Router()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


router.get('/student-dashboard', studentMiddleware, (req, res) => {
    res.redirect(`/student-dashboard/${req.userId}`)
})

router.get('/student-dashboard/:id', studentMiddleware, async (req,res) => {
    const id = req.userId
    const user = await Student.findById(id)
    const invitation = user.invitations
    const userGroupId = user.group
    const existGroup = await Group.findById(userGroupId)

    if(existGroup === null) {
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
        existGroup
    })
       return     
    }  
    const studentGroup = user.group._id
    const inviteInfo = await Group.findById(invitation)
    const group = await Group.findById(studentGroup)
    const tasks = group.tasks
    const myTasks = tasks.filter(task => task.studentId.toString() == id.toString()).reverse()

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
        id,
        myTasks,
        taskSuccess: req.flash('taskSuccess'),
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
    const group = await Group.findById(groupId)
    const birthYear = moment(user.birthDate).year();
    const currentYear = moment().year();
    const age = currentYear - birthYear;
    console.log(group)
    if(group === null) {
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
            title: "Mening Profilim | Student Paneli",
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

router.get('/exam-results/:id', async (req, res) => {
    const id = req.params.id
    const user = await Student.findById(id)
    const mockResults = user.mockResults    
    res.render('exam-results', {
        title: "Mock Natijalarim | Student Paneli",
        id,
        firstName: user.firstName,
        surName: user.surName,
        phoneNumber: user.phoneNumber,        
        avatar: user.avatar,
        mockResults,    
    })

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

router.post('/send-task/:id', upload.array('taskFile', 10), async (req, res) => {
    try {
        const id = req.params.id
        const user = await Student.findById(id)
        const groupId = user.group
        const group = await Group.findById(groupId)
        const uploadedFiles = req.files;
    
        if (!uploadedFiles || uploadedFiles.length === 0) {
          return res.status(400).send('Fayl topilmadi');
        }
    
        const uploadedUrls = [];
    
        for (const file of uploadedFiles) {
          const imageUrl = await uploadToImgbb(file.path);
          uploadedUrls.push(imageUrl);         
        }
    
       const newTask = {
            image: uploadedUrls,
            studentId: id,
            firstName: user.firstName,
            surName: user.surName,
            avatar: user.avatar,
            status: 'Pending',
            date: Date.now()
       }

       if(!group) {
          return res.redirect(`/student-dashboard/${id}`)
       }

       group.tasks.push(newTask)
       await group.save()

        req.flash('taskSuccess', "Topshiriq muvaffaqiyatli yuborildi!")
        res.redirect(`/student-dashboard/${id}`)
    } catch (error) {
        console.error('Xatolik:', error.message);
        res.status(500).send('Serverda xatolik yuz berdi');
        res.redirect('back')
      }
    
})

export default router;