import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";

// Điền danh sách proxy
// proxy có user:passs  "http://user:pass@sp08-06.proxy.mkvn.net:13882"

const proxies = ["http://152.213.194.240:3128", "http://101.207.44.3:3128"];
const addresss = [
  "0xbecfd3de527f4d34bd9cd3f86c4065d0029a4653b7a4037e91ba273e9110e076",
  "0xd8d71b2860eaf2b50ac54cb86b23ee8962c0531ab6329d893f3e3580a0c76a4a",
];

const airdrop101Random = (array: any) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

async function main() {
  try {
    const axiosInstance = axios.create({
      httpsAgent: new HttpsProxyAgent(airdrop101Random(proxies)),
    });
    await getIp(axiosInstance);
    const recipient = airdrop101Random(addresss);
    console.log(`Tổng sui ${recipient}:`, await checkSuiBalance(recipient));
    console.log("Đang faucet...");
    const { data } = await axiosInstance.post(
      "https://faucet.testnet.sui.io/v1/gas",
      {
        FixedAmountRequest: {
          recipient,
        },
      }
    );
    if (!data.error) {
      console.log(
        "<================== Faucet thành công ==================>\n"
      );
    }
  } catch (error: any) {
    console.log("Faucet thất bại: ", error?.response?.data, "\n\n");
  }
}

async function getIp(axiosInstance: any) {
  try {
    const response = await axiosInstance.get(
      "https://api64.ipify.org?format=json"
    );
    console.log("Địa chỉ IP hiện tại:", response.data.ip);
    return response.data.ip;
  } catch (error: any) {
    console.error("Lỗi khi lấy địa chỉ IP:", error.message);
  }
}
setInterval(() => {
  main();
}, 20000);

async function checkSuiBalance(address: any) {
  const rpcUrl = "https://fullnode.testnet.sui.io:443";

  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "suix_getBalance",
        params: [address],
      }),
    });

    const data = await response.json();
    const balanceMist = BigInt(data.result.totalBalance);
    const balanceSui = Number(balanceMist) / 10 ** 9;

    return balanceSui;
  } catch (error) {
    console.error("Balance check failed:", error);
    return null;
  }
}
