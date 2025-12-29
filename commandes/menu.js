const util = require('util');
const fs = require('fs-extra');
const { zokou, cm } = require(__dirname + "/../framework/zokou"); // Tumesoma cm moja kwa moja
const { format } = require(__dirname + "/../framework/mesfonctions");
const os = require("os");
const moment = require("moment-timezone");
const s = require(__dirname + "/../set");

zokou({ nomCom: "menu", categorie: "General", reaction: "📋" }, async (dest, zk, commandeOptions) => {
    let { ms, repondre, prefixe, nomAuteurMessage, mybotpic } = commandeOptions;
    
    var coms = {};
    var mode = "public";
    
    if ((s.MODE).toLocaleLowerCase() != "yes") {
        mode = "private";
    }

    // Kupanga commands kwa categories
    cm.map((com) => {
        if (!coms[com.categorie])
            coms[com.categorie] = [];
        coms[com.categorie].push(com.nomCom);
    });

    moment.tz.setDefault('Africa/Nairobi');
    const temps = moment().format('HH:mm:ss');
    const date = moment().format('DD/MM/YYYY');

    let infoMsg = `
╭──────────────────✰
┊✰───*𝚻𝚰𝚳𝚴𝚫𝐒𝚫 𝚻𝚳𝐃2*────✰
┊✍︎┊ *𝙐𝙎𝙀𝙍* : ${s.OWNER_NAME || 'Mtumiaji'}
┊✍︎┊ *𝙈𝙊𝘿𝙀* : ${mode}
┊✰───────────────✰
┊✍︎┊ *𝙏𝙄𝙈𝙀* : ${temps}  
┊✍︎┊ *𝘿𝘼𝙏𝙀* : ${date}
┊✍︎┊ *𝙍𝘼𝙈* : ${format(os.totalmem() - os.freemem())}/${format(os.totalmem())}
┊✰───────────────✰
╰──────────────────✰ \n\n`;
 
    let menuMsg = `*ᴛɪᴍɴᴀsᴀ ᴛᴍᴅ2 𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎*\n`;

    // Kutengeneza list ya commands
    for (const cat in coms) {
        menuMsg += `\n*╭────✰* *${cat.toUpperCase()}* *☯*`;
        for (const cmd of coms[cat]) {
            menuMsg += `\n*┊✞︎* ${prefixe}${cmd}`;
        }
        menuMsg += `\n*╰══════ᴛɪᴍɴᴀsᴀ ᴛᴍᴅ2═══════✰*\n`;
    }

    menuMsg += `\n*————ᴛɪᴍɴᴀsᴀ ᴛᴍᴅ2—————*`;

    try {
        var lien = mybotpic();
        
        if (lien && lien.match(/\.(mp4|gif)$/i)) {
            await zk.sendMessage(dest, { 
                video: { url: lien }, 
                caption: infoMsg + menuMsg, 
                footer: "Developed by Timnasa++", 
                gifPlayback: true 
            }, { quoted: ms });
        } else if (lien && lien.match(/\.(jpeg|png|jpg)$/i)) {
            await zk.sendMessage(dest, { 
                image: { url: lien }, 
                caption: infoMsg + menuMsg, 
                footer: "Timnasa-TMD2" 
            }, { quoted: ms });
        } else {
            await repondre(infoMsg + menuMsg);
        }
    } catch (e) {
        console.log("Menu Error: " + e);
        repondre("🥵 Erreur: " + e.message);
    }
});
