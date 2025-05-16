process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import dotenv from "dotenv";
import { delay, ExtractProxy } from "../utils";
import { runIRikvipCc } from "./i-rik-vip";
import { runPlayIwinBio } from "./play-iwin-bio";
import { runPlayB52Cc } from "./play-b52-cc";
dotenv.config();

var i = 0;
// Lập lịch cron job
const runTask = async () => {
  while (i < 500) {
    let proxy = await ExtractProxy(process.env.PROXY1);
    console.log(`proxy: ${JSON.stringify(proxy)}`);
    await runIRikvipCc(proxy);
    await runPlayIwinBio(proxy);
    await runPlayB52Cc(proxy);
    console.log(`Done a job: ${i}`);
    i++;
  }
};
runTask();
