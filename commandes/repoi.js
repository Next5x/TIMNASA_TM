"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { zokou } = require("../framework/zokou");

zokou({ nomCom: "repo", catégorie:"Général", reaction: "❄", nomFichier: __filename }, async (dest, zk, commandeOptions) => {
  const githubRepo = 'https://github.com/Next5x/TIMNASA_TMD1;
  const img = 'https://files.catbox.moe/zm113g.jpg';

  try {
    const response = await fetch(githubRepo);
    const data = await response.json();

    if (data) {
      const repoInfo = {
        stars: data.stargazers_count,
        forks: data.forks_count,
        lastUpdate: data.updated_at,
        owner: data.owner.login,
      };

      const releaseDate = new Date(data.created_at).toLocaleDateString('en-GB');
      const lastUpdateDate = new Date(data.updated_at).toLocaleDateString('en-GB');

      const gitdata = `*𝗛𝗶, 𝗜 𝗮𝗺* *₮ł₥₦₳₴₳_₮₥Đ2.*\n  
🎲│ *𝗣𝗮𝗶𝗿 𝗰𝗼𝗱* https://timnasa-happ-new-year-2026.onrender.com
🪔│ *𝗥𝗲𝗽𝗼:* ${data.html_url}
🌟│ *𝗦𝘁𝗮𝗿𝘀:* ${repoInfo.stars}
🪡│ *𝗙𝗼𝗿𝗸𝘀:* ${repoInfo.forks}
🎯│ *𝗥𝗲𝗹𝗲𝗮𝘀𝗲 𝗗𝗮𝘁𝗲:* ${releaseDate}
✅│ *𝗨𝗽𝗱𝗮𝘁𝗲𝗱 𝗼𝗻:* ${repoInfo.lastUpdate}
💫│ *𝗢𝘄𝗻𝗲𝗿:*  ${ownerinfo.name}
__________________________________
                  
╭─────────────━┈⊷• 
│●│ *ᯤ ᴛɪᴍɴᴀsᴀ-ᴍᴅ: ᴄᴏɴɴᴇᴄᴛᴇᴅ* 
│•───────────━┈⊷│■▪︎
│•───────────━┈⊷│■▪︎
│¤│name: ᴛɪᴍᴏᴛʜ.ᴛɪᴍɴᴀsᴀ
│•───────────━┈⊷│■▪︎
│•───────────━┈⊷│■▪︎
│○│ᴍᴀᴅᴇ: ғʀᴏᴍ ᴛᴀɴᴢᴀɴɪᴀ 🇹🇿 
│•───────────━┈⊷│■▪︎
│•───────────━┈⊷│■▪︎
╰─────────────━┈⊷•⁠⁠⁠⁠`;

      await zk.sendMessage(dest, { image: { url: img }, caption: gitdata });
    } else {
      console.log("Could not fetch data");
    }
  } catch (error) {
    console.log("Error fetching data:", error);
  }
});
