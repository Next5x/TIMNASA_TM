"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { zokou } = require("../framework/zokou");

zokou({ nomCom: "repo", catégorie:"General", reaction: "👊", nomFichier: __filename }, async (dest, zk, commandeOptions) => {
  const githubRepo = 'https://api.github.com/repos/next5x/TIMNASA_TMD';
  const img = 'https://files.catbox.moe/f4ft7z.jpg';

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

      const gitdata = `*ʜᴇʟʟᴏᴡ ᴡʜᴀᴛsᴀᴀᴘ ᴜsᴇʀ
ᴛʜɪs ɪs* *𝐃𝚰𝐋 𝐊𝚫𝚴𝚯 𝚻𝚳𝐃 .*\n sᴜᴘᴘᴏʀᴛ ᴏᴜʀ ᴄʜᴀɴɴᴇʟ *ʙʏ*,  https://whatsapp.com/channel/0029VajweHxKQuJP6qnjLM31

╔═━━━━════──────➳
║╔═━━━━━━════─━━─➳
║║ 🗼 *REPOSITORY:* ${data.html_url}
║║ 🌟 *STARS:* ${repoInfo.stars}
║║ 🧧 *FORKS:* ${repoInfo.forks}
║║ 📅 *RELEASE DATE:* ${releaseDate}
║║ 🕐 *UPDATE ON:* ${repoInfo.lastUpdate}
║║ 👨‍💻 *OWNER:* *DIL KANO*
║║ 💞 *NAME:* *TIMNASA*
║║ 🥰 *ENJOY TO USE 𝐃𝚰𝐋 𝐊𝚫𝚴𝚯 𝚻𝚳𝐃 * ╚══━━━━════─━━━━──➳
╚══━━━━════─━━━━──➳`;

      await zk.sendMessage(dest, { image: { url: img }, caption: gitdata });
    } else {
      console.log("Could not fetch data");
    }
  } catch (error) {
    console.log("Error fetching data:", error);
  }
});
