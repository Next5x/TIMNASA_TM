"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { zokou } = require("../framework/zokou");
const axios = require("axios"); // Tutatumia axios badala ya fetch kwa uthabiti zaidi
const s = require(__dirname + "/../set");

zokou({ nomCom: "repo", categorie: "General", reaction: "❄" }, async (dest, zk, commandeOptions) => {
  const { ms, repondre } = commandeOptions;
  
  // Link ya API ya GitHub (Badala ya link ya kawaida)
  const repoApi = "https://api.github.com/repos/Next5x/TIMNASA_TMD1";
  const img = 'https://files.catbox.moe/zm113g.jpg';

  try {
    const response = await axios.get(repoApi);
    const data = response.data;

    if (data) {
      const stars = data.stargazers_count;
      const forks = data.forks_count;
      const releaseDate = new Date(data.created_at).toLocaleDateString('en-GB');
      const lastUpdate = new Date(data.updated_at).toLocaleDateString('en-GB');

      const gitdata = `*𝗛𝗶, 𝗜 𝗮𝗺* *₮ł₥₦₳₴₳_₮₥Đ2.*\n  
╭─────────────━┈⊷•
│🎲│ *𝗣𝗮𝗶𝗿 𝗰𝗼𝗱𝗲:* https://timnasa-happ-new-year-2026.onrender.com
│🪔│ *𝗥𝗲𝗽𝗼:* ${data.html_url}
│🌟│ *𝗦𝘁𝗮𝗿𝘀:* ${stars}
│🪡│ *𝗙𝗼𝗿𝗸𝘀:* ${forks}
│🎯│ *𝗥𝗲𝗹𝗲𝗮𝘀𝗲 𝗗𝗮𝘁𝗲:* ${releaseDate}
│✅│ *𝗨𝗽𝗱𝗮𝘁𝗲𝗱 𝗼𝗻:* ${lastUpdate}
│💫│ *𝗢𝘄𝗻𝗲𝗿:* ${s.OWNER_NAME}
╰─────────────━┈⊷•⁠⁠⁠⁠
                  
╭─────────────━┈⊷• 
│●│ *ᯤ ᴛɪᴍɴᴀsᴀ-ᴍᴅ: ᴄᴏɴɴᴇᴄᴛᴇᴅ* 
│¤│ NAME: ᴛɪᴍᴏᴛʜ.ᴛɪᴍɴᴀsᴀ
│○│ MADE: ғʀᴏᴍ ᴛᴀɴᴢᴀɴɪᴀ 🇹🇿 
╰─────────────━┈⊷•⁠⁠⁠⁠`;

      await zk.sendMessage(dest, { 
        image: { url: img }, 
        caption: gitdata 
      }, { quoted: ms });
    }
  } catch (error) {
    console.log("Error fetching data: " + error);
    repondre("🥵 Error fetching repository data: " + error.message);
  }
});
