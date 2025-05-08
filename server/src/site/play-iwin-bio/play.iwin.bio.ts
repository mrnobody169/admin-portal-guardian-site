process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import axios, { AxiosProxyConfig } from "axios";
import http from "http";
import { randomUUID } from "crypto";
import * as fs from "fs";
import {
  generateSecChUa,
  generateSecurePassword,
  generateUserAgent,
  generateVietnameseUsername,
  readJsonFile,
} from "../../utils";
import {
  IBankCodePlayIwin,
  IDepositResponse,
  ISignUpResponse,
} from "../../interfaces";

export class PlayIwinBioSite {
  private httpAgent: http.Agent;
  private fg: string;
  private userAgent: string;
  private secChUa: string;
  constructor() {
    this.httpAgent = new http.Agent({
      keepAlive: true, // Keep connections alive for reuse
      maxSockets: 10, // Maximum number of concurrent sockets
      timeout: 60000, // 60 seconds timeout
    });
    this.fg = randomUUID().toString();
    this.userAgent = generateUserAgent();
    this.secChUa = generateSecChUa();
  }
  private async getRandomNicepayCode(): Promise<string> {
    const banks = (
      await readJsonFile<IBankCodePlayIwin>(
        `${__dirname}/bank_code_playiwin.json`
      )
    )?.rows;
    const filteredBanks = banks.filter(
      (bank) => bank.bankcode && !["MB", "NAB", "DAB"].includes(bank.bankcode)
    );

    if (filteredBanks.length === 0) {
      return `VCB`;
    }

    const randomIndex = Math.floor(Math.random() * filteredBanks.length);
    return filteredBanks[randomIndex].bankcode as string;
  }

  async signUp(
    proxy: AxiosProxyConfig | false = false
  ): Promise<ISignUpResponse | undefined> {
    let username = generateVietnameseUsername();
    let password = generateSecurePassword();
    let url =
      `${process.env.PLAY_IWIN_BIO_SIGN_UP_URL}` ||
      "https://getquayaybiai.gwyqinbg.com/user/register.aspx";
    let data = JSON.stringify({
      fullname: username,
      username: username,
      password: password,
      app_id: "iwin.club",
      avatar: "Avatar_22",
      os: "Windows",
      device: "Computer",
      browser: "chrome",
      fg: this.fg,
      aff_id: "iwin",
      version: "2.31.1",
    });
    let config = {
      maxBodyLength: Infinity,
      proxy,
      httpAgent: this.httpAgent,
      headers: {
        authority: "getquayaybiai.gwyqinbg.com",
        accept: "*/*",
        "accept-language":
          "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
        "content-type": "text/plain;charset=UTF-8",
        origin: "https://play.iwin.bio",
        referer: "https://play.iwin.bio/",
        "sec-ch-ua": this.secChUa,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": this.userAgent,
      },
    };

    let responseApi = await axios
      .post(url, data, config)
      .then((response) => {
        return response.data;
      })
      .catch((error: any) => {
        console.log(error?.message);
      });

    if (!responseApi?.data || !responseApi?.data[0]?.session_id) {
      return undefined;
    }

    let response: ISignUpResponse = {
      token: responseApi?.data[0]?.session_id,
      username,
      password,
    };
    return response;
  }

  async updateUsername(
    username: string,
    xtoken: string,
    proxy: AxiosProxyConfig | false = false
  ) {
    let url =
      `${process.env.PLAY_IWIN_BIO_UPDATE_USERNAME_URL}` ||
      "https://getquayaybiai.gwyqinbg.com/user/update.aspx";
    let data = JSON.stringify({
      fullname: `${username.slice(0, 6)}${Math.floor(
        100 + Math.random() * 900
      )} `,
    });

    let config = {
      proxy,
      httpAgent: this.httpAgent,
      maxBodyLength: Infinity,
      headers: {
        authority: "getquayaybiai.gwyqinbg.com",
        accept: "*/*",
        "accept-language":
          "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
        "content-type": "application/json",
        origin: "https://play.iwin.bio",
        referer: "https://play.iwin.bio/",
        "sec-ch-ua": this.secChUa,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": this.userAgent,
        "x-token": xtoken,
      },
    };

    let responseApi = await axios
      .post(url, data, config)
      .then((response) => {
        return response.data;
      })
      .catch((error: any) => {
        console.log(`Update User Failed: ${error?.message}`);
      });
    if (responseApi?.code != 200) {
      return false;
    }
    return true;
  }

  async getBankCode(token: string, proxy: AxiosProxyConfig | false = false) {
    let url =
      `${process.env.PLAY_IWIN_BIO_GET_BANK_CODE_URL}${token}` ||
      `https://baymentgwapy.gwyqinbg.com/payment/bnp?xtoken=${token}`;
    let config = {
      maxBodyLength: Infinity,
      proxy,
      httpAgent: this.httpAgent,
      headers: {
        accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
        Connection: "keep-alive",
        "content-length": "0",
        "content-type": "application/json",
        origin: "https://play.iwin.bio",
        referer: "https://play.iwin.bio/",
        "sec-ch-ua": this.secChUa,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": this.userAgent,
        "X-TOKEN": `${token}`,
      },
    };
    let responseApi = await axios
      .post(url, null, config)
      .then((response) => {
        return response.data;
      })
      .catch((error: any) => {
        console.log(`Get Bank Code Failed: ${error?.message}`);
      });

    if (!responseApi?.rows) {
      return false;
    }
    const jsonString = JSON.stringify(responseApi, null, 2);
    fs.writeFileSync(__dirname + "\\bank_code_playiwin.json", jsonString);
    return true;
  }

  async createPayment(
    token: string,
    proxy: AxiosProxyConfig | false = false
  ): Promise<IDepositResponse | undefined> {
    let amount = Math.floor(100000 + Math.random() * 900000);
    let bank_code = await this.getRandomNicepayCode();
    let data = JSON.stringify({
      amount: amount,
      bank_code: bank_code,
    });

    let url =
      `${process.env.PLAY_IWIN_BIO_CREATE_PAYMENT_URL}${token}` ||
      `https://baymentgwapy.gwyqinbg.com/payment/np?xtoken=${token}`;
    let config = {
      maxBodyLength: Infinity,
      proxy,
      httpAgent: this.httpAgent,
      headers: {
        authority: "baymentgwapy.gwyqinbg.com",
        accept: "*/*",
        "accept-language":
          "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
        "content-type": "application/json",
        origin: "https://play.iwin.bio",
        referer: "https://play.iwin.bio/",
        "sec-ch-ua": this.secChUa,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": this.userAgent,
        "x-token": `${token}`,
      },
    };

    let responseApi = await axios
      .post(url, data, { ...config, timeout: 60000 })
      .then((response) => {
        return response.data;
      })
      .catch((error: any) => {
        console.log(`Create Payment Failed:`, error?.message);
      });

    if (!responseApi?.rows) {
      return undefined;
    }

    let response: IDepositResponse = {
      account_no: responseApi.rows.account_no,
      account_holder: responseApi.rows.account_name,
      bank_name: responseApi.rows.bank_name,
      bank_code: responseApi.rows?.bank_code,
      code: responseApi.rows.code,
    };
    console.log(`Checking: ${JSON.stringify(response)}`);
    return response;
  }
}
