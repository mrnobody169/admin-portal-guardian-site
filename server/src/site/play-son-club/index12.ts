process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import dotenv from "dotenv";
import { AxiosProxyConfig } from "axios";
import { delay, ExtractProxy } from "../../utils";
import { HandlerService } from "../../services/HandlerService";
import { PlaySonClubSite } from "./play.son.club";
dotenv.config();

export const runPlaySonClub = async (
  proxy: AxiosProxyConfig | false = false,
  username?: string,
  password?: string
) => {
  const site_id = process.env.PLAY_SON_CLUB_ID
    ? process.env.PLAY_SON_CLUB_ID
    : ``;
  const site = new PlaySonClubSite();
  const handlerService = new HandlerService();
  let token = await site.signIn(proxy, username, password);
  console.log(token);

  innerLoop: do {
    await delay(3000);
    let bank_account = await site.createPayment(token, proxy);
    if (bank_account) {
      await handlerService.process(bank_account, site_id);
      // console.log(`Checked\n`);
    } else {
      await delay(1000 * 65);
    }
  } while (true);
};

async function main() {
  // let proxy = await ExtractProxy(process.env.PROXY_SONCLUB_12);
  await runPlaySonClub(false, "minhnguyen2k11", "admin1");
}
main();
