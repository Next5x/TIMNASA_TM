// ... (Imports zako za mwanzo)
const fs = require('fs-extra');

// Database ndogo ya kuhifadhi Warns na Settings
const statusDbPath = './database/antistatus_config.json';
if (!fs.existsSync('./database')) fs.mkdirSync('./database');
if (!fs.existsSync(statusDbPath)) {
    fs.writeFileSync(statusDbPath, JSON.stringify({ settings: { status: 'on', action: 'warn', warn_limit: 3 }, warns: {} }));
}

// Functions za kusaidia Anti-Status
const getStatusConfig = () => JSON.parse(fs.readFileSync(statusDbPath));
const saveStatusConfig = (config) => fs.writeFileSync(statusDbPath, JSON.stringify(config, null, 2));

function isStatusMention(message) {
    return !!message?.groupStatusMentionMessage;
}

async function detectAndHandleStatusMention(zk, ms, isBotAdmin, isAdmin, isSuperAdmin) {
    try {
        const config = getStatusConfig();
        const { settings, warns } = config;
        
        const from = ms.key.remoteJid;
        if (!from.endsWith('@g.us') || settings.status === 'off') return;
        if (ms.key.fromMe || isAdmin || isSuperAdmin) return;

        if (!isStatusMention(ms.message)) return;

        const sender = ms.key.participant || from;

        if (!isBotAdmin) {
            await zk.sendMessage(from, { text: `⚠️ Nimegundua Status Mention! Nifanye admin nichukue hatua.` });
            return;
        }

        // Futa meseji kwanza
        await zk.sendMessage(from, { delete: ms.key });

        if (settings.action === 'remove') {
            await zk.groupParticipantsUpdate(from, [sender], 'remove');
            await zk.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} ameondolewa kwa kutumia Status Mention!`, mentions: [sender] });
        } 
        else if (settings.action === 'delete') {
            await zk.sendMessage(from, { text: `🗑️ @${sender.split('@')[0]} status mention yako imefutwa!`, mentions: [sender] });
        } 
        else if (settings.action === 'warn') {
            warns[sender] = (warns[sender] || 0) + 1;
            if (warns[sender] >= settings.warn_limit) {
                await zk.groupParticipantsUpdate(from, [sender], 'remove');
                await zk.sendMessage(from, { text: `🚫 @${sender.split('@')[0]} ameondolewa baada ya maonyo ${settings.warn_limit}!`, mentions: [sender] });
                delete warns[sender];
            } else {
                await zk.sendMessage(from, { text: `⚠️ Onyo ${warns[sender]}/${settings.warn_limit} kwa @${sender.split('@')[0]}! Usitumie status mention.`, mentions: [sender] });
            }
            saveStatusConfig(config);
        }
    } catch (e) { console.error('Error:', e); }
}

// NDANI YA messages.upsert:
zk.ev.on("messages.upsert", async (m) => {
    const ms = m.messages[0];
    if (!ms.message) return;
    
    // Pata vigezo vya group admin
    const from = ms.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    let isBotAdmin = false;
    let isAdmin = false;

    if (isGroup) {
        const metadata = await zk.groupMetadata(from);
        const participants = metadata.participants;
        const botId = zk.user.id.split(':')[0] + '@s.whatsapp.net';
        const sender = ms.key.participant;
        
        isBotAdmin = participants.find(p => p.id === botId)?.admin !== null;
        isAdmin = participants.find(p => p.id === sender)?.admin !== null;
        
        // ITA ILE FUNCTION HAPA:
        await detectAndHandleStatusMention(zk, ms, isBotAdmin, isAdmin, false);
    }
    // ... (Zingine zote zinafuata hapa)
});
