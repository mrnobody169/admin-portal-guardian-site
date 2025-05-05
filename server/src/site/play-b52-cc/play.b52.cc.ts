process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { randomUUID } from "crypto";
import http from "http";
import axios, { AxiosProxyConfig } from "axios";
import * as fs from "fs";
import {
  generateSecChUa,
  generateSecurePassword,
  generateUserAgent,
  generateVietnameseUsername,
  readJsonFile,
} from "../../utils";
import {
  IBankCodePlayB52,
  IDepositResponse,
  ISignUpResponse,
} from "../../interfaces";

export class PlayB52Cc {
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
      await readJsonFile<IBankCodePlayB52>(`${__dirname}/bank_code_b52.json`)
    )?.rows;
    const filteredBanks = banks.filter(
      (bank) =>
        bank.nicepay_code && !["MB", "NAB", "DAB"].includes(bank.nicepay_code)
    );

    if (filteredBanks.length === 0) {
      return `VCB`;
    }

    const randomIndex = Math.floor(Math.random() * filteredBanks.length);
    return filteredBanks[randomIndex].nicepay_code as string;
  }

  async signUp(
    proxy: AxiosProxyConfig | false = false
  ): Promise<ISignUpResponse | undefined> {
    try {
      let username = generateVietnameseUsername();
      let password = generateSecurePassword();

      let url =
        `${process.env.PLAY_B52_CC_SIGN_UP_URL}` ||
        "https://bfivegwlog.gwtenkges.com/user/register.aspx";
      let data = JSON.stringify({
        fullname: username,
        username: username,
        password: password,
        app_id: "b52.club",
        avatar: "Avatar35",
        os: "Windows",
        device: "Computer",
        browser: "chrome",
        fg: this.fg,
        aff_id: "b52",
        version: "1.72.1",
      });

      let config = {
        maxBodyLength: Infinity,
        proxy,
        httpAgent: this.httpAgent,
        headers: {
          accept: "*/*",
          "accept-language": "vi,en-US;q=0.9,en;q=0.8,fr-FR;q=0.7,fr;q=0.6",
          "content-type": "text/plain;charset=UTF-8",
          origin: "https://play.b52.cc",
          priority: "u=1, i",
          referer: "https://play.b52.cc/",
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
    } catch (error) {}
  }

  async updateUsername(
    username: string,
    token: string,
    proxy: AxiosProxyConfig | false = false
  ) {
    let data = JSON.stringify({
      fullname: `${username.slice(0, 6)}${Math.floor(
        100 + Math.random() * 900
      )} `,
      aff_id: "",
    });
    let url =
      `${process.env.PLAY_B52_CC_UPDATE_USERNAME_URL}` ||
      "https://bfivegwlog.gwtenkges.com/user/update.aspx";
    let config = {
      proxy,
      httpAgent: this.httpAgent,
      maxBodyLength: Infinity,
      headers: {
        accept: "*/*",
        "accept-language": "vi,en-US;q=0.9,en;q=0.8,fr-FR;q=0.7,fr;q=0.6",
        "content-type": "application/json",
        origin: "https://play.b52.cc",
        priority: "u=1, i",
        referer: "https://play.b52.cc/",
        "sec-ch-ua": this.secChUa,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": this.userAgent,
        "x-token": token,
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
      `${process.env.PLAY_B52_CC_GET_BANK_CODE_URL}${token}` ||
      `https://bfivegwpeymint.gwtenkges.com/payment/np/status?xtoken=${token}`;

    let config = {
      maxBodyLength: Infinity,
      proxy,
      httpAgent: this.httpAgent,
      headers: {
        accept: "*/*",
        "accept-language": "vi,en-US;q=0.9,en;q=0.8,fr-FR;q=0.7,fr;q=0.6",
        origin: "https://play.b52.cc",
        priority: "u=1, i",
        referer: "https://play.b52.cc/",
        "sec-ch-ua": this.secChUa,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": this.userAgent,
        "x-token": token,
      },
    };
    let responseApi = await axios
      .get(url, config)
      .then((response) => {
        return response.data;
      })
      .catch((error: any) => {
        console.log(`Get Bank Code Failed: ${error?.message}`);
      });
    if (responseApi) {
      const jsonString = JSON.stringify(responseApi, null, 2);
      fs.writeFileSync(__dirname + "\\bank_code_b52.json", jsonString);
    }
    return responseApi;
  }

  async createPayment(
    token: string,
    proxy: AxiosProxyConfig | false = false
  ): Promise<IDepositResponse | undefined> {
    try {
      let amount = Math.floor(100000 + Math.random() * 900000);
      let bank_code = await this.getRandomNicepayCode();

      let data = JSON.stringify({
        amount,
        bank_code,
      });
      let url =
        `${process.env.PLAY_B52_CC_CREATE_PAYMENT_URL}${token}` ||
        `https://bfivegwpeymint.gwtenkges.com/payment/np?xtoken=${token}`;
      let config = {
        proxy,
        httpAgent: this.httpAgent,
        maxBodyLength: Infinity,
        headers: {
          accept: "*/*",
          "accept-language": "vi,en-US;q=0.9,en;q=0.8,fr-FR;q=0.7,fr;q=0.6",
          "content-type": "application/json",
          origin: "https://play.b52.cc",
          priority: "u=1, i",
          referer: "https://play.b52.cc/",
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
        .post(url, data, config)
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
        account_no: responseApi.rows.bank_account_no,
        account_holder: responseApi.rows.bank_account_name,
        bank_name: responseApi.rows.bank_name,
        bank_code: responseApi.rows?.bank_code,
        code: responseApi.rows.code,
      };
      console.log(`Checking: ${JSON.stringify(response)}`);

      return response;
    } catch (error) {}
  }

  async cancelPayment(
    code: string,
    token: string,
    proxy: AxiosProxyConfig | false = false
  ) {
    let data = JSON.stringify({ code });
    let url =
      `${process.env.PLAY_B52_CC_CANCEL_PAYMENT_URL}${token}` ||
      `https://bfivegwpeymint.gwtenkges.com/payment/np/cancel?xtoken=${token}`;
    let config = {
      maxBodyLength: Infinity,
      proxy,
      httpAgent: this.httpAgent,
      headers: {
        accept: "*/*",
        "accept-language": "vi,en-US;q=0.9,en;q=0.8,fr-FR;q=0.7,fr;q=0.6",
        "content-type": "application/json",
        origin: "https://play.b52.cc",
        priority: "u=1, i",
        referer: "https://play.b52.cc/",
        "sec-ch-ua": this.secChUa,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": this.userAgent,
        "x-token": token,
      },
    };
    var responseApi = await axios
      .post(url, data, config)
      .then((response) => {
        return JSON.stringify(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
    return responseApi;
  }
}
