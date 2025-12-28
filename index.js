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
            browser: ['Timnasa md', "Safari", "1.0.0"],
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
                return { conversation: 'Error!' };
            }
        };

        const zk = (0, baileys_1.default)(sockOptions);
        store.bind(zk.ev);

        // FEATURE: NJABULO RANDOM IMAGES
        const framework= [
            "https://files.catbox.moe/iii5jv.jpg",
            "https://files.catbox.moe/xjeyjh.jpg",
            "https://files.catbox.moe/mh36c7.jpg",
            "https://files.catbox.moe/u6v5ir.jpg",
            "https://files.catbox.moe/bnb3vx.jpg"
        ];

        // FEATURE: AUDIO MAP KAMILI
        const audioMap = {
            "hallo": "audios/hello.m4a", "hi": "audios/hello.m4a", "hey": "audios/hello.m4a",
            "hy": "audios/hello.m4a", "hello": "audios/hello.m4a", "mmm": "audios/mmm.m4a",
            "sorry": "audios/sorry.m4a", "morning": "audios/goodmorning.m4a",
            "goodmorning": "audios/goodmorning.m4a", "wake up": "audios/goodmorning.m4a",
            "night": "audios/goodnight.m4a", "goodnight": "audios/goodnight.m4a",
            "sleep": "audios/goodnight.m4a", "man": "audios/man.m4a", "owoh": "audios/mkuu.m4a",
            "baby": "audios/baby.m4a", "miss": "audios/miss.m4a", "bot": "audios/njabulo.m4a",
            "njabulo": "audios/njabulo.m4a", "promise": "audios/promise.m4a", "store": "audios/store.m4a",
            "cry": "audios/cry.m4a", "md": "audios/njabulo.m4a", "crying": "audios/crying.m4a",
            "beautiful": "audios/beautiful.m4a", "evening": "audios/goodevening.m4a",
            "goodevening": "audios/goodevening.m4a", "darling": "audios/darling.m4a", "love": "audios/love.m4a",
            "afternoon": "audios/goodafternoon.m4a", "school": "audios/school.m4a", "kkk": "audios/kkk.m4a",
            "lol": "audios/kkk.m4a", "bro": "audios/bro.m4a", "goodbye": "audios/goodbye.m4a",
            "welcome": "audios/welcome.m4a", "bye": "audios/bye.m4a", "fuck": "audios/fuck.m4a",
            "sex": "audios/sex.m4a", "heart": "audios/heart.m4a", "kiss": "audios/kiss.m4a",
            "hug": "audios/hug.m4a", "https": "audio/https.m4a", "technology": "audio/technology.m4a"
        };

        // 1. AUTO-REACT STATUS
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
                        } catch (error) { console.error("Status reaction error", error); }
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

            const mtype = (0, baileys_1.getContentType)(ms.message);
            const texte = mtype == "conversation" ? ms.message.conversation : mtype == "imageMessage" ? ms.message.imageMessage?.caption : mtype == "videoMessage" ? ms.message.videoMessage?.caption : mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : "";
            const origineMessage = ms.key.remoteJid;
            const idBot = decodeJid(zk.user.id);
            const auteurMessage = ms.key.participant || ms.key.remoteJid;

            // AUDIO RESPONSE LOGIC
            if (texte) {
                const words = texte.toLowerCase().split(/\s+/);
                for (const word of words) {
                    if (audioMap[word] && fs.existsSync(audioMap[word])) {
                        await zk.sendMessage(origineMessage, { audio: { url: audioMap[word] }, mimetype: 'audio/mp4', ptt: true }, { quoted: ms });
                        break;
                    }
                }
            }

            // BOT/NJABULO BUTTON & RANDOM IMAGE
            if (texte && (texte.toLowerCase() === 'framework || texte.toLowerCase() === 'bot')) {
                const randomImg = njabulox[Math.floor(Math.random() * njabulox.length)];
                const buttons = [
                    { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "View on channel", url: "https://whatsapp.com/channel/0029VbAckOZ7tkj92um4KN3u" }) },
                    { name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "Copy links", id: "copy", copy_code: "greeting" }) }
                ];
                await zk.sendMessage(origineMessage, { image: { url: randomImg }, caption: "TIMNASA MD IS ACTIVE", buttons: buttons }, { quoted: ms });
            }

            // ANTI-DELETE LOGIC
            if(ms.message.protocolMessage && ms.message.protocolMessage.type === 0 && (conf.ADM) === 'yes') {
                try {
                    let st = './store.json';
                    if (fs.existsSync(st)) {
                        const data = fs.readFileSync(st, 'utf8');
                        const jsonData = JSON.parse(data);
                        let key = ms.message.protocolMessage.key;
                        let msg = jsonData.messages[key.remoteJid]?.find(m => m.key.id === key.id);
                        if (msg) {
                            await zk.sendMessage(idBot, { image: { url: './media/deleted-message.jpg' }, caption: `😎Anti-delete\nFrom: @${msg.key.participant.split('@')[0]}`, mentions: [msg.key.participant] });
                            await zk.sendMessage(idBot, { forward: msg }, { quoted: msg });
                        }
                    }
                } catch (e) { console.log(e); }
            }

            // COMMAND HANDLER
            const verifCom = texte ? texte.startsWith(prefixe) : false;
            const com = verifCom ? texte.slice(prefixe.length).trim().split(/ +/).shift().toLowerCase() : false;
            if (verifCom) {
                const cd = evt.cm.find((c) => c.nomCom === com);
                if (cd) {
                    reagir(origineMessage, zk, ms, cd.reaction);
                    cd.fonction(origineMessage, zk, { /* options */ });
                }
            }
        });

        // 2. WELCOME LOGIC (PIC YA MEMBER)
        zk.ev.on('group-participants.update', async (group) => {
            const { recupevents } = require('./bdd/welcome');
            const metadata = await zk.groupMetadata(group.id);
            for (let membre of group.participants) {
                let ppuser;
                try { ppuser = await zk.profilePictureUrl(membre, 'image'); } catch { ppuser = njabulox[0]; }

                if (group.action == 'add' && (await recupevents(group.id, "welcome") == 'on')) {
                    let msg = `*𝐇𝐄𝐘* 🖐️ @${membre.split("@")[0]}\n𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 *${metadata.subject}*`;
                    await zk.sendMessage(group.id, { image: { url: ppuser }, caption: msg, mentions: [membre] });
                } else if (group.action == 'remove' && (await recupevents(group.id, "goodbye") == 'on')) {
                    await zk.sendMessage(group.id, { text: `Bye Bye @${membre.split("@")[0]}`, mentions: [membre] });
                }
            }
        });

        zk.ev.on("connection.update", async (con) => {
            const { lastDisconnect, connection } = con;
            if (connection === "connecting") {
                console.log("ℹ️ Timnasa md is connecting...");
            }
            else if (connection === 'open') {
                console.log("✅ 𝚻𝚰𝚳𝚴𝚫𝐒𝚫 𝚻𝚳𝐃2- Connected! ☺️");
                console.log("𝚻𝚰𝚳𝚴𝚫𝐒𝚫 𝚻𝚳𝐃2 is Online 🕸\n\n");
                fs.readdirSync(__dirname + "/commandes").forEach((fichier) => {
                    if (path.extname(fichier).toLowerCase() == (".js")) {
                        try { require(__dirname + "/commandes/" + fichier); }
                        catch (e) { console.log(e); }
                    }
                });
                await activateCrons();
                if((conf.DP).toLowerCase() === 'yes') {     
                let cmsg =`      𝚻𝚰𝚳𝚴𝚫𝐒𝚫 𝚻𝚳𝐃2
╭─────────────━┈⊷ 
│🌏 Timnasa md CONNECTED
│💫 ᴘʀᴇғɪx: *[ ${prefixe} ]*
│⭕ ᴍᴏᴅᴇ: *${(conf.MODE).toLowerCase() === "yes" ? "public" : "private"}*
╰─────────────━┈⊷⁠⁠⁠⁠`;
                await zk.sendMessage(zk.user.id, { text: cmsg });
                }
            }
            else if (connection == "close") {
                let raisonDeconnexion = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
                if (raisonDeconnexion === baileys_1.DisconnectReason.restartRequired) { main(); }   
                else { const {exec}=require("child_process") ; exec("pm2 restart all"); }
                main();
            }
        });

        zk.ev.on("creds.update", saveCreds);

        zk.downloadAndSaveMediaMessage = async (message, filename = '', attachExtension = true) => {
            let quoted = message.msg ? message.msg : message;
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await (0, baileys_1.downloadContentFromMessage)(quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
            let type = await FileType.fromBuffer(buffer);
            let trueFileName = './' + filename + '.' + type.ext;
            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };

        return zk;
    }
    main();
}, 5000);
