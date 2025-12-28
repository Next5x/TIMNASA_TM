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
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const { verifierEtatJid , recupererActionJid } = require("./bdd/antilien");
const { atbverifierEtatJid , atbrecupererActionJid } = require("./bdd/antibot");
let evt = require(__dirname + "/framework/zokou");
const {isUserBanned , addUserToBanList , removeUserFromBanList} = require("./bdd/banUser");
const  {addGroupToBanList,isGroupBanned,removeGroupFromBanList} = require("./bdd/banGroup");
const {isGroupOnlyAdmin,addGroupToOnlyAdminList,removeGroupFromOnlyAdminList} = require("./bdd/onlyAdmin");
let { reagir } = require(__dirname + "/framework/app");

var session = conf.session.replace(/TIMNASA-MD;;;=>/g,"");
const prefixe = conf.PREFIXE;
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);

async function authentification() {
    try {
        if (!fs.existsSync(__dirname + "/auth/creds.json")) {
            console.log("connexion en cour ...");
            await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
        }
        else if (fs.existsSync(__dirname + "/auth/creds.json") && session != "zokk") {
            await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
        }
    }
    catch (e) {
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
        const { version, isLatest } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(__dirname + "/auth");
        
        const sockOptions = {
            version,
            logger: pino({ level: "silent" }),
            browser: ['Timnasa md', "safari", "1.0.0"],
            printQRInTerminal: true,
            fireInitQueries: false,
            shouldSyncHistoryMessage: true,
            downloadHistory: true,
            syncFullHistory: true,
            generateHighQualityLinkPreview: true,
            markOnlineOnConnect: false,
            keepAliveIntervalMs: 30_000,
            auth: {
                creds: state.creds,
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
            },
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
                    return msg.message || undefined;
                }
                return { conversation: 'An Error Occurred, Repeat Command!' };
            }
        };

        const zk = (0, baileys_1.default)(sockOptions);
        store.bind(zk.ev);

        const njabulox = [
            "https://files.catbox.moe/iii5jv.jpg",
            "https://files.catbox.moe/xjeyjh.jpg",
            "https://files.catbox.moe/mh36c7.jpg",
            "https://files.catbox.moe/u6v5ir.jpg",
            "https://files.catbox.moe/bnb3vx.jpg"
        ];

        const audioMap = {
            "hallo": "audios/hello.m4a",
            "hi": "audios/hello.m4a",
            "hey": "audios/hello.m4a",
            "hello": "audios/hello.m4a",
            "mmm": "audios/mmm.m4a",
            "sorry": "audios/sorry.m4a",
            "morning": "audios/goodmorning.m4a",
            "goodmorning": "audios/goodmorning.m4a",
            "night": "audios/goodnight.m4a",
            "goodnight": "audios/goodnight.m4a",
            "bot": "audios/njabulo.m4a",
            "njabulo": "audios/njabulo.m4a",
            "love": "audios/love.m4a",
            "kkk": "audios/kkk.m4a",
            "lol": "audios/kkk.m4a",
            "bye": "audios/bye.m4a"
        };

        const getAudioForSentence = (sentence) => {
            if (!sentence) return null;
            const words = sentence.split(/\s+/);
            for (const word of words) {
                const audioFile = audioMap[word.toLowerCase()];
                if (audioFile) return audioFile;
            }
            return null;
        };

        // Status Auto-React
        if (conf.AUTOREACT_STATUS === "yes") {
            zk.ev.on("messages.upsert", async (m) => {
                const { messages } = m;
                for (const message of messages) {
                    if (message.key && message.key.remoteJid === "status@broadcast") {
                        try {
                            const reactionEmojis = ["❤️", "🔥", "👍", "😂", "🤩"];
                            const randomEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
                            await zk.readMessages([message.key]);
                            await zk.sendMessage(message.key.remoteJid, { react: { text: randomEmoji, key: message.key } });
                        } catch (error) { console.error("Status reaction failed:", error); }
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
                } else return jid;
            };

            var mtype = (0, baileys_1.getContentType)(ms.message);
            var texte = mtype == "conversation" ? ms.message.conversation : mtype == "imageMessage" ? ms.message.imageMessage?.caption : mtype == "videoMessage" ? ms.message.videoMessage?.caption : mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : "";
            
            var origineMessage = ms.key.remoteJid;
            var idBot = decodeJid(zk.user.id);
            var auteurMessage = ms.key.participant || ms.key.remoteJid;

            // Auto-Audio Response logic
            const matchedAudio = getAudioForSentence(texte);
            if (matchedAudio && fs.existsSync(matchedAudio)) {
                await zk.sendMessage(origineMessage, { audio: { url: matchedAudio }, mimetype: 'audio/mp4', ptt: true }, { quoted: ms });
            }

            // Command logic starts here...
            const verifGroupe = origineMessage?.endsWith("@g.us");
            var infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage) : "";
            const nomAuteurMessage = ms.pushName;
            const superUserNumbers = [idBot, conf.NUMERO_OWNER + "@s.whatsapp.net"];
            const superUser = superUserNumbers.includes(auteurMessage);

            function repondre(mes) { zk.sendMessage(origineMessage, { text: mes }, { quoted: ms }); }

            // Anti-Delete
            if(ms.message.protocolMessage && ms.message.protocolMessage.type === 0 && (conf.ADM) === 'yes') {
                try {
                    let st = './store.json';
                    if (fs.existsSync(st)) {
                        const data = fs.readFileSync(st, 'utf8');
                        const jsonData = JSON.parse(data);
                        let key = ms.message.protocolMessage.key;
                        let msg = jsonData.messages[key.remoteJid]?.find(m => m.key.id === key.id);
                        if (msg) {
                            await zk.sendMessage(idBot, { text: `Anti-delete: Meseji kutoka @${msg.key.participant.split('@')[0]} imefutwa.`, mentions: [msg.key.participant] });
                            await zk.sendMessage(idBot, { forward: msg }, { quoted: msg });
                        }
                    }
                } catch (e) { console.log(e); }
            }

            // Read Status
            if (ms.key && ms.key.remoteJid === "status@broadcast" && conf.AUTO_READ_STATUS === "yes") {
                await zk.readMessages([ms.key]);
            }

            // Processing commands
            const prefixe = conf.PREFIXE;
            const verifCom = texte ? texte.startsWith(prefixe) : false;
            const com = verifCom ? texte.slice(prefixe.length).trim().split(/ +/).shift().toLowerCase() : false;

            if (verifCom) {
                const cd = evt.cm.find((zokou) => zokou.nomCom === com);
                if (cd) {
                    if (conf.MODE.toLowerCase() !== 'yes' && !superUser) return;
                    reagir(origineMessage, zk, ms, cd.reaction);
                    cd.fonction(origineMessage, zk, { /* options placeholders */ });
                }
            }
        });

        zk.ev.on("connection.update", async (con) => {
            const { lastDisconnect, connection } = con;
            if (connection === 'open') {
                console.log("✅ TIMNASA-MD Connected!");
                fs.readdirSync(__dirname + "/commandes").forEach((fichier) => {
                    if (path.extname(fichier).toLowerCase() == ".js") {
                        try { require(__dirname + "/commandes/" + fichier); } catch (e) { console.log(e); }
                    }
                });
            } else if (connection === "close") {
                let reason = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
                if (reason === baileys_1.DisconnectReason.restartRequired) { main(); } 
                else { main(); }
            }
        });

        zk.ev.on("creds.update", saveCreds);
        return zk;
    }
    main();
}, 5000);
