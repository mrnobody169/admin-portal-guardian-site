import axios from "axios";
import dotenv from "dotenv";
import { delay } from "../utils";

dotenv.config();

export class TelegramService {
  private token: string | undefined;
  private chatId: string | undefined;
  private apiUrl: string;

  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    this.apiUrl = `https://api.telegram.org/bot${this.token}/sendMessage`;
  }

  async sendMessage(message: string): Promise<boolean> {
    try {
      if (!this.token || !this.chatId) {
        console.error(
          "Telegram configuration missing. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env file"
        );
        return false;
      }
      await delay(500);
      await axios.post(this.apiUrl, {
        chat_id: this.chatId,
        text: message,
        parse_mode: "HTML",
      });

      return true;
    } catch (error: any) {
      console.error("Failed to send Telegram notification:",  error?.message);
      return false;
    }
  }

  async notifyNewBankAccount(
    site: string,
    account_no: string,
    account_holder: string,
    bank_name: string
  ): Promise<boolean> {
    const message = `
<b>🏦 Tài khoản mới cập nhật:</b>

<b>Cổng:</b> ${site}
<b>Ngân hàng:</b> ${bank_name}
<b>Chủ TK:</b> ${account_holder}
<b>Số TK:</b> ${account_no}
<i>Ngày cập nhật: ${new Date().toLocaleString()}</i>
`;

    return await this.sendMessage(message);
  }
}
