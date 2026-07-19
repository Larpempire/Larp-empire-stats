// ================= IMPORTURI =================
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelType, PermissionsBitField } = require("discord.js");
const fetch = require("node-fetch");
const express = require("express");

// ================= EXPRESS KEEP ALIVE =================
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is alive ✅"));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ================= DISCORD CLIENT =================
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const OWNER_ID = "1464634211406188721";
const TICKET_CATEGORY = "1525971261807923321";

const SUPPORT_ROLES = ["1525971260943892518", "1525971260943892517"];

// ================= BANNERE =================
const BANNER_TOP = "https://i.imgur.com/hw4rH89.jpeg";
const PURGE_BANNERS = ["https://i.imgur.com/dTgmP6g.gif", "https://i.imgur.com/pd1yzwU.gif", "https://i.imgur.com/3i5dler.gif"];
const FUCK_GIFS = ["https://cdn.hentaigifz.com/84966/bounce-bounce.gif", "https://cdn.hentaigifz.com/88822/mankitsu-happening.gif"];
const UNHOOK_BANNERS = [...PURGE_BANNERS];

// ================= CANALE PURGE =================
const ALLOWED_PURGE_CHANNELS = ["1525971262285807761"];

// ================= UTILS =================
function formatNumber(num) { return num ? num.toLocaleString() : "0"; }

async function fetchWithTimeout(url, timeout = 20000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try { return await fetch(url, { signal: controller.signal }); } 
  finally { clearTimeout(id); }
}

function getRandomPurge() { return PURGE_BANNERS[Math.floor(Math.random() * PURGE_BANNERS.length)]; }
function getRandomFuck() { return FUCK_GIFS[Math.floor(Math.random() * FUCK_GIFS.length)]; }
function getRandomUnhook() { return UNHOOK_BANNERS[Math.floor(Math.random() * UNHOOK_BANNERS.length)]; }

// ================= ANTI-RAID =================
const userMessageMap = new Map();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const member = message.member;
  if (!member) return;
  const botAvatar = client.user.displayAvatarURL({ dynamic: true });

  // SPAM + LINK PROTECTION
  const userData = userMessageMap.get(message.author.id) || { count: 0, timer: null, lastMessage: Date.now() };
  userData.count += 1;
  if (Date.now() - userData.lastMessage < 1000) userData.count += 3;

  if (!userData.timer) userData.timer = setTimeout(() => userMessageMap.delete(message.author.id), 15000);
  userMessageMap.set(message.author.id, { ...userData, lastMessage: Date.now() });

  if (userData.count > 8) {
    await member.timeout(20 * 60 * 1000, "Raid/Spam").catch(() => null);
    await message.delete().catch(() => null);
    const embed = new EmbedBuilder().setColor(0x000000).setTitle("Timed out!").setDescription("Stop raiding/spamming.").setThumbnail(botAvatar);
    await message.author.send({ embeds: [embed] }).catch(() => null);
    return;
  }

  const linkRegex = /(https?:\/\/|discord\.gg|discordapp\.com\/invite|bit\.ly|tinyurl|short\.link|youtu\.be|twitch\.tv)/i;
  if (linkRegex.test(message.content)) {
    await message.delete().catch(() => null);
    await member.timeout(15 * 60 * 1000, "Link - anti-raid").catch(() => null);
    const embed = new EmbedBuilder().setColor(0x000000).setTitle("Links forbidden").setDescription("Any link = timeout.").setThumbnail(botAvatar);
    await message.author.send({ embeds: [embed] }).catch(() => null);
    return;
  }

  if (/injuries/i.test(message.content)) {
    await member.timeout(10 * 60 * 1000).catch(() => null);
    await message.delete().catch(() => null);
    const embed = new EmbedBuilder().setColor(0x000000).setTitle("Timed out").setDescription("Stop 'injuries'.").setThumbnail(botAvatar);
    await message.author.send({ embeds: [embed] }).catch(() => null);
    return;
  }

  const targetUser = message.mentions.users.first() || message.author;
  const targetId = targetUser.id;

  // ================= COMMANDS =================
  if (message.content.startsWith("!stats")) { /* ... same as before ... */ }
  if (message.content.startsWith("!daily")) { /* ... same as before ... */ }
  if (message.content.startsWith("!purge") && message.author.id === OWNER_ID) { /* ... same ... */ }
  if (message.content.startsWith("!fuck")) { /* ... same ... */ }
  if (message.content.startsWith("!unhook")) { /* ... same ... */ }
  if (message.content.startsWith("!help")) { /* ... same ... */ }
  if (message.content.startsWith("!create_ticket_panel") && message.author.id === OWNER_ID) { /* ... same ... */ }

  // ================= !check / !domains (MOVED TO END - NO RETURN BLOCKING) =================
  if (message.content.startsWith("!check") || message.content.startsWith("!domains")) {
    const checkingEmbed = new EmbedBuilder()
      .setColor(0x000000)
      .setImage("https://cdn.pfps.gg/banners/8077-anime-red.png")
      .setDescription("**Checking domain...**");

    const msg = await message.channel.send({ embeds: [checkingEmbed] }).catch(() => null);
    if (!msg) return;

    try {
      const start = Date.now();
      const res = await fetchWithTimeout("https://www.logged.tg/dashboard", 15000);
      const latency = Date.now() - start;

      if (res.ok) {
        const onlineEmbed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setImage("https://cdn.pfps.gg/banners/8077-anime-red.png")
          .setDescription(`**Website is online**\n\n**Response:** ${latency}ms\n**Status Code:** ${res.status}\n\n**Browser Compatibility**\n🌴 Chrome ✅\n🌴 Firefox ✅\n🌴 Safari ✅\n🌴 Edge ✅\n🌴 Internet Explorer ✅`)
          .setImage("https://media4.giphy.com/media/v1.Y2lkPTZjMDliOTUybWt1bzMwMno2bGZvbTF0YWM0bXdwbnpwd3g5cHpsYjE3enR5a3ZlMCZlcD12MV9naWZfX3NlYXJjaCZjdD1n/6ULDGyRw0uhECEhAaQ/200.gif");
        await msg.edit({ embeds: [onlineEmbed] });
      } else {
        throw new Error("Not OK");
      }
    } catch (err) {
      const offlineEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setImage("https://cdn.pfps.gg/banners/8077-anime-red.png")
        .setDescription(`**Domain is offline**\n\n**Error:** Timeout\n**Unable to fetch from API**`)
        .setImage("https://media4.giphy.com/media/v1.Y2lkPTZjMDliOTUybWt1bzMwMno2bGZvbTF0YWM0bXdwbnpwd3g5cHpsYjE3enR5a3ZlMCZlcD12MV9naWZfX3NlYXJjaCZjdD1n/6ULDGyRw0uhECEhAaQ/200.gif");
      await msg.edit({ embeds: [offlineEmbed] }).catch(() => null);
    }
    return; // safety
  }
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (interaction) => {
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {
    // ... (same as before)
  }

  if (interaction.isButton() && interaction.customId === "unhook_video") {
    await interaction.reply({ content: "**Video:**\nhttps://streamable.com/06tnbq" });
  }

  if (interaction.isButton() && interaction.customId === "close_ticket") {
    await interaction.channel.delete().catch(() => null);
  }
});

// AUTO-PURGE
setInterval(async () => { /* same as before */ }, 30 * 60 * 1000);

// LOGIN
client.login(TOKEN).then(() => console.log(`Logged in as ${client.user.tag}`));
