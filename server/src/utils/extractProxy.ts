import axios, { AxiosProxyConfig } from "axios";

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
      if (response.port) {
        return response;
      }
    } while (true);
  } catch (error) {
    return false;
  }
}
