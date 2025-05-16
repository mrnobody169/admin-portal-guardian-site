import axios, { AxiosProxyConfig } from "axios";
import { checkProxy } from "./ProxyHealthChecking";
import { delay } from "./delay";

export async function ExtractProxy(
  url?: string
): Promise<AxiosProxyConfig | false> {
  try {
    if (!url) {
      return false;
    }
    do {
      const responseApi = await axios
        .get(url)
        .then((res) => {
          return res.data;
        })
        .catch((e: any) => {
          console.log(`Error in ExtractProxy: ${e?.message}`);
        });
      let proxy = `${responseApi}`.trim();

      let response: AxiosProxyConfig = {
        host: proxy.split(":")[0],
        port: Number(proxy.split(":")[1]),
        protocol: "http",
      };
      await delay(2000);
      if (response.port) {
        let healthProxy = await checkProxy(response);
        if (healthProxy.isWorking) {
          return response;
        }
      }
    } while (true);
  } catch (error) {
    return false;
  }
}
