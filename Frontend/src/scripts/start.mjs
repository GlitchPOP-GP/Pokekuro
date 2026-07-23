import os from "node:os";
import { spawn } from "node:child_process";

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
    throw new Error("LAN IPアドレスが見つかりませんでした。");
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

const hostIp = getHostLanIp();

console.log(`HOST_IP=${hostIp}`);

const child = spawn("docker", ["compose", "up", "--build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    HOST_IP: hostIp,
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});