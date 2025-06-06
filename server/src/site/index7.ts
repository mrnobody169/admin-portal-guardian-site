process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import dotenv from "dotenv";
import { delay, ExtractProxy } from "../utils";
import { runIRikvipCc } from "./i-rik-vip";
import { runPlayIwinBio } from "./play-iwin-bio";
import { runPlayB52Cc } from "./play-b52-cc";
import { schedule } from "node-cron";
dotenv.config();

// Lập lịch cron job
const runTask = async () => {
  let proxy = await ExtractProxy(process.env.PROXY7);
  console.log(`proxy: ${JSON.stringify(proxy)}`);
  await runIRikvipCc(proxy);
  await runPlayIwinBio(proxy);
  await runPlayB52Cc(proxy);
  console.log(`Done a job`);
};



const startCronJob = (): void => {
  schedule("7,17,27,37,47,57 * * * *", runTask, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh",
  });
  console.log("Cron job đã được lập lịch, chạy mỗi 20 phút.");
};

startCronJob();
