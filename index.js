"use strict";
// ... (Sehemu ya Bindings na Imports imebaki vilevile kama mwanzo)
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
const {isUserBanned} = require("./bdd/banUser");
const {isGroupBanned} = require("./bdd/banGroup");
const {isGroupOnlyAdmin} = require("./bdd/onlyAdmin");
const {loadCmd} = require("./framework/mesfonctions");
let { reagir } = require(__dirname + "/framework/app");

var session = conf.session.replace(/(Zokou-MD-WHATSAPP-BOT|TIMNASA-MD);;;=>/g,"");
const prefixe = conf.PREFIXE;

// SAIDIZI: Hamisha emojiMap hapa juu na iwe fupi
const emojiMap = {
    "hello": ["👋", "😊"], "love": ["❤️", "😍"], "bye": ["👋", "😢"],
    "congrats": ["🎉", "👏"], "sad": ["😢", "😭"], "angry": ["😡", "💢"],
    "bot": ["🤖", "💻"], "thanks": ["🙏", "💖"], "hi": ["👋", "✨"]
};

const getEmoji = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    for (const word of words) {
        if (emojiMap[word]) return emojiMap[word][Math.floor(Math.random() * emojiMap[word].length)];
    }
    return ["😎", "🔥", "✨", "🚀"][Math.floor(Math.random() * 4)];
};

async function authentification() {
    try {
        if (!fs.existsSync(__dirname + "/auth/creds.json") || session !== "zokk") {
            await fs.writeFileSync(__dirname + "/auth/creds.json", Buffer.from(session, 'base64').toString('utf8'), "utf8");
        }
    } catch (e) { console.log("Session Invalid " + e); }
}

authentification();

const store = (0, baileys_1.makeInMemoryStore)({ logger: pino().child({ level: "silent", stream: "store" }) });

async function main() {
    const { version } = await (0, baileys_1.fetchLatestBaileysVersion)();
    const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(__dirname + "/auth");

    const sockOptions = {
        version,
        logger: pino({ level: "silent" }),
        browser: baileys_1.Browsers.ubuntu('Chrome'),
        printQRInTerminal: true,
        fireInitQueries: false,
        shouldSyncHistoryMessage: false, // MUHIMU: Zima hii ili bot iwe nyepesi
        downloadHistory: false,
        syncFullHistory: false,
        markOnlineOnConnect: true,
        auth: {
            creds: state.creds,
            keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
        },
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg?.message || undefined;
            }
            return { conversation: 'Error!' };
        }
    };

    const zk = (0, baileys_1.default)(sockOptions);
    store.bind(zk.ev);

    // --- MESSAGES UPSERT (HAPA NDIPO KILA KITU KINAFANYIKA) ---
    zk.ev.on("messages.upsert", async (m) => {
        const { messages } = m;
        const ms = messages[0];
        if (!ms.message) return;

        const remoteJid = ms.key.remoteJid;
        const isStatus = remoteJid === "status@broadcast";
        const isGroup = remoteJid.endsWith("@g.us");
        const sender = isGroup ? ms.key.participant : remoteJid;
        const text = ms.message.conversation || ms.message.extendedTextMessage?.text || "";

        // 1. Auto Read & React Status
        if (isStatus && conf.AUTO_READ_STATUS === "yes") {
            await zk.readMessages([ms.key]);
            if (conf.AUTO_REACT_STATUS === "yes") {
                await zk.sendMessage(remoteJid, { react: { text: getEmoji(text), key: ms.key } }, { statusJidList: [ms.key.participant] });
            }
        }

        // 2. Auto Save Contacts
        if (!isGroup && !isStatus && conf.AUTO_SAVE_CONTACTS === "yes" && !ms.key.fromMe) {
            if (!store.contacts[remoteJid]?.name) {
                await zk.sendMessage(remoteJid, { text: `Ssup! Your contact is saved as Timnasa-Md User. TIMNASA-MD` });
            }
        }

        // 3. Auto React Regular Messages
        if (!isStatus && conf.AUTO_REACT === "yes" && !ms.key.fromMe) {
            await zk.sendMessage(remoteJid, { react: { text: getEmoji(text), key: ms.key } });
        }

        // 4. Command Execution Logic
        const isCmd = text.startsWith(prefixe);
        const cmdName = isCmd ? text.slice(prefixe.length).trim().split(/ +/).shift().toLowerCase() : false;

        if (isCmd) {
            const cmd = evt.cm.find((c) => c.nomCom === cmdName);
            if (cmd) {
                // Check Bans & Modes
                const superUser = [conf.NUMERO_OWNER + "@s.whatsapp.net", zk.user.id.split(':')[0] + "@s.whatsapp.net"].includes(sender);
                if (conf.MODE.toLowerCase() === "no" && !superUser) return;
                
                const banned = await isUserBanned(sender);
                if (banned && !superUser) return;

                reagir(remoteJid, zk, ms, cmd.reaction);
                const args = text.trim().split(/ +/).slice(1);
                cmd.fonction(remoteJid, zk, { arg: args, ms, text, prefixe, superUser });
            }
        }
    });

    // Connection Updates
    zk.ev.on("connection.update", async (con) => {
        const { connection, lastDisconnect } = con;
        if (connection === "open") {
            console.log("✅ TIMNASA TMD2 CONNECTED!");
            // Load Commands
            fs.readdirSync(__dirname + "/commandes").forEach((file) => {
                if (file.endsWith(".js")) require(__dirname + "/commandes/" + file);
            });
        }
        if (connection === "close") {
            const reason = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason !== baileys_1.DisconnectReason.loggedOut) main();
        }
    });

    zk.ev.on("creds.update", saveCreds);
    return zk;
}



main();
