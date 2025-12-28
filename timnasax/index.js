"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { zokou } = require("../framework/zokou");

zokou({
    nomCom: "toa",
    categorie: "Group",
    reaction: "👋"
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, verifAdmin, verifZokouAdmin, msgRepondu, auteurMsgRepondu, auteurMessage, superUser } = commandeOptions;

    // 1. Angalia kama ni kundi
    if (!dest.endsWith("@g.us")) {
        return repondre("Amri hii inatumika kwenye makundi pekee.");
    }

    // 2. Angalia kama anayetumia amri ni Admin au Sudo
    if (!verifAdmin && !superUser) {
        return repondre("Amri hii ni kwa ajili ya Admins pekee.");
    }

    // 3. Angalia kama Bot ni Admin
    if (!verifZokouAdmin) {
        return repondre("Nifanye niwe Admin kwanza ili niondoe watu.");
    }

    // 4. Pata JID ya mtu wa kuondolewa
    let userToRemove = msgRepondu ? auteurMsgRepondu : (ms.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]);

    if (!userToRemove) {
        return repondre("Tafadhali mtag mtu au reply ujumbe wake unayetaka kumuondoa.");
    }

    // 5. Zuia bot kujitoa yenyewe au kutoa admin mwingine (hiari)
    if (userToRemove === zk.user.id.split(':')[0] + "@s.whatsapp.net") {
        return repondre("Siwezi kujitoa mwenyewe.");
    }

    try {
        await zk.groupParticipantsUpdate(dest, [userToRemove], "remove");
        repondre("Mtumiaji ameondolewa kwa mafanikio.");
    } catch (e) {
        repondre("Imeshindikana kumuondoa mtumiaji. Huenda ni Admin au hayupo tena.");
        console.log(e);
    }
});
