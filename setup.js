// setup.js
const { execSync } = require("child_process");
const fs = require("fs");

// --- PM2 SETUP ---
console.log("[✔] Installing PM2 & Dependencies...");
execSync("npm install -g pm2", { stdio: "inherit" });
execSync("termux-wake-lock", { stdio: "inherit" });

// --- Starting WhatsApp Sender Script ---
console.log("[✔] Starting WhatsApp Sender in Background...");
execSync("pm2 start whatsapp-sender.js --name whatsapp-sender --watch --restart-delay=5000", { stdio: "inherit" });
execSync("pm2 save", { stdio: "inherit" });
execSync("pm2 startup", { stdio: "inherit" });

// --- AUTO START AFTER REBOOT ---
console.log("[✔] Enabling Auto-Start After Reboot...");
fs.mkdirSync("/data/data/com.termux/files/home/.termux/boot", { recursive: true });
fs.writeFileSync("/data/data/com.termux/files/home/.termux/boot/start.sh", "#!/data/data/com.termux/files/usr/bin/bash\npm2 resurrect");
execSync("chmod +x /data/data/com.termux/files/home/.termux/boot/start.sh", { stdio: "inherit" });

console.log("[✔] Setup Completed! Now You Can Exit Termux.");
console.log("[🔥] Even After Termux Exit or Mobile Restart, SMS Will Keep Sending!");
