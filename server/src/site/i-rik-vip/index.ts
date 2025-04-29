process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { IRikvipCc } from "./i.rik.vip";
import dotenv from "dotenv";
import { AxiosProxyConfig } from "axios";
import { delay } from "../../utils";
import { CrawlService } from "../../services/CrawlService";
import { ISignUpResponse } from "../../interfaces";
dotenv.config();

export const runIRikvipCc = async (proxy: AxiosProxyConfig | false = false) => {
  let crawlService = new CrawlService();
  console.log(
    `~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n`
  );
  console.log(`Start Data Collection in https://i.rik.vip/\n`);
  outerLoop: do {
    //0. Initialize Instance
    await delay(1000);
    const site_id = process.env.I_RIK_VIP_ID ? process.env.I_RIK_VIP_ID : ``;
    const site = new IRikvipCc();
    let pingpong: boolean;
    //1. Sign Up
    let account = await site.signUp(proxy);
    if (!account) {
      console.log(`You have violated the IP rate limit policy. Please change IP.`);
      break outerLoop;
    }
    await crawlService.storeAccountLogin(account, site_id);
    console.log(`Sign Up successfully. ${JSON.stringify(account)}`);
    console.log(
      `========================================================================================================\n`
    );

    //2. Update User
    pingpong = await site.updateUsername(
      account.username,
      account.token,
      proxy
    );
    if (pingpong) {
      console.log(`Update User successfully.`);
    }
    await delay(2500);

    //3. Get List Bank Code
    pingpong = await site.getBankCode(account.token, proxy);
    if (pingpong) {
      console.log(`Get Bank Code successfully.`);
    }
    innerLoop: do {
      //5. Create Payment
      await delay(1000);
      let bank_account = await site.createPayment(account.token, proxy);
      if (!bank_account || bank_account.bank_name == "Vietcombank") {
        console.log(`Account ${account.username} has been suspended.`);
        console.log(
          `========================================================================================================\n`
        );
        break innerLoop;
      }
      await crawlService.process(bank_account, site_id);
    } while (true);
  } while (true);
  console.log(`Stop Data Collection in https://i.rik.vip/`);
  console.log(
    `~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n`
  );
};
runIRikvipCc();

// // Lập lịch cron job
// const startCronJob = (): void => {
//   schedule(
//     "*/20 * * * *",
//     async () => {
//       await runIRikvipCc();
//     },
//     {
//       scheduled: true,
//       timezone: "Asia/Ho_Chi_Minh",
//     }
//   );
//   console.log("Cron job đã được lập lịch, chạy mỗi 20 phút.");
// };

// // startCronJob();
