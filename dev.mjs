import { networkInterfaces } from "os";
import { spawn } from "child_process";

const iface = Object.values(networkInterfaces())
  .flat()
  .find((n) => n.family === "IPv4" && !n.internal);

const host = iface ? iface.address : "localhost";
console.log(`\n  Network:  http://${host}:3050\n`);

const child = spawn("vercel", ["dev", "--listen", "0.0.0.0:3050"], {
  stdio: "inherit",
});

child.on("exit", (code) => process.exit(code ?? 0));
