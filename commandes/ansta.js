const { zokou } = require("../framework/zokou");
const fs = require('fs-extra');

zokou({ nomCom: "antistatus", categorie: "Group", reaction: "🛡️" }, async (dest, zk, repondeur) => {
    const { arg, superUser, verifAdmin } = repondeur;
    if (!superUser && !verifAdmin) return repondeur.repondre("Amri hii ni kwa ma-admin tu.");

    const config = JSON.parse(fs.readFileSync('./database/antistatus_config.json'));

    if (!arg[0]) {
        return repondeur.repondre(`*MIPANGILIO YA ANTI-STATUS:*
Status: ${config.settings.status}
Action: ${config.settings.action}
Limit: ${config.settings.warn_limit}

*Tumia hivi:*
.antistatus on/off
.antistatus action delete/warn/remove
.antistatus limit 5`);
    }

    if (arg[0] === "on" || arg[0] === "off") {
        config.settings.status = arg[0];
        repondeur.repondre(`Anti-status sasa imewekwa: ${arg[0]}`);
    } else if (arg[0] === "action" && arg[1]) {
        config.settings.action = arg[1];
        repondeur.repondre(`Action imebadilishwa kuwa: ${arg[1]}`);
    } else if (arg[0] === "limit" && arg[1]) {
        config.settings.warn_limit = parseInt(arg[1]);
        repondeur.repondre(`Warn limit imewekwa: ${arg[1]}`);
    }

    fs.writeFileSync('./database/antistatus_config.json', JSON.stringify(config, null, 2));
});
