process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import axios from "axios";
import cron from "node-cron";
import * as fs from "fs";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { AccountLoginService } from "../../services/AccountLoginService";

puppeteer.use(StealthPlugin());

import {
  solveCaptchaFromImage,
  generateSecurePassword,
  generateVietnameseUsername,
  delay,
  generateUserAgent,
} from "../../utils";
import { PlaySonClubSite } from "./play.son.club";
import dotenv from "dotenv";
dotenv.config();

async function autoRegister() {
  let accountLoginService = new AccountLoginService();

  let main_url = process.env.PLAY_SON_CLUB_URL
    ? process.env.PLAY_SON_CLUB_URL
    : "https://play.son13.club";
  // let crawler = new CrawlServer();
  let username = generateVietnameseUsername();
  let psw = generateSecurePassword();
  const browser = await puppeteer.launch({
    headless: "shell",
    slowMo: 250,
    devtools: false,
  });
  const page = await browser.newPage();
  let captchaText = "";
  let captchaV2Url = "data:image/";
  let registerUrl = "https://portal.taison01.com/api/Account/CreateAccount";
  let token_playiwinbio = ``;
  page.on("response", async (response) => {
    try {
      const request = response.request();
      const url = request.url();
      if (url.includes(captchaV2Url)) {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        console.log("Captcha image URL:", response.data);
        // Save the image data to a file as PNG
        fs.writeFileSync(
          __dirname + "\\captchav2.png",
          Buffer.from(response.data)
        );
        captchaText =
          (
            await solveCaptchaFromImage(__dirname + "\\captchav2.png")
          )?.toUpperCase() || "";
      }
      if (url.includes(registerUrl)) {
        const json = await response.json();
        if (json.ResponseCode === 1 && json.Token) {
          token_playiwinbio = json.Token;
          console.log(`[SUCCESS] Token: ${token_playiwinbio}`);
        }
      }
    } catch (error) {
      console.error("Error in response handler:", error);
    }
  });
  await page.setUserAgent(generateUserAgent());
  await browser.deleteCookie();
  await page.setViewport({ width: 800, height: 600 });
  const context = browser.defaultBrowserContext();
  await context.overridePermissions(main_url, ["geolocation"]);
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    request.continue({
      headers: {
        ...request.headers(),
        Referer: "https://play.son13.club", // Đảm bảo Referer khớp với origin
      },
    });
  });
  await page.goto(main_url, { waitUntil: "load" });
  await delay(1000 * 60 * 3);
  console.log(`load done`);

  await page.mouse.click(400, 566, { button: "left" }); // Di chuyển chuột đến tọa độ popup form đăng ký(Register form)
  await delay(1000 * 60 * 2);

  await page.mouse.click(370, 230, { button: "left" }); // Di chuyển chuột đến tọa độ popup form đăng ký(username)
  await page.keyboard.type(username); // Nhập username vào input
  console.log(`username: ${username}`);

  await delay(3000);
  await page.mouse.click(370, 270, { button: "left" }); // Di chuyển chuột đến tọa độ popup form đăng ký(password)
  await page.keyboard.type(psw); // Nhập password vào input
  console.log(`password: ${psw}`);

  await delay(3000);
  await page.mouse.click(370, 320, { button: "left" }); // Di chuyển chuột đến tọa độ popup form đăng ký(re-password)
  await page.keyboard.type(psw); // Nhập re-password vào input
  console.log(`re-password: ${psw}`);

  await delay(3000);
  await page.mouse.click(370, 370, { button: "left" }); // Di chuyển chuột đến tọa độ popup form đăng ký(captcha code)
  await page.keyboard.type(captchaText); // Nhập captcha vào input

  await delay(3000);
  await page.mouse.click(370, 410, { button: "left" }); // Di chuyển chuột đến tọa độ popup form đăng ký(btn confirm)

  await delay(3000);
  await page.mouse.click(400, 250, { button: "left" }); // Di chuyển chuột đến tọa độ popup form đăng ký(nickname)
  await page.keyboard.type(generateVietnameseUsername().slice(0, 8)); // Nhập nickname vào input

  await delay(3000);
  await page.mouse.click(400, 380, { button: "left" }); // Di chuyển chuột đến tọa độ popup form đăng ký(btn confirm)
  await delay(1000 * 60);

  await accountLoginService.create({
    username,
    password: psw,
    token: token_playiwinbio,
    site_id: "play-son-club",
    status: "active",
  });
  console.log(`Successfully create account play-son-club: ${username} ${psw}`);
  await browser.close();
}

async function main() {
  do {
    console.log(`Continue register`);
    
    await autoRegister();
  } while (true);
}

main();
