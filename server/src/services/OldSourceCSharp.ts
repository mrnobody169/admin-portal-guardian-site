import axios from "axios";

export class OldSourceCSharp {
  public async signIn(): Promise<string> {
    let url = `https://crawl-759641029542.asia-southeast1.run.app/api/Users/login`;
    let data = JSON.stringify({
      email: "admin@gmail.com",
      password: "123456aA@",
    });
    let config = {
      maxBodyLength: Infinity,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    let response = await axios
      .post(url, data, config)
      .then((response) => {
        return response.data.accessToken || "";
      })
      .catch((error) => {
        console.log(error);
      });
    return response;
  }

  public async findByAccountNo(
    account_no: string,
    token: string
  ): Promise<any> {
    try {
      let url = `https://crawl-759641029542.asia-southeast1.run.app/api/BankAccs/${account_no}`;
      let config = {
        maxBodyLength: Infinity,
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      return await axios
        .get(url, config)
        .then((response) => {
          if (response.data) {
            return response.data;
          }
          return null;
        })
        .catch((error) => {});
    } catch (error: any) {
      console.log(console.log(error?.message));
    }
  }

  public async create(
    token: string,
    body: {
      siteId: string;
      bankName: string;
      accountName: string;
      accountNumber: string;
    }
  ): Promise<any> {
    let old_site_id;
    switch (body.siteId) {
      case "i-rik-vip":
        old_site_id = "019677b6-4718-7795-a9c9-ce4f9ae4a13e";
        break;
      case "play-iwin-bio":
        old_site_id = "0196535e-8267-7c50-a0aa-cb74a29f3727";
        break;
      case "play-b52-cc":
        old_site_id = "01966155-4189-7f11-90b9-3f7691ef6a7d";
        break;
      default:
        old_site_id = "01966155-4189-7f11-90b9-3f7691ef6a7d";
        break;
    }
    let data = JSON.stringify({
      siteId: old_site_id,
      bankName: body.bankName,
      accountName: body.accountName,
      accountNumber: body.accountNumber,
    });

    let url = `https://crawl-759641029542.asia-southeast1.run.app/api/BankAccs`;
    let config = {
      maxBodyLength: Infinity,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
    return await axios
      .post(url, data, config)
      .then((response) => {
        return JSON.stringify(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
