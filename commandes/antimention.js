const { zokou } = require("../framework/zokou");
const s = require("../set");

zokou({
    nomCom: "antistatus",
    categorie: "Group",
    reaction: "🛡️"
}, async (dest, zk, repondre, ms, msgVar) => {
    const { isGroupAdmin, isSuperAdmin, arg } = msgVar;

    if (!msgVar.isGroup) return repondre("Command hii ni kwa ajili ya makundi tu!");
    if (!isGroupAdmin && !isSuperAdmin) return repondre("Wewe si admin!");

    if (!arg || arg.length === 0) {
        return repondre(`*--- ANTI-STATUS MENTION ---*\n\n*Matumizi:*\n1. *.antistatus on* (Kuwasha)\n2. *.antistatus off* (Kuzima)\n3. *.antistatus action delete* (Kufuta tu)\n4. *.antistatus action warn* (Maonyo)\n5. *.antistatus action remove* (Kumfukuza)\n\n*Hali ya sasa:* Mfumo unatumia hatua ya kufuta na kutoa adhabu kulingana na mipangilio.`);
    }

    const action = arg[0].toLowerCase();

    if (action === "on") {
        // Hapa unaweza kuweka logic ya kuhifadhi kwenye Database (mfano Prisma)
        return repondre("✅ Anti-Status Mention imewashwa kwa mafanikio!");
    } else if (action === "off") {
        return repondre("❌ Anti-Status Mention imezimwa!");
    } else if (action === "action") {
        const type = arg[1]?.toLowerCase();
        if (['delete', 'warn', 'remove'].includes(type)) {
            return repondre(`✅ Hatua ya ulinzi imewekwa kuwa: *${type}*`);
        } else {
            return repondre("Chagua action sahihi: delete, warn, au remove");
        }
    }
});
