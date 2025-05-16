process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { Solver } from "@2captcha/captcha-solver";
import axios from "axios";
const solver = new Solver("62405416d5d94b6a27b152407496d81e");
import * as fs from "fs";

export async function downloadImageFromUrl(url: string, filepath: string) {
  try {
    // Fetch the image data from the URL
    const response = await axios.get(url, { responseType: "arraybuffer" });

    // Save the image to the specified filepath
    fs.writeFileSync(filepath, Buffer.from(response.data));

    console.log("Image saved successfully!");
  } catch (error) {
    console.error("Error downloading the image:", error);
  }
}
export async function solveCaptchaFromImage(path: string) {
  try {
    const data = imageToBase64(path);
    const result = await solver.imageCaptcha({
      body: data,
      numeric: 0,
      phrase: 0,
      regsense: 0,
      lang: "en",
      textinstructions: "Enter text in image. Note: Case sensitive.",
      // textinstructions: "type red symbols only",
    });
    console.log("Kết quả captcha:", result.data.toUpperCase());
    return result.data.toUpperCase();
  } catch (err) {
    console.error("Lỗi captcha:", err);
  }
}

function imageToBase64(filepath: string) {
  try {
    // Read the image file as binary data
    const imageData = fs.readFileSync(filepath);

    // Convert binary data to Base64
    const base64String = Buffer.from(imageData).toString("base64");

    // Optionally, you can include the MIME type (e.g., 'data:image/jpeg;base64,')
    const mimeType = "image/png"; // Adjust based on your image type (e.g., 'image/png')
    const dataUri = `data:${mimeType};base64,${base64String}`;

    return dataUri; // or just return base64String if you don't need the MIME type
  } catch (error) {
    console.error("Error converting image to Base64:", error);
    throw error;
  }
}
