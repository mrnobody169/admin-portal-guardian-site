import axios, { AxiosProxyConfig } from "axios";

export async function ExtractProxy(): Promise<AxiosProxyConfig | false> {
  try {
    if (!process.env.PROXY) {
      return false;
    }
    const responseApi = await axios
      .get(`${process.env.PROXY}`)
      .then((res) => {
        return res.data;
      })
      .catch((e: any) => {
        console.log(`Error in ExtractProxy: ${e?.message}`);
      });
    let proxy = `${responseApi}`.trim();

    if (Number(proxy.split(":")[1]) != Number(process.env.PROXY_PORT)) {
      return false;
    }

    let response: AxiosProxyConfig = {
      host: proxy.split(":")[0],
      port: Number(proxy.split(":")[1]),
      protocol: "http",
    };
    return response;
  } catch (error) {
    return false;
  }
}
