
import axios from 'axios';
import dotenv from 'dotenv';

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
        console.error('Telegram configuration missing. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env file');
        return false;
      }

      await axios.post(this.apiUrl, {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML'
      });

      console.log('Telegram notification sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      return false;
    }
  }

  async notifyNewBankAccount(site: string, account_no: string, account_holder: string, bank_name: string): Promise<boolean> {
    const message = `
<b>🏦 New Bank Account Added</b>

<b>Site:</b> ${site}
<b>Account Number:</b> ${account_no}
<b>Account Holder:</b> ${account_holder}
<b>Bank Name:</b> ${bank_name}

<i>Added on: ${new Date().toLocaleString()}</i>
`;

    return this.sendMessage(message);
  }
}
