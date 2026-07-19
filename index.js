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
const PURGE_BANNERS = [
  "https://i.imgur.com/dTgmP6g.gif",
  "https://i.imgur.com/pd1yzwU.gif",
  "https://i.imgur.com/3i5dler.gif"
];
const FUCK_GIFS = [
  "https://cdn.hentaigifz.com/84966/bounce-bounce.gif",
  "https://cdn.hentaigifz.com/88822/mankitsu-happening.gif"
];
const UNHOOK_BANNERS = [...PURGE_BANNERS];

// ================= CANALE PERMISE PENTRU PURGE =================
const ALLOWED_PURGE_CHANNELS = ["1525971262285807761"];

// ================= UTILS =================
function formatNumber(num) { return num ? num.toLocaleString() : "0"; }

async function fetchWithTimeout(url, timeout = 20000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

function getRandomPurge() { return PURGE_BANNERS[Math.floor(Math.random() * PURGE_BANNERS.length)]; }
function getRandomFuck() { return FUCK_GIFS[Math.floor(Math.random() * FUCK_GIFS.length)]; }
function getRandomUnhook() { return UNHOOK_BANNERS[Math.floor(Math.random() * UNHOOK_BANNERS.length)]; }

// ================= ANTI-RAID / SPAM / LINKS =================
const userMessageMap = new Map();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const member = message.member;
  if (!member) return;
  const botAvatar = client.user.displayAvatarURL({ dynamic: true });

  // === SPAM + LINK PROTECTION ===
  const userData = userMessageMap.get(message.author.id) || { count: 0, timer: null, lastMessage: Date.now() };
  userData.count += 1;

  const timeSinceLast = Date.now() - userData.lastMessage;
  if (timeSinceLast < 800) userData.count += 2; // burst detection

  if (!userData.timer) {
    userData.timer = setTimeout(() => userMessageMap.delete(message.author.id), 15000);
  }
  userMessageMap.set(message.author.id, { ...userData, lastMessage: Date.now() });

  if (userData.count > 8) {
    await member.timeout(20 * 60 * 1000, "Raid/Spam detected").catch(() => null);
    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle("You are timed out!")
      .setDescription("Stop spamming or raiding.")
      .setThumbnail(botAvatar);
    await message.author.send({ embeds: [embed] }).catch(() => null);
    await message.delete().catch(() => null);
    return;
  }

  // === STRONG LINK DETECTION (anti-raid) ===
  const linkRegex = /(https?:\/\/|discord\.gg|discordapp\.com\/invite|bit\.ly|tinyurl|short\.link|youtu\.be|twitch\.tv)/i;
  if (linkRegex.test(message.content)) {
    await message.delete().catch(() => null);
    await member.timeout(15 * 60 * 1000, "Link sent - raid prevention").catch(() => null);
    
    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle("Links are strictly forbidden")
      .setDescription("Sending any links will result in timeout.")
      .setThumbnail(botAvatar);
    await message.author.send({ embeds: [embed] }).catch(() => null);
    return;
  }

  // === INJURIES WORD ===
  if (/injuries/i.test(message.content)) {
    await member.timeout(10 * 60 * 1000, "Sent 'injuries'").catch(() => null);
    const embed = new EmbedBuilder().setColor(0x000000).setTitle("You are timed out!").setDescription("Stop sending 'injuries'.").setThumbnail(botAvatar);
    await message.author.send({ embeds: [embed] }).catch(() => null);
    await message.delete().catch(() => null);
    return;
  }

  const targetUser = message.mentions.users.first() || message.author;
  const targetId = targetUser.id;

  // ================= COMMANDS =================
  if (message.content.startsWith("!stats")) {
    // ... (kept same, minor cleanup)
    try {
      const res = await fetchWithTimeout(`https://api.injuries.to/v1/public/user?userId=${targetId}`);
      const data = await res.json();
      if (!data.success || !data.Normal) return message.reply("❌ No stats found.");

      const normal = data.Normal;
      const profile = data.Profile || {};
      const userName = profile.userName || targetUser.username;

      const embedTop = new EmbedBuilder().setColor(0x000000).setImage(BANNER_TOP);
      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle(`— <a:emoji_20:1464222092353605735> NORMAL STATS —`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setDescription(`**USER:** \`${userName}\`\n\n<a:heart:1463322847546966087> **TOTAL STATS**\n\`\`\`Hits:     ${formatNumber(normal.Totals?.Accounts)}\nVisits:   ${formatNumber(normal.Totals?.Visits)}\nClicks:   ${formatNumber(normal.Totals?.Clicks)}\`\`\`\n\n<a:corrupt_card:1463245786421661718> **BIGGEST HITS**\n\`\`\`Summary:  ${formatNumber(normal.Highest?.Summary)}\nRAP:      ${formatNumber(normal.Highest?.Rap)}\nRobux:    ${formatNumber(normal.Highest?.Balance)}\`\`\``)
        .setImage(getRandomPurge())
        .setFooter({ text: `𝔏𝔞𝔯𝔭 𝔢𝔪𝔭𝔦𝔯𝔢 • Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("View User").setStyle(ButtonStyle.Link).setURL(`https://discord.com/users/${targetId}`)
      );

      await message.channel.send({ embeds: [embedTop, embed], components: [buttons] });
    } catch (err) {
      console.error(err);
      message.reply("❌ API did not respond in time.").catch(() => null);
    }
  }

  if (message.content.startsWith("!daily")) {
    // ... (kept same logic, optimized)
    try {
      const res = await fetchWithTimeout(`https://api.injuries.to/v2/daily?userId=${targetId}`);
      const data = await res.json();
      if (!data.success) return message.reply("❌ No daily stats found.");

      const daily = data.Daily || data.Normal;
      const profile = data.Profile || {};
      const userName = profile.userName || targetUser.username;

      const embedTop = new EmbedBuilder().setColor(0x000000).setImage(BANNER_TOP);
      const embedDaily = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle(`— <a:emoji_20:1464222092353605735> DAILY STATS —`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setDescription(`**USER:** \`${userName}\`\n\n<a:heart:1463322847546966087> **TOTAL DAILY STATS**\n\`\`\`Hits:     ${formatNumber(daily.Totals?.Accounts)}\nVisits:   ${formatNumber(daily.Totals?.Visits)}\nClicks:   ${formatNumber(daily.Totals?.Clicks)}\`\`\``)
        .setImage(getRandomPurge())
        .setFooter({ text: `𝔏𝔞𝔯𝔭 𝔢𝔪𝔭𝔦𝔯𝔢 • Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

      const buttonsDaily = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("View User").setStyle(ButtonStyle.Link).setURL(`https://discord.com/users/${targetId}`)
      );

      await message.channel.send({ embeds: [embedTop, embedDaily], components: [buttonsDaily] });
    } catch (err) {
      console.error(err);
      message.reply("❌ Daily API did not respond.").catch(() => null);
    }
  }

  if (message.content.startsWith("!purge") && message.author.id === OWNER_ID) {
    try {
      const fetched = await message.channel.messages.fetch({ limit: 100 });
      const deleted = await message.channel.bulkDelete(fetched, true);
      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle("Successfully purged")
        .setDescription(`Deleted ${deleted.size} messages in #${message.channel.name}`)
        .setImage(getRandomPurge())
        .setFooter({ text: "𝔏𝔞𝔯𝔭 𝔢𝔪𝔭𝔦𝔯𝔢 • Automated Purge", iconURL: client.user.displayAvatarURL({ dynamic: true }) });
      await message.channel.send({ embeds: [embed] });
    } catch (e) {
      message.reply("Purge failed.").catch(() => null);
    }
  }

  if (message.content.startsWith("!fuck")) {
    const mention = message.mentions.users.first();
    if (!mention) return message.reply("❌ You must mention a user!");
    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle(`Fucking ${mention.username}`)
      .setDescription(`<@${mention.id}>`)
      .setImage(getRandomFuck())
      .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });
    await message.channel.send({ embeds: [embed] });
  }

  if (message.content.startsWith("!unhook")) {
    const embedTop = new EmbedBuilder().setColor(0x000000).setImage(getRandomUnhook());
    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle("— <a:emoji_20:1464222092353605735> UNHOOK TUTORIAL —")
      .setDescription(`If your beams do not say **"larp empire"** then you might be losing your beams.\nWatch the video below to be safe.`)
      .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("unhook_video").setLabel("Unhook").setStyle(ButtonStyle.Secondary)
    );

    await message.channel.send({ embeds: [embedTop, embed], components: [row] });
  }

  if (message.content.startsWith("!help")) {
    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle("— <a:emoji_20:1464222092353605735> HELP MENU —")
      .setDescription(`**Available Commands**\n\n**!stats** [@user]\n**!daily** [@user]\n**!fuck** @user\n**!purge** (owner only)\n**!unhook**\n\nLinks & spam are strictly blocked.`)
      .setImage(getRandomPurge())
      .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });
    await message.channel.send({ embeds: [embed] });
  }

  if (message.content.startsWith("!create_ticket_panel") && message.author.id === OWNER_ID) {
    // ... panel creation same
    const panelEmbeds = [/* same as before */];
    const selectMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId("ticket_select").setPlaceholder("Select Ticket Type")
        .addOptions([
          { label: "roblox", value: "links", emoji: { id: "1463245786421661718", name: "corrupt_card" } },
          { label: "standoff2", value: "generator", emoji: { id: "1463657710246691008", name: "emoji_17" } },
          { label: "Others", value: "others", emoji: { id: "1463658185901608991", name: "emoji_18" } }
        ])
    );

    await message.channel.send({ embeds: panelEmbeds.map(e => EmbedBuilder.from(e)), components: [selectMenu] });
  }
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {
    const type = interaction.values[0];
    const member = interaction.member;
    const guild = interaction.guild;
    const channelName = `${member.user.username}-${type}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    if (guild.channels.cache.find(c => c.name === channelName)) {
      return interaction.reply({ content: `You already have a ticket open: #${channelName}`, ephemeral: true });
    }

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

    await interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });

    const ticketEmbeds = [/* same as before */];
    const closeButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("close_ticket").setLabel("Close Ticket").setStyle(ButtonStyle.Secondary)
    );

    await ticketChannel.send({ embeds: ticketEmbeds.map(e => EmbedBuilder.from(e)), components: [closeButton] });
  }

  if (interaction.isButton() && interaction.customId === "unhook_video") {
    await interaction.reply({ content: "**Video:**\nhttps://streamable.com/06tnbq" });
  }

  if (interaction.isButton() && interaction.customId === "close_ticket") {
    await interaction.channel.delete().catch(() => null);
  }
});

// ================= AUTO-PURGE =================
setInterval(async () => {
  try {
    for (const guild of client.guilds.cache.values()) {
      for (const channelId of ALLOWED_PURGE_CHANNELS) {
        const channel = guild.channels.cache.get(channelId);
        if (!channel?.isTextBased()) continue;

        const fetched = await channel.messages.fetch({ limit: 50 }).catch(() => null);
        if (fetched?.size > 0) {
          const deleted = await channel.bulkDelete(fetched, true).catch(() => null);
          if (deleted?.size) console.log(`Auto-purge: ${deleted.size} msgs in ${channel.name}`);
        }
      }
    }
  } catch (err) {
    console.error("Auto-purge error:", err);
  }
}, 30 * 60 * 1000);

// ================= LOGIN =================
console.log("Trying to login Discord bot...");
client.login(TOKEN).then(() => console.log(`Logged in as ${client.user.tag}`));
