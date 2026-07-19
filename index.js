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
function getRandomUnhook() { return PURGE_BANNERS[Math.floor(Math.random() * PURGE_BANNERS.length)]; }

// ================= ANTI-RAID =================
const userMessageMap = new Map();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const member = message.member;
  if (!member) return;
  const botAvatar = client.user.displayAvatarURL({ dynamic: true });

  // SPAM + LINK
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

  // !stats
  if (message.content.startsWith("!stats")) {
    try {
      const res = await fetchWithTimeout(`https://api.injuries.to/v1/public/user?userId=${targetId}`);
      const data = await res.json();
      if (!data.success || !data.Normal) return message.reply("❌ No stats found.");

      const normal = data.Normal;
      const profile = data.Profile || {};
      const userName = profile.userName || targetUser.username;

      const embedTop = new EmbedBuilder().setColor(0x000000).setImage(BANNER_TOP);
      const embed = new EmbedBuilder().setColor(0x000000).setTitle(`— <a:emoji_20:1464222092353605735> NORMAL STATS —`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setDescription(`**USER:** \`${userName}\`\n\n<a:heart:1463322847546966087> **TOTAL STATS**\n\`\`\`Hits:     ${formatNumber(normal.Totals?.Accounts)}\nVisits:   ${formatNumber(normal.Totals?.Visits)}\nClicks:   ${formatNumber(normal.Totals?.Clicks)}\`\`\`\n\n<a:corrupt_card:1463245786421661718> **BIGGEST HITS**\n\`\`\`Summary:  ${formatNumber(normal.Highest?.Summary)}\nRAP:      ${formatNumber(normal.Highest?.Rap)}\nRobux:    ${formatNumber(normal.Highest?.Balance)}\`\`\``)
        .setImage(getRandomPurge())
        .setFooter({ text: `𝔏𝔞𝔯𝔭 𝔢𝔪𝔭𝔦𝔯𝔢 • Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

      await message.channel.send({ embeds: [embedTop, embed], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("View User").setStyle(ButtonStyle.Link).setURL(`https://discord.com/users/${targetId}`))] });
    } catch (err) { console.error(err); message.reply("❌ API timeout.").catch(() => null); }
  }

  // !daily
  if (message.content.startsWith("!daily")) {
    try {
      const res = await fetchWithTimeout(`https://api.injuries.to/v2/daily?userId=${targetId}`);
      const data = await res.json();
      if (!data.success) return message.reply("❌ No daily stats found.");

      const daily = data.Daily || data.Normal || {};
      const profile = data.Profile || {};
      const userName = profile.userName || targetUser.username;

      if (!daily.Totals) return message.reply("❌ No daily data available yet.");

      const embedTop = new EmbedBuilder().setColor(0x000000).setImage(BANNER_TOP);
      const embedDaily = new EmbedBuilder().setColor(0x000000).setTitle(`— <a:emoji_20:1464222092353605735> DAILY STATS —`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setDescription(`**USER:** \`${userName}\`\n\n<a:heart:1463322847546966087> **TOTAL DAILY STATS**\n\`\`\`Hits:     ${formatNumber(daily.Totals?.Accounts)}\nVisits:   ${formatNumber(daily.Totals?.Visits)}\nClicks:   ${formatNumber(daily.Totals?.Clicks)}\`\`\``)
        .setImage(getRandomPurge())
        .setFooter({ text: `𝔏𝔞𝔯𝔭 𝔢𝔪𝔭𝔦𝔯𝔢 • Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

      await message.channel.send({ embeds: [embedTop, embedDaily], components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("View User").setStyle(ButtonStyle.Link).setURL(`https://discord.com/users/${targetId}`))] });
    } catch (err) {
      console.error(err);
      message.reply("❌ Daily API issue.").catch(() => null);
    }
  }

  // !purge
  if (message.content.startsWith("!purge") && message.author.id === OWNER_ID) {
    try {
      const fetched = await message.channel.messages.fetch({ limit: 100 });
      const deleted = await message.channel.bulkDelete(fetched, true);
      const embed = new EmbedBuilder().setColor(0x000000).setTitle("Successfully purged").setDescription(`Deleted ${deleted.size} messages`).setImage(getRandomPurge()).setFooter({ text: "𝔏𝔞𝔯𝔭 𝔢𝔪𝔭𝔦𝔯𝔢 • Purge" });
      await message.channel.send({ embeds: [embed] });
    } catch (e) { message.reply("Purge failed.").catch(() => null); }
  }

  // !fuck
  if (message.content.startsWith("!fuck")) {
    const mention = message.mentions.users.first();
    if (!mention) return message.reply("❌ Mention a user!");
    await message.channel.send({ embeds: [new EmbedBuilder().setColor(0x000000).setTitle(`Fucking ${mention.username}`).setDescription(`<@${mention.id}>`).setImage(getRandomFuck()).setFooter({ text: `Requested by ${message.author.username}` })] });
  }

  // !unhook
  if (message.content.startsWith("!unhook")) {
    const embedTop = new EmbedBuilder().setColor(0x000000).setImage(getRandomUnhook());
    const embed = new EmbedBuilder().setColor(0x000000).setTitle("— <a:emoji_20:1464222092353605735> UNHOOK TUTORIAL —").setDescription(`If your beams do not say **"larp empire"** then you might be losing your beams.\nWatch the video below.`);
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("unhook_video").setLabel("Unhook").setStyle(ButtonStyle.Secondary));
    await message.channel.send({ embeds: [embedTop, embed], components: [row] });
  }

  // !help
  if (message.content.startsWith("!help")) {
    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle("— <a:emoji_20:1464222092353605735> HELP MENU —")
      .setDescription(`**Available Commands**\n\n**!stats [@user]**\n**!daily [@user]**\n**!fuck @user**\n**!purge** (owner)\n**!unhook**\n**!check** / \n**!create_ticket_panel** (owner)`)
      .setImage(getRandomPurge())
      .setFooter({ text: `Requested by ${message.author.username}` });
    await message.channel.send({ embeds: [embed] });
  }

  // !create_ticket_panel
  if (message.content.startsWith("!create_ticket_panel") && message.author.id === OWNER_ID) {
    const panelEmbeds = [
      { color: 0x000000, image: { url: BANNER_TOP } },
      { title: "— <a:emoji_20:1464222092353605735> 𝔏𝔞𝔯𝔭 𝔢𝔪𝔭𝔦𝔯𝔢  —", description: "<a:emoji_17:1463657710246691008> ʜᴇʟʟᴏ! ᴡᴇ ᴀʀᴇ ʜᴇʀᴇ ᴛᴏ ʜᴇʟᴘ ʏᴏᴜ.\n\n<a:emoji_18:1463658185901608991> ᴘʟᴇᴀsᴇ ᴄʜᴏᴏsᴇ ᴛʜᴇ ᴛʏᴘᴇ ᴏғ ʏᴏᴜʀ ɪssᴜᴇ.", color: 0x000000, image: { url: "https://i.imgur.com/3i5dler.gif" } }
    ];
    const selectMenu = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("ticket_select").setPlaceholder("Select Ticket Type").addOptions([
      { label: "roblox", value: "links", emoji: { id: "1463245786421661718", name: "corrupt_card" } },
      { label: "standoff2", value: "generator", emoji: { id: "1463657710246691008", name: "emoji_17" } },
      { label: "Others", value: "others", emoji: { id: "1463658185901608991", name: "emoji_18" } }
    ]));
    await message.channel.send({ embeds: panelEmbeds.map(e => EmbedBuilder.from(e)), components: [selectMenu] });
  }

  // ================= !check =================
  if (message.content.startsWith("!check") || message.content.startsWith("!domains")) {
    const checkingMsg = await message.channel.send({ embeds: [new EmbedBuilder().setColor(0x000000).setDescription("**Fetching status...**")] });

    try {
      const start = Date.now();
      const res = await fetchWithTimeout("https://www.logged.tg/dashboard", 15000);
      const latency = Date.now() - start;

      if (res.ok) {
        const onlineEmbed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setAuthor({ name: "Website Status", iconURL: "https://cdn3.emoji.gg/emojis/49198-online1.gif" })
          .setTitle("Website is online")
          .setThumbnail("https://cdn3.emoji.gg/emojis/49198-online1.gif")
          .setDescription(
            `<:wife2:1528425805099696148> **Response:** ${latency}ms\n` +
            `<:Wifee:1528425538358870117> **Status Code:** ${res.status}\n\n` +
            `**Browser Compatibility**\n` +
            `<:chroma:1528429000710557866>       <:verified2:1528430350546501642>\n` +
            `<:firefx:1528425451943362670>       <:verified2:1528430350546501642>\n` +
            `<:operaa:1528425324704956608>       <:verified2:1528430350546501642>\n` +
            `<:operagxb:1528424369120870491>     <:verified2:1528430350546501642>\n` +
            `<:internetexp:1528425385291944117>  <:verified2:1528430350546501642>`
          )
          .setImage("https://media4.giphy.com/media/v1.Y2lkPTZjMDliOTUybWt1bzMwMno2bGZvbTF0YWM0bXdwbnpwd3g5cHpsYjE3enR5a3ZlMCZlcD12MV9naWZfX3NlYXJjaCZjdD1n/6ULDGyRw0uhECEhAaQ/200.gif")
          .setFooter({ text: `Requested by ${message.author.username}` });

        await checkingMsg.edit({ embeds: [onlineEmbed] });
      } else throw new Error("Not OK");
    } catch (err) {
      const offlineEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setAuthor({ name: "<:tech:1528425582218448907>Website Status", iconURL: "https://cdn3.emoji.gg/emojis/9596-offline.gif" })
        .setTitle("<:nowifi:1528433695957192744>website  is offline")
        .setThumbnail("https://cdn3.emoji.gg/emojis/9596-offline.gif")
        .setDescription(`**Error:** Timeout\n**Unable to fetch from API**`)
        .setImage("https://media4.giphy.com/media/v1.Y2lkPTZjMDliOTUybWt1bzMwMno2bGZvbTF0YWM0bXdwbnpwd3g5cHpsYjE3enR5a3ZlMCZlcD12MV9naWZfX3NlYXJjaCZjdD1n/6ULDGyRw0uhECEhAaQ/200.gif")
        .setFooter({ text: `Requested by ${message.author.username}` });

      await checkingMsg.edit({ embeds: [offlineEmbed] });
    }
    return;
  }
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (interaction) => {
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {
    const type = interaction.values[0];
    const member = interaction.member;
    const guild = interaction.guild;
    const channelName = `${member.user.username}-${type}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    if (guild.channels.cache.find(c => c.name === channelName)) return interaction.reply({ content: `You already have a ticket: #${channelName}`, ephemeral: true });

    const ticketChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: TICKET_CATEGORY,
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        ...SUPPORT_ROLES.map(r => ({ id: r, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] })),
        { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });

    await interaction.reply({ content: `Ticket created: ${ticketChannel}`, ephemeral: true });

    const ticketEmbeds = [
      { color: 0x000000, image: { url: BANNER_TOP } },
      { title: "— <a:emoji_20:1464222092353605735> ᴛɪᴄᴋᴇᴛ —", description: "ᴡᴇʟᴄᴏᴍᴇ!\n\n<a:emoji_17:1463657710246691008> ᴘʟᴇᴀsᴇ ᴅᴇsᴄʀɪʙᴇ ʏᴏᴜʀ ɪssᴜᴇ ʜᴇʀᴇ.", color: 0x000000 }
    ];

    const closeButton = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("close_ticket").setLabel("Close Ticket").setStyle(ButtonStyle.Secondary));
    await ticketChannel.send({ embeds: ticketEmbeds.map(e => EmbedBuilder.from(e)), components: [closeButton] });
  }

  if (interaction.isButton() && interaction.customId === "unhook_video") await interaction.reply({ content: "**Video:**\nhttps://streamable.com/06tnbq" });
  if (interaction.isButton() && interaction.customId === "close_ticket") await interaction.channel.delete().catch(() => null);
});

// ================= AUTO-PURGE =================
setInterval(async () => {
  try {
    for (const guild of client.guilds.cache.values()) {
      for (const channelId of ["1525971262285807761"]) {
        const channel = guild.channels.cache.get(channelId);
        if (channel?.isTextBased()) {
          const fetched = await channel.messages.fetch({ limit: 50 }).catch(() => null);
          if (fetched?.size) await channel.bulkDelete(fetched, true).catch(() => null);
        }
      }
    }
  } catch (err) { console.error(err); }
}, 30 * 60 * 1000);

// LOGIN
client.login(TOKEN).then(() => console.log(`Logged in as ${client.user.tag}`));
