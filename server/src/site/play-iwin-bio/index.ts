process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { PlayIwinBioSite } from "./play.iwin.bio";
import dotenv from "dotenv";
import { AxiosProxyConfig } from "axios";
import { delay } from "../../utils";
import { HandlerService } from "../../services/HandlerService";
dotenv.config();

export const runPlayIwinBio = async (
  proxy: AxiosProxyConfig | false = false
) => {
  // console.log(`Start Data Collection in https://play.iwin.bio/`);
  outerLoop: do {
    const site_id = process.env.PLAY_IWIN_BIO_ID
      ? process.env.PLAY_IWIN_BIO_ID
      : ``;
    const site = new PlayIwinBioSite();
    const handlerService = new HandlerService();
    let pingpong: boolean;

    //1. Sign Up
    let account = await site.signUp(proxy);
    if (!account) {
      // console.log(`You have created too many accounts, please change proxy.`);
      // console.log(`====================================================\n`);
      break outerLoop;
    }
    console.log(`Sign Up play.iwin.bio success ${JSON.stringify(account)}`);

    //2. Update User
    pingpong = await site.updateUsername(
      account.username,
      account.token,
      proxy
    );
    if (pingpong) {
      // console.log(`Update User successfully.`);
    }
    await delay(2000);
    //3. Get List Bank Code
    pingpong = await site.getBankCode(account.token, proxy);
    if (pingpong) {
      // console.log(`Get Bank Code successfully.`);
    }
    innerLoop: do {
      //5. Create Payment
      await delay(500);
      let bank_account = await site.createPayment(account.token, proxy);
      if (!bank_account) {
        // console.log(`Account ${account.username} has been suspended.`);
        break innerLoop;
      }
      await handlerService.process(bank_account, site_id);
    } while (true);
  } while (true);
  // console.log(`Stop Data Collection in https://play.iwin.bio/`);
};

