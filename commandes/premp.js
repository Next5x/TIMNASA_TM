const { zokou } = require("../framework/zokou");
const fs = require('fs-extra');

// Approve User
zokou({ nomCom: "approvex", categorie: "Sudo", reaction: "✅" }, async (dest, zk, repondeur) => {
    const { ms, msgRepondu, auteurMsgRepondu, superUser, arg } = repondeur;
    
    if (!superUser) return repondeur.repondre("Amri hii ni kwa Owner tu.");

    const pmDbPath = './database/pm_permit.json';
    let allowedUsers = JSON.parse(fs.readFileSync(pmDbPath));
    
    let userToApprove = msgRepondu ? auteurMsgRepondu : (arg[0] ? arg[0].replace(/[^0-9]/g, '') + "@s.whatsapp.net" : null);

    if (!userToApprove) return repondeur.repondre("Tafadhali jibu meseji ya mtu au weka namba.");

    if (!allowedUsers.includes(userToApprove)) {
        allowedUsers.push(userToApprove);
        fs.writeFileSync(pmDbPath, JSON.stringify(allowedUsers, null, 2));
        repondeur.repondre(`✅ Mtumiaji @${userToApprove.split('@')[0]} ameidhinishwa kutumia bot Inbox.`, { mentions: [userToApprove] });
    } else {
        repondeur.repondre("Mtumiaji huyu tayari anaruhusiwa.");
    }
});

// Disapprove User
zokou({ nomCom: "disapprove", categorie: "Sudo", reaction: "❌" }, async (dest, zk, repondeur) => {
    const { ms, msgRepondu, auteurMsgRepondu, superUser } = repondeur;
    
    if (!superUser) return repondeur.repondre("Amri hii ni kwa Owner tu.");

    const pmDbPath = './database/pm_permit.json';
    let allowedUsers = JSON.parse(fs.readFileSync(pmDbPath));
    
    let userToBlock = msgRepondu ? auteurMsgRepondu : null;
    if (!userToBlock) return repondeur.repondre("Jibu meseji ya mtu unayetaka kumzuia.");

    allowedUsers = allowedUsers.filter(u => u !== userToBlock);
    fs.writeFileSync(pmDbPath, JSON.stringify(allowedUsers, null, 2));
    repondeur.repondre(`❌ Ruhusa imeondolewa kwa @${userToBlock.split('@')[0]}.`, { mentions: [userToBlock] });
});
