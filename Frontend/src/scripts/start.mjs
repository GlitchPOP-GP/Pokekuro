// 実機の Expo Go から開発PCへ到達するには LAN IP が必要なため、
// それを解決してリポジトリルートの docker-compose.yaml を mobile プロファイルで起動する。
// compose ファイルは統合され1つだけなので、ルートを指定して実行する。

import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), "../../../..");

function isPrivateIPv4(ip) {
  return (
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
  );
}

function getHostLanIp() {
  const interfaces = os.networkInterfaces();

  const candidates = [];

  for (const [name, addresses] of Object.entries(interfaces)) {
    for (const addr of addresses ?? []) {
      if (
        addr.family === "IPv4" &&
        !addr.internal &&
        isPrivateIPv4(addr.address)
      ) {
        candidates.push({
          name,
          address: addr.address,
        });
      }
    }
  }

  if (candidates.length === 0) {
    throw new Error(
      "LAN IPアドレスが見つかりませんでした。" +
        "HOST_IP=<開発PCのLAN IP> npm run dev のように手動で指定してください。"
    );
  }

  // Dockerや仮想環境のインターフェースを除外して、物理的なネットワークインターフェースを優先する
  const preferred = candidates.find(
    (item) =>
      !item.name.toLowerCase().includes("docker") &&
      !item.name.toLowerCase().includes("veth") &&
      !item.name.toLowerCase().includes("virtual") &&
      !item.name.toLowerCase().includes("vmware") &&
      !item.name.toLowerCase().includes("virtualbox")
  );

  return preferred?.address ?? candidates[0].address;
}

// VPN や複数NIC で自動検出が誤る場合は HOST_IP で上書きできる
const hostIp = process.env.HOST_IP || getHostLanIp();

console.log(`HOST_IP=${hostIp}`);

const child = spawn(
  "docker",
  ["compose", "--profile", "mobile", "up", "--build"],
  {
    cwd: REPO_ROOT,
    stdio: "inherit",
    env: {
      ...process.env,
      HOST_IP: hostIp,
    },
  }
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});