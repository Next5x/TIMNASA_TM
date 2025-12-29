"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const logger_1 = __importDefault(require("@whiskeysockets/baileys/lib/Utils/logger"));
const logger = logger_1.default.child({});
logger.level = 'silent';
const pino = require("pino");
const boom_1 = require("@hapi/boom");
const conf = require("./set");
const axios = require("axios");
let fs = require("fs-extra");
let path = require("path");
const FileType = require('file-type');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

// Framework na Database imports
const { verifierEtatJid , recupererActionJid } = require("./bdd/antilien");
const { atbverifierEtatJid , atbrecupererActionJid } = require("./bdd/antibot");
let evt = require(__dirname + "/framework/zokou");
const { isUserBanned } = require("./bdd/banUser");
const { isGroupBanned } = require("./bdd/banGroup");
const { isGroupOnlyAdmin } = require("./bdd/onlyAdmin");
let { reagir } = require(__dirname + "/framework/app");

var session = conf.session.replace(/Zokou-MD-WHATSAPP-BOT;;;=>/g,"");
const prefixe = conf.PREFIXE;

async function authentification() {
    try {
        if (!fs.existsSync(__dirname + "/auth/creds.json")) {
            console.log("Connecting...");
            await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
        }
        else if (fs.existsSync(__dirname + "/auth/creds.json") && session != "zokk") {
            await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
        }
    } catch (e) {
        console.log("Session Invalid " + e);
        return;
    }
}

authentification();

const store = (0, baileys_1.makeInMemoryStore)({
    logger: pino().child({ level: "silent", stream: "store" }),
});

setTimeout(() => {
    async function main() {
        const { version } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(__dirname + "/auth");
        
        const sockOptions = {
            version,
            logger: pino({ level: "silent" }),
            browser: ['Timnasa TMD', "Safari", "1.0.0"],
            printQRInTerminal: true,
            auth: {
                creds: state.creds,
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
            },
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
                    return msg.message || undefined;
                }
                return { conversation: 'Error' };
            }
        };

        const zk = (0, baileys_1.default)(sockOptions);
        store.bind(zk.ev);

        // Auto Reaction Status
        if (conf.AUTOREACT_STATUS === "yes") {
            zk.ev.on("messages.upsert", async (m) => {
                for (const message of m.messages) {
                    if (message.key && message.key.remoteJid === "status@broadcast") {
                        const emojis = ["❤️", "🔥", "👍", "😂", "🤩"];
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await zk.readMessages([message.key]);
                        await zk.sendMessage(message.key.remoteJid, { react: { text: randomEmoji, key: message.key } });
                    }
                }
            });
        }

        zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];
            if (!ms.message) return;

            const decodeJid = (jid) => {
                if (!jid) return jid;
                if (/:\d+@/gi.test(jid)) {
                    let decode = (0, baileys_1.jidDecode)(jid) || {};
                    return decode.user && decode.server && decode.user + '@' + decode.server || jid;
                }
                return jid;
            };

            var mtype = (0, baileys_1.getContentType)(ms.message);
            var texte = mtype == "conversation" ? ms.message.conversation : mtype == "imageMessage" ? ms.message.imageMessage?.caption : mtype == "videoMessage" ? ms.message.videoMessage?.caption : mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : "";
            
            var origineMessage = ms.key.remoteJid;
            var idBot = decodeJid(zk.user.id);
            const verifGroupe = origineMessage?.endsWith("@g.us");
            var infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage) : "";
            var nomGroupe = verifGroupe ? infosGroupe.subject : "";
            var auteurMessage = verifGroupe ? (ms.key.participant ? ms.key.participant : ms.participant) : origineMessage;
            
            const { getAllSudoNumbers } = require("./bdd/sudo");
            const sudo = await getAllSudoNumbers();
            const superUser = [idBot, conf.NUMERO_OWNER + "@s.whatsapp.net", ...sudo].includes(auteurMessage);

            function repondre(mes) { zk.sendMessage(origineMessage, { text: mes }, { quoted: ms }); }

            const lien = conf.URL.split(',');
            function mybotpic() {
                return lien[Math.floor(Math.random() * lien.length)];
            }

            const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
            const verifCom = texte ? texte.startsWith(prefixe) : false;
            const com = verifCom ? texte.slice(prefixe.length).trim().split(/ +/).shift().toLowerCase() : false;

            var commandeOptions = {
                superUser, verifGroupe, infosGroupe, nomGroupe, auteurMessage,
                idBot, prefixe, arg, repondre, mtype, ms, mybotpic
            };

            // Command Execution
            if (verifCom) {
                const cd = evt.cm.find((c) => c.nomCom === com);
                if (cd) {
                    if (conf.MODE.toLowerCase() !== 'yes' && !superUser) return;
                    
                    try {
                        reagir(origineMessage, zk, ms, cd.reaction);
                        await cd.fonction(origineMessage, zk, commandeOptions);
                    } catch (e) {
                        console.log("Error: " + e);
                        repondre("Error occurred: " + e.message);
                    }
                }
            }
        });

        // Connection Handling
        zk.ev.on("connection.update", async (con) => {
            const { lastDisconnect, connection } = con;
            if (connection === "open") {
                console.log("✅ TIMNASA TMD Connected!");
                
                // --- KUPAKIA COMMANDS (HII NDIO SEHEMU MUHIMU) ---
                const cmdPath = path.join(__dirname, "commandes");
                if (fs.existsSync(cmdPath)) {
                    fs.readdirSync(cmdPath).forEach((file) => {
                        if (file.endsWith(".js")) {
                            require(path.join(cmdPath, file));
                            console.log(`Command Loaded: ${file}`);
                        }
                    });
                }

                let statusMsg = `*TIMNASA TMD IS ONLINE*\n*Prefix:* ${prefixe}\n*Mode:* ${conf.MODE}`;
                await zk.sendMessage(idBot, { text: statusMsg });
            } 
            else if (connection === "close") {
                let reason = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
                if (reason !== baileys_1.DisconnectReason.loggedOut) main();
            }
        });

        zk.ev.on("creds.update", saveCreds);
        return zk;
    }
    main();
}, 5000);
