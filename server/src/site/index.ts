process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import dotenv from "dotenv";
import { delay, ExtractProxy } from "../utils";
import { runIRikvipCc } from "./i-rik-vip";
import { runPlayIwinBio } from "./play-iwin-bio";
import { runPlayB52Cc } from "./play-b52-cc";
dotenv.config();

// Lập lịch cron job
const runTask = async () => {
  let proxy = await ExtractProxy();
  console.log(`proxy: ${JSON.stringify(proxy)}`);
  await delay(2000);
  await runIRikvipCc(proxy);
  await runPlayIwinBio(proxy);
  await runPlayB52Cc(proxy);
};

runTask();
