import axios, { AxiosError, AxiosProxyConfig } from "axios";
import { Agent } from "http";

// Giao diện cho kết quả kiểm tra
interface ProxyCheckResult {
  isWorking: boolean;
  message: string;
  responseTime?: number; // Thời gian phản hồi (ms)
  ip?: string; // IP trả về từ proxy (nếu thành công)
}

export async function checkProxy(
  proxy: AxiosProxyConfig,
  timeout: number = 5000
): Promise<ProxyCheckResult> {
  const startTime = Date.now();

  // Tạo HTTP agent để xử lý kết nối proxy
  const httpAgent = new Agent({
    keepAlive: false, // Tắt keep-alive để tránh lỗi socket hang up
    timeout, // Thời gian timeout cho kết nối
  });

  try {
    // Gửi yêu cầu thử nghiệm đến API công khai (lấy IP)
    const response = await axios.get("https://api.ipify.org?format=json", {
      httpAgent,
      proxy,
      timeout, // Timeout cho toàn bộ yêu cầu
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", // Giả lập trình duyệt
      },
    });

    const responseTime = Date.now() - startTime;

    // Kiểm tra phản hồi
    if (response.status === 200 && response.data?.ip) {
      return {
        isWorking: true,
        message: `Proxy hoạt động tốt. IP: ${response.data.ip}, thời gian phản hồi: ${responseTime}ms`,
        responseTime,
        ip: response.data.ip,
      };
    } else {
      return {
        isWorking: false,
        message: `Proxy trả về mã trạng thái không mong muốn: ${response.status}`,
      };
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    let message = "Proxy không hoạt động: ";

    if (
      axiosError.code === "ECONNRESET" ||
      axiosError.message.includes("socket hang up")
    ) {
      message +=
        "Lỗi socket hang up. Proxy có thể bị chặn hoặc không phản hồi.";
    } else if (axiosError.code === "ETIMEDOUT") {
      message +=
        "Hết thời gian chờ (timeout). Proxy quá chậm hoặc không phản hồi.";
    } else if (axiosError.response) {
      message += `Server trả về lỗi: ${axiosError.response.status} - ${axiosError.response.statusText}`;
    } else {
      message += axiosError.message;
    }

    return {
      isWorking: false,
      message,
    };
  } finally {
    // Đảm bảo hủy agent để giải phóng tài nguyên
    httpAgent.destroy();
  }
}
