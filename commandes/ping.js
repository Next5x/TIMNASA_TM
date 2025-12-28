const { zokou } = require("../framework/zokou");
const conf = require(__dirname + '/../set');
const moment = require("moment-timezone");
const os = require("os");

// Helper: format seconds into “X d, Y h, Z m, S s”
function formatDuration(sec) {
  sec = Number(sec);
  const days = Math.floor(sec / 86400);
  sec %= 86400;
  const hrs = Math.floor(sec / 3600);
  sec %= 3600;
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hrs) parts.push(`${hrs}h`);
  if (mins) parts.push(`${mins}m`);
  if (secs) parts.push(`${secs}s`);
  return parts.join(", ");
}

zokou(
  {
    nomCom: "pingx",
    desc: "Angalia kasi ya bot",
    categorie: "General",
    reaction: "⚡",
  },
  async (dest, zk, opts) => {
    const { ms } = opts;
    
    // Anza kuhesabu muda
    const start = Date.now();
    
    // Muda wa Afrika/Nairobi au Dar es Salaam
    const time = moment().tz("Africa/Nairobi").format("HH:mm:ss");
    const date = moment().tz("Africa/Nairobi").format("DD/MM/YYYY");
    
    // Malizia kuhesabu (Real Latency)
    const end = Date.now();
    const ping = end - start;

    const uptime = formatDuration(process.uptime());

    const pingMsg = `*Ƶ𝓞ｋØ𝓊-𝓜𝓓 ᴘɪɴɢ* ⚡

📡 *Kasi:* ${ping} ms
⏱️ *Muda:* ${time}
📅 *Tarehe:* ${date}
⏳ *Uptime:* ${uptime}
🟢 *Hali:* Ni mzima (Alive)
🌍 *Nchi:* Tanzania

📢 *Channel:* https://whatsapp.com/channel/0029VaaqaSp79PwS6p8dn71w

> *Powered by Djalega++*`;

    try {
      // Picha ya random kutoka kwenye list yako
      const njabulox = [
        "https://files.catbox.moe/mhhku3.jpeg",
        "https://files.catbox.moe/t5v7hj.jpg",
        "https://files.catbox.moe/x0zjpf.jpg",
        "https://files.catbox.moe/bnb3vx.jpg"
      ];
      const randomImg = njabulox[Math.floor(Math.random() * njabulox.length)];

      await zk.sendMessage(dest, { 
        image: { url: randomImg }, 
        caption: pingMsg 
      }, { quoted: ms });

    } catch (error) {
      console.log("Ping Error: " + error);
    }
  }
);
