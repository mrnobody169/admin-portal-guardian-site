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
  delay,
} from "../../utils";
import { IDepositResponse } from "../../interfaces";

export class PlaySonClubSite {
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

  async createPayment(
    token: string,
    proxy: AxiosProxyConfig | false = false
  ): Promise<any | undefined> {
    let amount = Math.floor(100000 + Math.random() * 900000);
    let url = `https://portal.taison01.com/api/charge/getInfor?amount=${amount}&chargeType=bank&subType=VCB&access_token=${token}`;
    let config = {
      proxy,
      httpAgent: this.httpAgent,
      timeout: 30000,
      maxBodyLength: Infinity,
      headers: {
        accept: "*/*",
        "accept-language": "vi,en-US;q=0.9,en;q=0.8,fr-FR;q=0.7,fr;q=0.6",
        "content-type": "application/json; charset=UTF-8",
        origin: "https://play.son13.club",
        priority: "u=1, i",
        referer: "https://play.son13.club/",
        "sec-ch-ua": this.secChUa,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "sec-fetch-storage-access": "active",
        "user-agent": this.userAgent,
      },
    };

    let responseApi = await axios
      .get(url, { ...config, timeout: 10000 })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error?.message);
      });

    if (
      responseApi?.ResponseCode == -166 ||
      responseApi?.Message ==
        "Bạn đã tạo quá nhiều lệch trong! vui lòng thử lại sau 1 phút!" ||
      !responseApi?.Data
    ) {
      console.log(responseApi?.Message);
      return undefined;
    }

    if (!responseApi?.Data?.phoneNum) {
      return undefined;
    }
    let response: IDepositResponse = {
      account_no: responseApi?.Data?.phoneNum ?? "1",
      account_holder: responseApi?.Data?.phoneName ?? "1",
      bank_name: responseApi?.Data?.bank_provider ?? "1",
      bank_code: responseApi?.Data?.subType ?? "1",
      code: responseApi?.Data?.chargeCode ?? "1",
    };
    console.log(
      `At ${new Date().toLocaleString()} - ${
        response.bank_name ?? response.bank_code
      } - ${response.account_holder} - ${response.account_no}`
    );
    return response;
  }

  async signIn(
    proxy: AxiosProxyConfig | false = false,
    username?: string,
    password?: string
  ) {
    let data = {
      LoginType: 1,
      UserName: username ?? "tinhnv2k0",
      Password: password ?? "yeuem123",
      DeviceId: this.fg,
      DeviceType: 1,
      PackageName: "http://null",
    };

    let url = "https://portal.taison01.com/api/Account/Login";

    let config = {
      proxy,
      httpAgent: this.httpAgent,
      maxBodyLength: Infinity,
      headers: {
        accept: "*/*",
        "accept-language": "vi,en-US;q=0.9,en;q=0.8,fr-FR;q=0.7,fr;q=0.6",
        "content-type": "application/json; charset=UTF-8",
        origin: "https://play.son13.club",
        priority: "u=1, i",
        referer: "https://play.son13.club/",
        "sec-ch-ua": this.secChUa,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "sec-fetch-storage-access": "active",
        "user-agent": this.userAgent,
      },
    };

    let responseApi = await axios
      .post(url, data, config)
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
      });

    return responseApi?.Token ? responseApi?.Token : undefined;
  }

  async login(username: string, password: string) {
    let url = "https://portal.taison01.com/api/Account/Login";
    let dataOrigin = {
      LoginType: 1,
      UserName: username,
      Password: password,
      DeviceId: randomUUID().toString(),
      DeviceType: 1,
      PackageName: "http://null",
    };
    let data = JSON.stringify(dataOrigin);
    let headers = {
      authority: "portal.taison01.com",
      accept: "*/*",
      "accept-language":
        "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
      "content-type": "application/json; charset=UTF-8",
      origin: "https://play.son.club",
      referer: "https://play.son.club/",
      "sec-ch-ua": generateSecChUa(),
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "user-agent": generateUserAgent(),
    };
    var response = await axios
      .post(url, data, { headers, maxBodyLength: Infinity })
      .then((response) => {
        return response.data.Token;
      })
      .catch((error) => {
        console.log(error);
      });
    return response;
  }

  async getBankInfo(token: string): Promise<any> {
    let amount = Math.floor(100000 + Math.random() * 900000);
    let url = `https://portal.taison01.com/api/charge/getInfor?amount=${amount}&chargeType=bank&subType=VCB&access_token=${token}`;

    let config = {
      maxBodyLength: Infinity,
      headers: {
        authority: "portal.taison01.com",
        accept: "*/*",
        "accept-language":
          "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
        "content-type": "application/json; charset=UTF-8",
        origin: "https://play.son.club",
        referer: "https://play.son.club/",
        "sec-ch-ua": generateSecChUa(),
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "user-agent": generateUserAgent(),
      },
    };

    let response = await axios
      .get(url, config)
      .then((response) => {
        if (response.data.Data?.chargeCode) {
          return {
            chargeCode: response.data.Data?.chargeCode,
            chargeAmount: response.data.Data?.chargeAmount,
            bank_name: response.data.Data?.bank_provider,
            account_no: response.data.Data?.phoneNum,
            account_name: response.data.Data?.phoneName,
            timeToExpired: response.data.Data?.timeToExpired,
          };
        }
        return false;
      })
      .catch((error) => {
        console.log(error);
      });
    return response;
  }

  async getListBankCode(token: string) {
    let url = ` https://portal.taison01.com/api/charge/getListBank?access_token=${token}`;
    let headers = {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9,vi;q=0.8",
      "content-type": "application/json; charset=UTF-8",
      "sec-ch-ua":
        '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "sec-fetch-storage-access": "active",
      Referer: "https://play.son.club/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    };
    var data = await axios
      .get(url, { headers, maxBodyLength: Infinity })
      .then((response) => {
        return response.data.Orders;
      })
      .catch((error) => {
        console.log(error);
      });
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(__dirname + "\\bankcode_playsonclub.json", jsonString);
    return data;
  }
}
