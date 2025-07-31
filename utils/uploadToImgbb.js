import axios from 'axios';
import fs from 'fs/promises';
import FormData from 'form-data';
import dotenv from "dotenv"
dotenv.config()

const API_KEY = process.env.API_KEY;

export async function uploadToImgbb(filePath) {
  const imageBuffer = await fs.readFile(filePath);
  const base64Image = imageBuffer.toString('base64');

  const form = new FormData();
  form.append('key', API_KEY);
  form.append('image', base64Image);

  const response = await axios.post('https://api.imgbb.com/1/upload', form, {
    headers: form.getHeaders(),
  });

  await fs.unlink(filePath)
  return response.data.data.url;
}
