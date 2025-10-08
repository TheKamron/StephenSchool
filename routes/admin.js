import { Router } from "express";
// Models
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Group from "../models/Group.js";
import Admin from "../models/Admin.js";
import Courses from "../models/Courses.js";
import Contact from "../models/Contact.js";
// Others
import adminMid from "../middleware/adminMid.js";
import generateJWTToken from "../service/token.js";
import bcrypt from "bcryptjs";

const router = Router();
router.get("/admin-login", async (req, res) => {
  res.render("admin-login", {
    title: "Kirish | Admin Panel",
    layout: "",
    adminLoginSuccess: req.flash("adminLoginSuccess"),
    adminLoginError: req.flash("adminLoginError"),
  });
});

router.get("/admin-dashboard", adminMid, async (req, res) => {
  res.redirect(`/admin-dashboard/${req.userId}`);
});

router.get("/admin-dashboard/:id", adminMid, async (req, res) => {
  const student = await Student.find().lean();
  const teacher = await Teacher.find().lean();
  const group = await Group.find();
  const courses = await Courses.find();
  const contactInfo = await Contact.find().lean();
  const users = student.length + teacher.length;
  const user = student.concat(teacher);
  const id = req.userId;
  const adminInfo = await Admin.findById(id);
  res.render("admin-dash", {
    layout: "main",
    title: "Admin Panel | StephenSchool",
    student,
    teacher,
    group: group.reverse(),
    courses,
    users,
    user: user.reverse(),
    adminInfo,
    contactInfo: contactInfo.reverse(),
    id,
  });
});

router.get("/admin-profile/:id", adminMid, async (req, res) => {
  const id = req.userId;
  const adminInfo = await Admin.findById(id);
  console.log(adminInfo);
  res.render("admin-profile", {
    title: "Profil | Admin Panel",
    adminInfo,
    id,
  });
});

router.get("/admin-settings/:id", adminMid, async (req, res) => {
  const id = req.userId;
  const adminInfo = await Admin.findById(id);
  res.render("admin-settings", {
    title: "Sozlamalar | Admin Panel",
    adminInfo,
    id,
    settingsSuccess: req.flash("settingsSuccess"),
    settingsError: req.flash("settingsError"),
  });
});

router.get("/add-student", adminMid, async (req, res) => {
  const id = req.userId;
  const adminInfo = await Admin.findById(id);
  res.render("add-student", {
    layout: "main",
    title: "Yangi Student | Admin Panel",
    id,
    adminInfo,
    addStudentSuccess: req.flash("addStudentSuccess"),
  });
});

router.get("/add-teacher", adminMid, async (req, res) => {
  const id = req.userId;
  const adminInfo = await Admin.findById(id);
  res.render("add-teacher", {
    layout: "main",
    title: "Yangi O'qituvchi | Admin Panel",
    id,
    adminInfo,
    addTeacherSuccess: req.flash("addTeacherSuccess"),
  });
});

router.get("/add-admin", adminMid, async (req, res) => {
  const id = req.userId;
  const adminInfo = await Admin.findById(id);
  res.render("add-admin", {
    title: "Yangi Admin | Admin Panel",
    id,
    adminInfo,
  });
});

router.get("/courses", adminMid, async (req, res) => {
  const id = req.userId;
  const courses = await Courses.find();
  const courseId = courses._id;
  const adminInfo = await Admin.findById(id);
  res.render("courses", {
    layout: "main",
    title: "Barcha Kurslar | Admin Panel",
    id,
    courses,
    courseId,
    adminInfo,
  });
});

router.get("/new-course", adminMid, async (req, res) => {
  const id = req.userId;
  const adminInfo = await Admin.findById(id);
  res.render("new-course", {
    layout: "main",
    title: "Yangi Kurs | Admin Panel",
    id,
    adminInfo,
  });
});

// POST
router.post("/admin-login", async (req, res) => {
  const { userName, password } = req.body;
  if (!userName && !password) {
    req.flash(
      "adminLoginError",
      "Tizimga kirishi uchun Login va Parolni Kiritish Shart!"
    );
    res.redirect("/admin-login");
    return;
  }
  const existAdmin = await Admin.findOne({ userName });
  if (!existAdmin) {
    req.flash("adminLoginError", "Afsuski, Admin Topilmadi!");
    res.redirect("/admin-login");
    return;
  }
  const isPassEqual = await bcrypt.compare(password, existAdmin.password);
  if (!isPassEqual) {
    req.flash("adminLoginError", "Parolni Xato Kiritdingiz!");
    res.redirect("/admin-login");
    return;
  }
  const token = generateJWTToken(existAdmin._id);
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });
  req.flash(
    "adminLoginSuccess",
    `Xush Kelibsiz ${userName}! Qanday yangiliklar kiritamiz?`
  );
  res.redirect(`/admin-dashboard/${existAdmin._id}`);
});

router.post("/add-student", async (req, res) => {
  const { firstName, surName, phoneNumber, password, role, gender, birthDate } =
    req.body;
  const hashedPass = await bcrypt.hash(password, 10);
  const studentData = {
    firstName,
    surName,
    phoneNumber,
    password: hashedPass,
    role,
    gender,
    birthDate,
    avatar: `${gender}.png`,
  };
  const data = await Student.create(studentData);
  const token = generateJWTToken(data._id);
  req.flash(
    "addStudentSuccess",
    "O'quvchi Muvaffaqiyatli Ro'yxatdan O'tkazildi!"
  );
  res.redirect("/add-student");
});

router.post("/add-teacher", async (req, res) => {
  const {
    firstName,
    surName,
    phoneNumber,
    password,
    role,
    gender,
    subject,
    birthDate,
  } = req.body;
  const hashedPass = await bcrypt.hash(password, 10);
  const teacherData = {
    firstName,
    surName,
    phoneNumber,
    password: hashedPass,
    role,
    gender,
    birthDate,
    avatar: `${gender}.jpg`,
    subject,
  };
  const data = await Teacher.create(teacherData);
  const token = generateJWTToken(data._id);
  req.flash(
    "addTeacherSuccess",
    "O'qituvchi Muvaffiyatli Ro'yxatdan O'tkazildi!"
  );
  res.redirect("/add-teacher");
});

router.post("/new-course", async (req, res) => {
  const { subject, level, lessonTime, lessonDay, teacherName, coursePrice } =
    req.body;
  await Courses.create(req.body);
  res.redirect(`/courses`);
});

router.post("/add-admin", async (req, res) => {
  const { userName, phoneNumber, password, gender } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const data = {
    userName,
    phoneNumber,
    gender,
    password: hashedPassword,
  };
  const admin = await Admin.create(data);
  const token = generateJWTToken(admin._id);
  res.redirect(`/admin-login`);
});

router.post("/admin-update/:id", async (req, res) => {
  const id = req.params.id;
  const { oldPassword, password, newPassword } = req.body;
  const admin = await Admin.findById(id);
  if (!newPassword && !password) {
    req.flash("settingsError", "Barcha qatorlar to'ldirilishi shart!");
    res.redirect(`/admin-settings/${id}`);
    return;
  }

  const checkPassword = await bcrypt.compare(oldPassword, admin.password);
  if (!checkPassword) {
    req.flash("settingsError", "Eski Parolni Xato Kiritdingiz!");
    res.redirect(`/admin-settings/${id}`);
    return;
  }

  if (!password) {
    req.flash("settingsError", "Yangi Parolni Kiriting!");
    res.redirect(`/admin-settings/${id}`);
    return;
  }

  if (!newPassword) {
    req.flash("settingsError", "Yangi Parolni Tasdiqlang!");
    res.redirect(`/admin-settings/${id}`);
    return;
  }

  if (password !== newPassword) {
    req.flash("settingError", "Parollar mos emas!");
    res.redirect(`/admin-settings/${id}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await Admin.findByIdAndUpdate(
    id,
    { password: hashedPassword },
    { new: true }
  );
  req.flash("settingsSuccess", "Parol Muvaffaqiyatli Yangilandi!");
  res.redirect(`/admin-settings/${id}`);
});

// Delete
router.get("/delete-user/:id", adminMid, async (req, res) => {
  const userId = req.params.id;
  try {
    // Student kolleksiyasida tekshirish
    const student = await Student.findById(userId);
    if (student) {
      await Student.findByIdAndDelete(userId);
      res.redirect(`/admin-dashboard/${req.userId}`);
      return;
    }

    // Teacher kolleksiyasida tekshirish
    const teacher = await Teacher.findById(userId);
    if (teacher) {
      await Teacher.findByIdAndDelete(userId);
      res.redirect(`/admin-dashboard/${req.userId}`);
      return;
    }

    // Agar ID hech qaysi kolleksiyada topilmasa
    return res
      .status(404)
      .send("User not found in Student or Teacher collection.");
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).send("An error occurred while deleting the user.");
  }
});

router.get("/delete-course/:id", async (req, res) => {
  const id = req.params.id;
  await Courses.findByIdAndDelete(id);
  res.redirect("/courses");
});

router.get("/delete-info/:id", async (req, res) => {
  const id = req.params.id;
  await Contact.findByIdAndDelete(id);
  res.redirect("/admin-dashboard");
});

export default router;
