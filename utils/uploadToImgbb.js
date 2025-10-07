import axios from "axios";
import FormData from "form-data";

export const uploadToImgbb = async (fileBuffer) => {
  try {
    const formData = new FormData();
    // imgbb base64 formatni talab qiladi
    formData.append("image", fileBuffer.toString("base64"));

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.API_KEY}`,
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    return response.data.data.url; // ✅ rasmning public URL manzili
  } catch (error) {
    console.error("imgbb yuklashda xatolik:", error.response?.data || error.message);
    throw new Error("imgbb upload error");
  }
};
