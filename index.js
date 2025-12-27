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

// FIX: Sehemu ya session ili iweze kusoma TIMNASA-MD au jina lolote
var session = conf.session.replace(/Zokou-MD-WHATSAPP-BOT;;;=>/g,"");
const prefixe = conf.PREFIXE;
const more = String.fromCharCode(8206)
const readmore = more.repeat(4001)


async function authentification() {
    try {
       
        //console.log("le data "+data)
        if (!fs.existsSync(__dirname + "/auth/creds.json")) {
            console.log("connexion en cour ...");
            await fs.writeFileSync(__dirname + "/auth/creds.json", atob(session), "utf8");
            //console.log(session)
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
            browser: ['TIMNASA-MD', "safari", "1.0.0"],
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
                return { conversation: 'Error occurred, retrying...' };
            }
        };
        const zk = (0, baileys_1.default)(sockOptions);
        store.bind(zk.ev);

    const zokouImg = [
        "https://files.catbox.moe/iii5jv.jpg",
        "https://files.catbox.moe/xjeyjh.jpg",
        "https://files.catbox.moe/mh36c7.jpg",
        "https://files.catbox.moe/u6v5ir.jpg",
        "https://files.catbox.moe/bnb3vx.jpg" 
    ];

    const randomZokouUrl = zokouImg[Math.floor(Math.random() * zokouImg.length)];

    const buttons = [{
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
            display_text: "View on channel",
            id: `backup channel`,
            url: "https://whatsapp.com/channel/0029VbAckOZ7tkj92um4KN3u" 
        })
    },{
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
            display_text: "Copy links",
            id: `copy`,
            copy_code: `greeting`
        })
    }];
        
    const audioMap = {
        "hallo": "audios/hello.m4a",
        "hi": "audios/hello.m4a",
        "hello": "audios/hello.m4a",
        "bot": "audios/njabulo.m4a",
        "timnasa": "audios/njabulo.m4a"
    };

    const getAudioForSentence = (sentence) => {
        const words = sentence.split(/\s+/);
        for (const word of words) {
            const audioFile = audioMap[word.toLowerCase()];
            if (audioFile) return audioFile;
        }
        return null;
    };

    if (conf.AUDIO_REPLY === "yes") {
        zk.ev.on("messages.upsert", async (m) => {
            try {
                const { messages } = m;
                for (const message of messages) {
                    if (!message.key || !message.key.remoteJid) continue;
                    const conversationText = message?.message?.conversation || "";
                    const audioFile = getAudioForSentence(conversationText);
                    if (audioFile) {
                        try {
                            await fs.access(audioFile);
                            await zk.sendMessage(message.key.remoteJid, {
                                audio: { url: audioFile },
                                mimetype: "audio/mp4",
                                ptt: true
                            });
                        } catch (err) {}
                    }
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
            } catch (err) {}
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
                else return jid;
            };

            var mtype = (0, baileys_1.getContentType)(ms.message);
            var texte = mtype == "conversation" ? ms.message.conversation : mtype == "imageMessage" ? ms.message.imageMessage?.caption : mtype == "videoMessage" ? ms.message.videoMessage?.caption : mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : "";
            var origineMessage = ms.key.remoteJid;
            var idBot = decodeJid(zk.user.id);
            var servBot = idBot.split('@')[0];
            
            const verifGroupe = origineMessage?.endsWith("@g.us");
            var infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage) : "";
            var nomGroupe = verifGroupe ? infosGroupe.subject : "";
            var auteurMessage = verifGroupe ? (ms.key.participant ? ms.key.participant : ms.participant) : origineMessage;
            if (ms.key.fromMe) { auteurMessage = idBot; }

            const { getAllSudoNumbers } = require("./bdd/sudo");
            const nomAuteurMessage = ms.pushName;
            const dj = '255626375893'; // Namba yako ya simu
            const sudo = await getAllSudoNumbers();
            const superUserNumbers = [servBot, dj, conf.NUMERO_OWNER].map((s) => s.replace(/[^0-9]/g) + "@s.whatsapp.net");
            const allAllowedNumbers = superUserNumbers.concat(sudo);
            const superUser = allAllowedNumbers.includes(auteurMessage);

            function repondre(mes) { zk.sendMessage(origineMessage, { text: mes }, { quoted: ms }); }
            
            console.log("\n--- TIMNASA-MD MESSAGE RECEIVED ---");
            console.log("Sender: " + nomAuteurMessage + " (" + auteurMessage.split("@")[0] + ")");
            console.log("Content: " + texte);

            const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
            const verifCom = texte ? texte.startsWith(prefixe) : false;
            const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : false;

            var commandeOptions = {
                superUser, verifGroupe, idBot, prefixe, arg, repondre, mtype, ms
            };

            if (verifCom) {
                const cd = evt.cm.find((zokou) => zokou.nomCom === (com));
                if (cd) {
                    try {
                        if ((conf.MODE).toLocaleLowerCase() != 'yes' && !superUser) return;
                        reagir(origineMessage, zk, ms, cd.reaction);
                        cd.fonction(origineMessage, zk, commandeOptions);
                    }
                    catch (e) {
                        console.log("Error: " + e);
                    }
                }
            }
        });

        zk.ev.on("connection.update", async (con) => {
            const { lastDisconnect, connection } = con;
            if (connection === "connecting") {
                console.log("ℹ️ Timnasa-MD is connecting...");
            }
            else if (connection === 'open') {
                console.log("✅ TIMNASA-MD CONNECTED!");
                fs.readdirSync(__dirname + "/commandes").forEach((fichier) => {
                    if (path.extname(fichier).toLowerCase() == (".js")) {
                        try { require(__dirname + "/commandes/" + fichier); } catch (e) {}
                    }
                });

                if((conf.DP).toLowerCase() === 'yes') {     
                    let cmsg = `*ᯤ ᴛɪᴍɴᴀsᴀ-ᴍᴅ: ᴄᴏɴɴᴇᴄᴛᴇᴅ* \n*ᴍᴏᴅᴇ:* ${conf.MODE}`;
                    await zk.sendMessage(zk.user.id, { text: cmsg });
                }
            }
            else if (connection == "close") {
                console.log("Connection closed, reconnecting...");
                main();
            }
        });

        zk.ev.on("creds.update", saveCreds);
        return zk;
    }
    main();
}, 5000);
