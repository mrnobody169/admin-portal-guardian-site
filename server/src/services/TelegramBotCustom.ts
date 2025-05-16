import axios from "axios";

export class TelegramBotCustom {
  sendMessage = async (message: any) => {
    let data = JSON.stringify({
      message,
    });

    let url = "http://localhost:3000/send-message";
    let config = {
      maxBodyLength: Infinity,
      headers: {
        "Content-Type": "application/json",
      },
    };

    return await axios
      .post(url, data, { ...config, timeout: 10000 })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error?.message);
      });
  };

  async logBankAccount(
    site: string,
    account_no: string,
    account_holder: string,
    bank_name: string,
    old_time?: string
  ): Promise<boolean> {
    let message = `
<b>Checking:</b>

<b>Cổng:</b> ${site}
<b>Ngân hàng:</b> ${bank_name}
<b>Chủ TK:</b> ${account_holder}
<b>Số TK:</b> ${account_no}
<i>Ngày cập nhật: ${new Date().toLocaleString()}</i>
`;
    if (old_time) {
      message += `<b>Đã tồn tại: </b> ${old_time ?? ""}`;
    }
    return await this.sendMessage(message);
  }
}
