// sms-sender.js
const { execSync } = require("child_process");
const fs = require("fs");

// --- Wake Lock Setup (Keeps Device Awake) ---
console.log("[✔] Setting Wake Lock to Keep Device Awake...");
execSync("termux-wake-lock", { stdio: "inherit" });

// --- Send SMS Function ---
const sendSMS = (phoneNumber, message) => {
  console.log(`[✔] Sending SMS to ${phoneNumber}...`);
  execSync(`termux-sms-send -n ${phoneNumber} "${message}"`, { stdio: "inherit" });
};

// --- Starting the SMS Sending Process ---
const phoneNumber = "9876543210"; // Target Phone Number
const message = "Your custom message goes here!"; // SMS Content

console.log("[✔] Starting SMS Sending Process...");
sendSMS(phoneNumber, message);

// --- Keep Running After Exit (Using PM2) ---
console.log("[✔] Script will continue running even after Termux exit or Mobile restart.");
execSync("pm2 start sms-sender.js --name sms-sender --watch --restart-delay=5000", { stdio: "inherit" });
execSync("pm2 save", { stdio: "inherit" });

// --- Auto-Start After Reboot ---
fs.mkdirSync("/data/data/com.termux/files/home/.termux/boot", { recursive: true });
fs.writeFileSync("/data/data/com.termux/files/home/.termux/boot/start.sh", "#!/data/data/com.termux/files/usr/bin/bash\npm2 resurrect");
execSync("chmod +x /data/data/com.termux/files/home/.termux/boot/start.sh", { stdio: "inherit" });

console.log("[✔] Setup Complete! SMS sending will continue after Termux exit or mobile restart.");
