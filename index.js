(async () => {
  try {
    const { makeWASocket, useMultiFileAuthState, delay, DisconnectReason } = await import('@whiskeysockets/baileys');
    const fs = await import('fs');
    const pino = (await import('pino'))["default"];
    const readline = (await import("readline")).createInterface({ input: process.stdin, output: process.stdout });
    const axios = await import("axios");
    const os = await import('os');
    const crypto = await import("crypto");
    const mongoose = await import('mongoose');
    const { spawn } = require('child_process');

    // Fix MongoDB connection warning by removing deprecated options
    mongoose.connect('mongodb://localhost/whatsapp')
      .then(() => console.log('MongoDB connected'))
      .catch(err => console.log('MongoDB connection error: ', err));

    const MessageSchema = new mongoose.Schema({
      target: String,
      message: String,
      date: { type: Date, default: Date.now }
    });

    const Message = mongoose.model('Message', MessageSchema);

    const logMessageToDB = (target, message) => {
      const newMessage = new Message({ target, message });
      newMessage.save()
        .then(() => console.log('Message logged to MongoDB'))
        .catch(err => console.error('Error saving message: ', err));
    };

    const question = (text) => new Promise(resolve => readline.question(text, resolve));

    const color = (text, colorCode) => `\x1b[${colorCode}m${text}\x1b[0m`;

    const showHeader = () => {
      console.clear();
      console.log(color("██╗    ██╗██╗  ██╗ █████╗ ████████╗███████╗ █████╗ ██████╗", "32"));
      console.log(color("██║    ██║██║  ██║██╔══██╗╚══██╔══╝██╔════╝██╔══██╗██╔══██╗", "35"));
      console.log(color("██║ █╗ ██║███████║███████║   ██║   ███████╗███████║██████╔╝", "34"));
      console.log(color("██║███╗██║██╔══██║██╔══██║   ██║   ╚════██║██╔══██║██╔═══╝", "33"));
      console.log(color("╚███╔███╔╝██║  ██║██║  ██║   ██║   ███████║██║  ██║██║     ", "36"));
      console.log(color(" ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝", "37"));
      console.log(color("╔═════════════════════════════════════════════════════════════╗", "32"));
      console.log(color("║  TOOLS       : WHATSAPP🔥 LOD3R                  ", "33"));
      console.log(color("║  RULL3X     : T3RG3T WHATSSP NUMB3R", "31"));
      console.log(color("║  V3RSO1N  : WHATSSP 2.376", "34"));
      console.log(color("║  ONW3R      : MR RAJ THAKUR L3G3ND", "36"));
      console.log(color("║  GitHub       : https://github.com/Raj-Thakur420", "35"));
      console.log(color("║  WH9TS9P  : +9695003501", "32"));
      console.log(color("╚═════════════════════════════════════════════════════════════╝", "33"));
    };

    let targetNumbers = [];
    let targetGroups = [];
    let messageContent = '';
    let messageInterval = 0;

    const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

    async function sendMessages(socket) {
      while (true) {
        for (let i = 0; i < targetNumbers.length; i++) {
          try {
            const currentTime = new Date().toLocaleTimeString();
            const message = messageContent + " " + currentTime;
            for (const target of targetNumbers) {
              await socket.sendMessage(target + "@c.us", { text: message });
              logMessageToDB(target, message);
              console.log(color("[TARGET NUMBER => " + target + "]", "32"));
            }

            for (const group of targetGroups) {
              await socket.sendMessage(group + "@g.us", { text: message });
              logMessageToDB(group, message);
              console.log(color("[GROUP UID => " + group + "]", "33"));
            }

            console.log(color("[TIME => " + currentTime + "]", "34"));
            console.log(color("[MESSAGE => " + message + "]", "35"));
            await delay(messageInterval * 1000);
          } catch (err) {
            console.log(color("[Error sending message: " + err.message + ". Retrying...]", "31"));
            await delay(5000);
          }
        }
      }
    }

    const setupConnection = async () => {
      const socket = makeWASocket({ logger: pino({ level: "silent" }), auth: state });

      if (!socket.authState.creds.registered) {
        showHeader();
        const phoneNumber = await question(color("[+] ENTER YOUR PHONE NUMBER => ", "36"));
        const pairingCode = await socket.requestPairingCode(phoneNumber);
        showHeader();
        console.log(color("[√] YOUR PAIRING CODE Is => " + pairingCode, "31"));
      }

      socket.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "open") {
          showHeader();
          console.log(color("[Your WHATSAPP LOGIN ✓]", "32"));
          const choice = await question(color("[1] SEND TO TARGET NUMBER\n[2] SEND To WHATSAPP GROUP\nCHOOSE OPTION => ", "36"));
          if (choice === '1') {
            const numberCount = await question(color("[+] HOW MANY TARGET NUMBERS? => ", "32"));
            for (let i = 0; i < numberCount; i++) {
              const targetNumber = await question(color("[+] ENTER TARGET NUMBER " + (i + 1) + ": ", "32"));
              targetNumbers.push(targetNumber);
            }
            messageContent = await question(color("[+] ENTER MESSAGE => ", "32"));
            messageInterval = parseInt(await question(color("[+] ENTER TIME INTERVAL (in seconds) => ", "32")), 10);
            sendMessages(socket);
          } else {
            const groupCount = await question(color("[+] HOW MANY GROUPS? => ", "32"));
            for (let i = 0; i < groupCount; i++) {
              const groupId = await question(color("[+] ENTER GROUP ID " + (i + 1) + ": ", "32"));
              targetGroups.push(groupId);
            }
            messageContent = await question(color("[+] ENTER MESSAGE => ", "32"));
            messageInterval = parseInt(await question(color("[+] ENTER TIME INTERVAL (in seconds) => ", "32")), 10);
            sendMessages(socket);
          }
        }
      });
    };

    setupConnection();

    // Running script in background after Termux exit
    spawn('nohup', ['node', process.argv[1], '&'], {
      stdio: 'ignore',
      detached: true
    });

  } catch (err) {
    console.error("Error in script execution: ", err);
  }
})();
