process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { IRikvipCc } from "./i.rik.vip";
import dotenv from "dotenv";
import { AxiosProxyConfig } from "axios";
import { delay } from "../../utils";
import { HandlerService } from "../../services/HandlerService";
import { TelegramOnlyLogService } from "../../services/TelegramOnlyLogService";
dotenv.config();

export const runIRikvipCc = async (proxy: AxiosProxyConfig | false = false) => {
  let handlerService = new HandlerService();
  // console.log(
  //   `~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n`
  // );
  // console.log(`Start Data Collection in https://i.rik.vip/\n`);
  outerLoop: do {
    //0. Initialize Instance
    const site_id = process.env.I_RIK_VIP_ID ? process.env.I_RIK_VIP_ID : ``;
    const site = new IRikvipCc();
    let pingpong: boolean;
    //1. Sign Up
    let account = await site.signUp(proxy);
    if (!account) {
      // console.log(
      //   `You have violated the IP rate limit policy. Please change IP.`
      // );
      break outerLoop;
    }
    await handlerService.storeAccountLogin(account, site_id);
    console.log(`Sign Up i.rik.vip success ${JSON.stringify(account)}`);
    console.log(`====================================================\n`);

    //2. Update User
    pingpong = await site.updateUsername(
      account.username,
      account.token,
      proxy
    );
    if (!pingpong) {
      break outerLoop;
    }
    await delay(500);

    //3. Get List Bank Code
    pingpong = await site.getBankCode(account.token, proxy);
    if (pingpong) {
      // console.log(`Get Bank Code successfully.`);
    }
    innerLoop: do {
      //5. Create Payment
      await delay(500);
      let bank_account = await site.createPayment(account.token, proxy);
      if (!bank_account || bank_account.bank_name == "Vietcombank") {
        // console.log(`Account ${account.username} has been suspended.`);
        // console.log(
        //   `========================================================================================================\n`
        // );
        break innerLoop;
      }
      await handlerService.process(bank_account, site_id);
      // console.log(`Checked\n`);
    } while (true);
  } while (true);
  // console.log(`Stop Data Collection in https://i.rik.vip/`);
  // console.log(
  //   `~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n`
  // );
};
// runIRikvipCc();
