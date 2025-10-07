import multer from "multer";

const storage = multer.memoryStorage();

// Fayl turi va hajmini tekshiruvchi filtr
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Faqat rasm yoki PDF fayllarni yuklash mumkin!"), false);
  }
};

// 10 MB limit
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export { upload };
 