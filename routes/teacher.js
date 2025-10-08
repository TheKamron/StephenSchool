import { Router } from "express";
import teacherMid from "../middleware/teacherMid.js";
import Teacher from "../models/Teacher.js";
import Group from "../models/Group.js";
import Student from "../models/Student.js";
import bcrypt from "bcryptjs";
import FormData from "form-data";
import axios from "axios";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/teacher-dashboard/:id", teacherMid, async (req, res) => {
  const id = req.userId;
  const user = await Teacher.findById(id);
  const myGroup = await Group.find({ teacherId: id });
  res.render("teacher-dash", {
    layout: "",
    title: "O'qituvchi Paneli | StephenSchool",
    id,
    firstName: user.firstName,
    surName: user.surName,
    phoneNumber: user.phoneNumber,
    avatar: user.avatar,
    myGroup,
  });
});

router.get("/teacher-settings/:id", teacherMid, async (req, res) => {
  const id = req.userId;
  const user = await Teacher.findById(id);
  res.render("teacher-settings", {
    layout: "",
    title: "Sozlamalar | O'qituvchi Paneli",
    id,
    firstName: user.firstName,
    surName: user.surName,
    phoneNumber: user.phoneNumber,
    avatar: user.avatar,
    settingsError: req.flash("settingsError"),
    settingsSuccess: req.flash("settingsSuccess"),
  });
});

router.get("/teacher-profile/:id", teacherMid, async (req, res) => {
  const id = req.userId;
  const user = await Teacher.findById(id);
  res.render("teacher-profile", {
    title: "Mening Profilim | O'qituvchi Paneli",
    id,
    firstName: user.firstName,
    surName: user.surName,
    phoneNumber: user.phoneNumber,
    avatar: user.avatar,
    user,
  });
});

router.get("/create-group", teacherMid, async (req, res) => {
  const id = req.userId;
  const user = await Teacher.findById(id);
  res.render("create-group", {
    layout: "",
    title: "Yangi Guruh Ochish | O'qituvchi Paneli",
    id,
    firstName: user.firstName,
    surName: user.surName,
    phoneNumber: user.phoneNumber,
    avatar: user.avatar,
    createError: req.flash("createError"),
    createSuccess: req.flash("createSuccess"),
  });
});

router.get("/my-group/:id", async (req, res) => {
  const id = req.params.id;
  const group = await Group.findById(id);
  const userId = group.teacherId;
  const user = await Teacher.findById(userId);
  const studentIds = group.students;
  const students = await Student.find({ _id: { $in: studentIds } }).populate();
  const tasks = group.tasks.reverse();
  const taskAuthorIds = tasks.map((task) => task.studentId);
  const taskAuthor = await Student.find({
    _id: { $in: taskAuthorIds },
  }).populate();
  res.render("my-group", {
    title: "Mening Guruhim | O'qituvchi Paneli",
    id,
    userId,
    firstName: user.firstName,
    surName: user.surName,
    phoneNumber: user.phoneNumber,
    teacherAvatar: user.avatar,
    students,
    taskAuthor,
    tasks,
    groupError: req.flash("groupError"),
    inviteSuccess: req.flash("inviteSuccess"),
  });
});

router.get("/my-group/:id/mock", async (req, res) => {
  const id = req.params.id;
  const group = await Group.findById(id);
  const userId = group.teacherId; // o'qituvchi idsi
  const user = await Teacher.findById(userId); // o'qituvchi profili
  const studentIds = group.students; // studentlarning idlari
  const students = await Student.find({ _id: { $in: studentIds } }).populate(); // barcha studentlar
  res.render("mock", {
    title: "Mock Natijalari | O'qituvchi Paneli",
    id,
    userId,
    firstName: user.firstName,
    surName: user.surName,
    phoneNumber: user.phoneNumber,
    avatar: user.avatar,
    students,
    examSuccess: req.flash("examSuccess"),
  });
});

router.get("/edit-group/:id", teacherMid, async (req, res) => {
  const id = req.params.id;
  const userId = req.userId;
  const user = await Teacher.findById(userId);
  const group = await Group.findById(id);

  res.render("edit-group", {
    layout: "",
    title: "Guruh Sozlamalari | O'qituvchi Paneli",
    group,
    id,
    firstName: user.firstName,
    surName: user.surName,
    phoneNumber: user.phoneNumber,
    avatar: user.avatar,
    editSuccess: req.flash("editSuccess"),
  });
});

// POST
router.post("/teacher-update/:id", teacherMid, async (req, res) => {
  const { password, newPassword } = req.body;
  const id = req.userId;
  if (!newPassword && !password) {
    req.flash("settingsError", "Barcha qatorlar to'ldirilishi shart!");
    res.redirect(`/teacher-settings/${id}`);
    return;
  }

  if (!password) {
    req.flash("settingsError", "Yangi Parolni Kiriting!");
    res.redirect(`/teacher-settings/${id}`);
    return;
  }

  if (!newPassword) {
    req.flash("settingsError", "Yangi Parolni Tasdiqlang!");
    res.redirect(`/teacher-settings/${id}`);
    return;
  }

  if (password !== newPassword) {
    req.flash("settingError", "Parollar mos emas!");
    res.redirect(`/teacher-settings/${id}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await Teacher.findByIdAndUpdate(
    id,
    { password: hashedPassword },
    { new: true }
  );
  req.flash("settingsSuccess", "Parol Muvaffaqiyatli Yangilandi!");
  res.redirect(`/teacher-settings/${id}`);
});

router.post(
  "/teacher-update-avatar/:id",
  upload.single("avatar"),
  teacherMid,
  async (req, res) => {
    try {
      const { id } = req.params;
      const image = req.file;

      if (!image) {
        return res.status(400).send("Rasm tanlanmadi");
      }

      // imgbb'ga yuborish
      const formData = new FormData();
      formData.append("image", image.buffer.toString("base64"));

      const imgbbRes = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.API_KEY}`,
        formData,
        { headers: formData.getHeaders() }
      );

      const avatarUrl = imgbbRes.data.data.url;

      // MongoDB’da yangilaymiz
      await Teacher.findByIdAndUpdate(id, { avatar: avatarUrl });

      res.redirect(`/teacher-settings/${id}`);
    } catch (error) {
      console.error("Avatar yangilashda xatolik:", error);
      res.status(500).send("Xatolik yuz berdi");
    }
  }
);

router.post("/create-group", teacherMid, async (req, res) => {
  const id = req.userId;
  const { groupName, subject, level, lessonTime, lessonDay } = req.body;
  if (!groupName) {
    req.flash("createError", "Guruh nomini kiriting!");
    res.redirect("/create-group");
    return;
  }
  const groupData = {
    groupName,
    subject,
    level,
    lessonTime,
    lessonDay,
    teacherId: id,
  };
  const group = await Group.create(groupData);
  req.flash("createSuccess", "Guruh Muvaffaqiyatli Yaratildi!");
  res.redirect(`/teacher-dashboard/${id}`);
});

router.post("/edit-group/:id", teacherMid, async (req, res) => {
  const id = req.params.id;
  const newLevel = req.body.newLevel;
  const newLessonTime = req.body.newLessonTime;
  const newLessonDay = req.body.newLessonDay;
  await Group.findByIdAndUpdate(
    { _id: id },
    { level: newLevel, lessonTime: newLessonTime, lessonDay: newLessonDay },
    { new: true }
  );
  req.flash("editSuccess", "Guruh Ma'lumotlari O'zgartirildi!");
  res.redirect(`/teacher-dashboard/${req.userId}`);
});

router.get("/delete-group/:id", teacherMid, async (req, res) => {
  const id = req.params.id;
  await Group.findByIdAndDelete(id);
  res.redirect(`/teacher-dashboard/${req.userId}`);
});

router.post("/invite-student/:id", async (req, res) => {
  const groupId = req.params.id;
  const phoneNumber = req.body.phoneNumber;
  const student = await Student.findOne({ phoneNumber });
  if (!student) {
    req.flash("groupError", "Ushbu Student Mavjud Emas!");
    res.redirect(`/my-group/${groupId}`);
    return;
  }
  const group = student.group;
  const existGroup = await Group.findById(group);
  if (existGroup !== null) {
    req.flash("groupError", "Ushbu Student Allaqachon Guruhda!");
    res.redirect(`/my-group/${groupId}`);
    return;
  }
  await Student.findOneAndUpdate(
    { phoneNumber },
    { invitations: groupId },
    { new: true }
  );
  req.flash("inviteSuccess", "Taklifnoma Yuborildi!");
  res.redirect(`/my-group/${groupId}`);
});

router.post("/remove-student/:id", async (req, res) => {
  const studentId = req.params.id;
  const groupId = req.body.groupId;
  const group = await Group.findById(groupId);
  const student = await Student.findByIdAndUpdate(
    { _id: studentId },
    { group: null },
    { new: true }
  );
  group.students = group.students.filter((id) => id.toString() !== studentId);
  await group.save();
  res.redirect(`/my-group/${groupId}`);
});

function roundIELTS(score) {
  return parseFloat((Math.round(score * 2) / 2).toFixed(1));
}

router.post("/my-group/:id/mock", async (req, res) => {
  const id = req.params.id;
  const {
    studentId,
    listeningScore,
    readingScore,
    writingScore,
    speakingScore,
    feedback,
  } = req.body;
  const student = await Student.findById(studentId); // studentni topish
  const listening = parseFloat(listeningScore);
  const reading = parseFloat(readingScore);
  const writing = parseFloat(writingScore);
  const speaking = parseFloat(speakingScore);
  const mockResults = student.mockResults;

  const rawOverall = (listening + reading + writing + speaking) / 4;
  const overall = roundIELTS(rawOverall);

  const examData = {
    listeningScore: listening,
    readingScore: reading,
    writingScore: writing,
    speakingScore: speaking,
    overall,
    feedback,
    date: Date.now(),
  };
  mockResults.push(examData);
  await student.save();

  req.flash("examSuccess", "Natijalar muvaffaqiyatli yuborildi!");
  res.redirect(`/my-group/${id}/mock`);
});

router.post("/task-checked/:id", async (req, res) => {
  const taskId = req.params.id;
  const newStatus = req.body.taskStatus;

  try {
    const group = await Group.findOne({ "tasks._id": taskId });
    if (!group) {
      req.flash("groupError", "Xatolik!");
      return;
    }

    const task = group.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = newStatus;
    }

    await group.save();
    res.redirect("back");
    console.log(task);
  } catch (error) {
    console.log(error);
  }
});

export default router;
