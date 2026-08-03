// check-host.mjs — Expo 起動前に REACT_NATIVE_PACKAGER_HOSTNAME の妥当性を見る。
//
// この値はコンテナ生成時に固定されるため、開発PCの LAN IP が変わると
// QR が到達不能なアドレスを指したまま「一見正常に」起動してしまう。
// 実機で読んで初めて気づくことになるので、ここで先に警告する。
//
// コンテナからホストの LAN IP には到達できる（Docker Desktop 経由で往復する）ので、
// api の /health を叩けば「その IP が今も生きているか」を判定できる。

import net from "node:net";

const host = process.env.REACT_NATIVE_PACKAGER_HOSTNAME || "";
const port = Number(process.env.EXPO_PUBLIC_API_PORT || 8001);

const banner = (msg) => {
  const line = "=".repeat(70);
  console.log(`\n${line}\n${msg}\n${line}\n`);
};

if (!host || host === "localhost") {
  banner(
    "[警告] HOST_IP が設定されていません。\n" +
      "QR が localhost を指すため、実機の Expo Go からは到達できません。\n" +
      "  .env の HOST_IP を書いて docker compose --profile mobile up -d"
  );
  process.exit(0);
}

const socket = net.createConnection({ host, port, timeout: 4000 });

socket.on("connect", () => {
  console.log(`[check-host] OK: ${host}:${port} に到達できました`);
  socket.destroy();
  process.exit(0);
});

const fail = () => {
  socket.destroy();
  banner(
    `[警告] ${host}:${port} に到達できません。\n` +
      "開発PCの LAN IP が変わった可能性が高いです（この値はコンテナ生成時に固定されます）。\n" +
      "実機から接続できない場合は、IP を取り直してコンテナを作り直してください:\n" +
      "  .env の HOST_IP を書いて docker compose --profile mobile up -d"
  );
  process.exit(0); // 起動自体は止めない（api がまだ立ち上がっていないだけの場合もある）
};

socket.on("timeout", fail);
socket.on("error", fail);
