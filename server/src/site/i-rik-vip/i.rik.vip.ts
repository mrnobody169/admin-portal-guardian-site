process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { randomUUID } from "crypto";
import http from "http";
import axios, { AxiosProxyConfig } from "axios";
import * as fs from "fs";
import {
  generateUserAgent,
  generateSecChUa,
  generateSecurePassword,
  generateVietnameseUsername,
  readJsonFile,
} from "../../utils";
import {
  IBankCodeIRikvip,
  IDepositResponse,
  IMomoResponseIRikvip,
  ISignUpResponse,
} from "../../interfaces";

export class IRikvipCc {
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
      await readJsonFile<IBankCodeIRikvip>(`${__dirname}/bank_code_rikvip.json`)
    )?.rows;
    const filteredBanks = banks.filter(
      (bank) =>
        bank.bankcode && !["MB", "NAB", "DAB", "VCB"].includes(bank.bankcode)
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
    try {
      let username = generateVietnameseUsername();
      let password = generateSecurePassword();

      let url = "https://bordergw.api-inovated.com/user/register.aspx";
      let data = JSON.stringify({
        fullname: username,
        username: username,
        password: password,
        app_id: "rik.vip",
        avatar: "Avatar7",
        os: "Windows",
        device: "Computer",
        browser: "chrome",
        fg: this.fg,
        aff_id: "RIKVIP",
        version: "2.221.2",
      });

      let config = {
        maxBodyLength: Infinity,
        proxy,
        httpAgent: this.httpAgent,
        headers: {
          accept: "*/*",
          "accept-language":
            "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
          "content-type": "text/plain;charset=UTF-8",
          priority: "u=1, i",
          "sec-ch-ua": this.secChUa,
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "user-agent": this.userAgent,
          Referer: "https://i.rik.vip/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
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
    let url = "https://bordergw.api-inovated.com/user/update.aspx";
    let config = {
      proxy,
      httpAgent: this.httpAgent,
      maxBodyLength: Infinity,
      headers: {
        accept: "*/*",
        "accept-language":
          "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
        "content-type": "application/json",
        origin: "https://i.rik.vip",
        priority: "u=1, i",
        referer: "https://i.rik.vip/",
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

  async getMomo(token: string, proxy: AxiosProxyConfig | false = false) {
    let url = `https://baymentes.gwrykgems.net/payment/bam?xtoken==${token}`;
    let config = {
      maxBodyLength: Infinity,
      proxy,
      httpAgent: this.httpAgent,
      headers: {
        accept: "*/*",
        "accept-language":
          "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-ch-ua": this.secChUa,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": this.userAgent,
        "x-token": token,
        Referer: "https://i.rik.vip/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    };
    var responseApi = await axios
      .post(url, null, config)
      .then((response) => {
        return response.data;
      })
      .catch((error: any) => {
        console.log(`Get Momo Data Failed: ${error?.message}`);
      });

    if (!responseApi?.rows) {
      return undefined;
    }
    let response: IMomoResponseIRikvip = responseApi;
    return response;
  }

  async getBankCode(token: string, proxy: AxiosProxyConfig | false = false) {
    let url = `https://baymentes.gwrykgems.net/payment/bnp?xtoken=${token}`;
    let config = {
      maxBodyLength: Infinity,
      proxy,
      httpAgent: this.httpAgent,
      headers: {
        accept: "*/*",
        "accept-language":
          "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
        "content-type": "application/json",
        priority: "u=1, i",
        "sec-ch-ua": this.secChUa,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": this.userAgent,
        "x-token": token,
        Referer: "https://i.rik.vip/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    };
    let responseApi = await axios
      .post(url, config)
      .then((response) => {
        return response.data;
      })
      .catch((error: any) => {
        console.log(`Get Bank Code Failed: ${error?.message}`);
      });
    if (responseApi) {
      const jsonString = JSON.stringify(responseApi, null, 2);
      fs.writeFileSync(__dirname + "\\bank_code_rikvip.json", jsonString);
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
      let url = `https://baymentes.gwrykgems.net/payment/np?xtoken=${token}`;
      let config = {
        proxy,
        httpAgent: this.httpAgent,
        maxBodyLength: Infinity,
        headers: {
          accept: "*/*",
          "accept-language":
            "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
          "content-type": "application/json",
          origin: "https://i.rik.vip",
          priority: "u=1, i",
          referer: "https://i.rik.vip/",
          "sec-ch-ua": this.secChUa,
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "user-agent": this.userAgent,
          "X-Token": `${token}`,
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
        account_no: responseApi.rows?.account_no,
        account_holder: responseApi.rows?.account_name,
        bank_name: responseApi.rows?.bank_name,
        bank_code: responseApi.rows?.bank_code,
        code: responseApi.rows?.code,
      };
      console.log(`Checking bank account: ${JSON.stringify(response)}`);
      return response;
    } catch (error) {}
  }
}
