// ================= IMPORTURI =================
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const fetch = require("node-fetch");
const express = require("express");

// ================= EXPRESS KEEP ALIVE =================
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is alive ✅"));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ================= DISCORD CLIENT =================
const client = new Client({
  intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent ]
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const OWNER_ID = "1464634211406188721";

const SUPPORT_ROLES = [
  "1525971260943892518",
  "1525971260943892517"
];

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
const UNHOOK_BANNERS = [
  "https://i.imgur.com/dTgmP6g.gif",
  "https://i.imgur.com/pd1yzwU.gif",
  "https://i.imgur.com/3i5dler.gif"
];
// ================= CANALE PERMISE PENTRU PURGE =================
const ALLOWED_PURGE_CHANNELS = [
  "1525971262285807761"
];

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
function getRandomUnhook() {
    return UNHOOK_BANNERS[Math.floor(Math.random()*UNHOOK_BANNERS.length)];
}
// ================= LOGIN =================
console.log("Trying to login Discord bot...");
client.login(TOKEN).then(() => console.log(`Logged in as ${client.user.tag}`));

// ================= ANTI-SPAM / LINK / INJURIES =================
const userMessageMap = new Map(); 

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const member = message.member;
  const botAvatar = client.user.displayAvatarURL({ dynamic: true });

  // SPAM
  const userData = userMessageMap.get(message.author.id) || { count: 0, timer: null };
  userData.count += 1;
  if (!userData.timer) { userData.timer = setTimeout(() => userMessageMap.delete(message.author.id), 10000); }
  userMessageMap.set(message.author.id, userData);

  if (userData.count > 10) {
    await member.timeout(10 * 60 * 1000, "Spam detected").catch(() => null);

    // ================= MODIFICARE TIMEOUT =================
    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle("You are timed out!")
      .setDescription("Please stop spamming.")
      .setThumbnail(botAvatar);

    // mesaj vizibil doar pentru persoana care a primit timeout
    await message.author.send({ embeds: [embed] }).catch(() => null);

    return; // oprește continuarea codului
  }

  // LINK DETECTION
  if (/(https?:\/\/[^\s]+)/g.test(message.content)) {
    await message.delete().catch(() => null);
    const embed = new EmbedBuilder().setColor(0x000000).setTitle("You cannot send links here!").setDescription("Links are not allowed on this server.").setThumbnail(botAvatar);
    await message.author.send({ embeds: [embed] }).catch(() => null);
    return;
  }

  // INJURIES
  if (/injuries/i.test(message.content)) {
    await member.timeout(10 * 60 * 1000, "Sent 'injuries'").catch(() => null);
    const embed = new EmbedBuilder().setColor(0x000000).setTitle("You are timed out!").setDescription("Stop sending 'injuries'.").setThumbnail(botAvatar);
    await message.author.send({ embeds: [embed] }).catch(() => null);
    return;
  }

  const targetUser = message.mentions.users.first() || message.author;
  const targetId = targetUser.id;

  // ================= !stats =================
  if (message.content.startsWith("!stats")) {
    try {
      const res = await fetchWithTimeout(`https://api.injuries.to/v1/public/user?userId=${targetId}`);
      const data = await res.json();
      if (!data.success || !data.Normal) return message.reply("❌ No stats found.");

      const normal = data.Normal;
      const profile = data.Profile || {};
      const userName = profile.userName || targetUser.username;

      const embedTop = new EmbedBuilder().setColor(0x000000).setImage(BANNER_TOP);
      const embed = new EmbedBuilder().setColor(0x000000).setTitle(`— <a:emoji_20:1464222092353605735> NORMAL STATS —`).setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setDescription(`**USER:** \`${userName}\`\n\n<a:heart:1463322847546966087> **TOTAL STATS**\n\`\`\`Hits:     ${formatNumber(normal.Totals?.Accounts)}\nVisits:   ${formatNumber(normal.Totals?.Visits)}\nClicks:   ${formatNumber(normal.Totals?.Clicks)}\`\`\`\n\n<a:corrupt_card:1463245786421661718> **BIGGEST HITS**\n\`\`\`Summary:  ${formatNumber(normal.Highest?.Summary)}\nRAP:      ${formatNumber(normal.Highest?.Rap)}\nRobux:    ${formatNumber(normal.Highest?.Balance)}\`\`\`\n\n<a:emoji_17:1463657710246691008> **TOTAL HIT STATS**\n\`\`\`Summary:  ${formatNumber(normal.Highest?.Summary)}\nRAP:      ${formatNumber(normal.Highest?.Rap)}\nRobux:    ${formatNumber(normal.Highest?.Balance)}\`\`\``)
        .setImage(getRandomPurge())
        .setFooter({ text: `𝔏𝔞𝔯𝔭 𝔢𝔪𝔭𝔦𝔯𝔢 • Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("View User").setStyle(ButtonStyle.Link).setURL(`https://discord.com/users/${targetId}`)
      );

      await message.channel.send({ embeds: [embedTop, embed], components: [buttons] });
    } catch (err) { console.error(err); message.reply("❌ API did not respond in time."); }
  }

  // ================= !daily =================
  if (message.content.startsWith("!daily")) {
    try {
      const res = await fetchWithTimeout(`https://api.injuries.to/v2/daily?userId=${targetId}`);
      const data = await res.json();
      if (!data.success) return message.reply("❌ No daily stats found.");

      const daily = data.Daily || data.Normal;
      const profile = data.Profile || {};
      const userName = profile.userName || targetUser.username;

      const embedTop = new EmbedBuilder().setColor(0x000000).setImage(BANNER_TOP);
      const embedDaily = new EmbedBuilder().setColor(0x000000).setTitle(`— <a:emoji_20:1464222092353605735> DAILY STATS —`).setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setDescription(`**USER:** \`${userName}\`\n\n<a:heart:1463322847546966087> **TOTAL DAILY STATS**\n\`\`\`Hits:     ${formatNumber(daily.Totals?.Accounts)}\nVisits:   ${formatNumber(daily.Totals?.Visits)}\nClicks:   ${formatNumber(daily.Totals?.Clicks)}\`\`\``)
        .setImage(getRandomPurge())
        .setFooter({ text: `𝔏𝔞𝔯𝔭 𝔢𝔪𝔭𝔦𝔯𝔢 • Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

      const buttonsDaily = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("View User").setStyle(ButtonStyle.Link).setURL(`https://discord.com/users/${targetId}`)
      );

      await message.channel.send({ embeds: [embedTop, embedDaily], components: [buttonsDaily] });
    } catch (err) { console.error(err); message.reply("❌ Daily API did not respond."); }
  }

  // ================= !purge manual =================
  if (message.content.startsWith("!purge") && message.author.id === OWNER_ID) {
   

    const fetched = await message.channel.messages.fetch({ limit: 100 }); 

    
    const deleted = await message.channel.bulkDelete(fetched, true);

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle("Successfully purged")
      .setDescription(`Deleted ${deleted.size} messages in #${message.channel.name}`)
      .setImage(getRandomPurge())
      .setFooter({ text: "𝔏𝔞𝔯𝔭 𝔢𝔪𝔭𝔦𝔯𝔢 • Automated Purge", iconURL: client.user.displayAvatarURL({ dynamic: true }) });

    await message.channel.send({ embeds: [embed] });
  }

  // ================= !fuck =================
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
// ================= !unhook =================
if (message.content.startsWith("!unhook")) {

    const embedTop = new EmbedBuilder()
        .setColor(0x000000)
        .setImage(getRandomUnhook());

    const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle("— <a:emoji_20:1464222092353605735> UNHOOK TUTORIAL —")
        .setDescription(
`If your beams do not say **"larp empire"**
then you might be losing your beams.
Watch the video below to be safe.`
        )
        .setFooter({
            text: ` Requested by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
        });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("unhook_video")
            .setLabel("Unhook")
            .setStyle(ButtonStyle.Secondary)
    );

    await message.channel.send({
        embeds: [embedTop, embed],
        components: [row]
    });
}
  // ================= !help =================
if (message.content.startsWith("!help")) {

    const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle("— <a:emoji_20:1464222092353605735> HELP MENU —")
        .setDescription(
` **Available Commands**

 **!stats [@user]**
Shows the stats of a registered user.

 **!daily [@user]**
Shows today's stats.

 **!fuck @user**
Displays a random GIF with the selected user.

 **!purge**
Deletes messages in the current channel.(owner only oneweeksober ofc)

 **!unhook**
Shows a tutorial explaining how to avoid getting hooked and keep your beams safe.`
        )
        .setImage(getRandomPurge())
        .setFooter({
            text: `𝔏𝔞𝔯𝔭 𝔢𝔪𝔭𝔦𝔯𝔢 • Requested by ${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
        });

    await message.channel.send({ embeds: [embed] });
}
  // ================= !create_ticket_panel =================
  if (message.content.startsWith("!create_ticket_panel") && message.author.id === OWNER_ID) {
    const panelEmbeds = [
      {
        "color": 0x000000,
        "image": { "url": "https://i.imgur.com/hw4rH89.jpeg" }
      },
      {
        "title": "— <a:emoji_20:1464222092353605735> 𝔏𝔞𝔯𝔭 𝔢𝔪𝔭𝔦𝔯𝔢  —",
        "description": "<a:emoji_17:1463657710246691008> ʜᴇʟʟᴏ!  ᴡᴇ ᴀʀᴇ ʜᴇʀᴇ ᴛᴏ ʜᴇʟᴘ ʏᴏᴜ.\n\n<a:emoji_18:1463658185901608991> ᴘʟᴇᴀsᴇ ᴄʜᴏᴏsᴇ ᴛʜᴇ ᴛʏᴘᴇ ᴏғ ʏᴏᴜʀ ɪssᴜᴇ ᴜsɪɴɢ ᴛʜᴇ ᴍᴇɴᴜ ʙᴇʟᴏᴡ.\n\n<a:corrupt_card:1463245786421661718> ᴏᴜʀ ᴛᴇᴀᴍ ᴡɪʟʟ ʀᴇsᴘᴏɴᴅ ᴀs sᴏᴏɴ ᴀs ᴘᴏssɪʙʟᴇ ᴡɪᴛʜ ᴀssɪsᴛᴀɴᴄᴇ.",
        "color": 0x000000,
        "image": { "url": "https://i.imgur.com/3i5dler.gif" }
      }
    ];

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
    const channelName = `${member.user.username}-${type}`.toLowerCase().replace(/ /g, "-");

    if (guild.channels.cache.find(c => c.name === channelName)) {
      return interaction.reply({ content: `You already have a ticket open: #${channelName}`, ephemeral: true });
    }

    const ticketChannel = await guild.channels.create({
      name: channelName,
      type: 0,
      permissionOverwrites: [
        { id: guild.id, deny: ['ViewChannel'] },
        ...SUPPORT_ROLES.map(r => ({ id: r, allow: ['ViewChannel', 'SendMessages'] })),
        { id: member.id, allow: ['ViewChannel', 'SendMessages'] }
      ]
    });

    await interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });

    const ticketEmbeds = [
      {
        "color": 0x000000,
        "image": { "url": "https://i.imgur.com/EeDXFxJ.jpeg" }
      },
      {
        "title": "— <a:emoji_20:1464222092353605735> ᴛɪᴄᴋᴇᴛ —",
        "description": "ᴡᴇʟʟᴄᴏᴍᴇ!\n\n<a:emoji_17:1463657710246691008> ᴘʟᴇᴀsᴇ ᴅᴇsᴄʀɪʙᴇ ʏᴏᴜʀ ɪssᴜᴇ ʜᴇʀᴇ.\n\n<a:emoji_18:1463658185901608991> ᴏᴜʀ sᴜᴘᴘᴏʀᴛ ᴛᴇᴀᴍ ᴡɪʟʟ ᴀssɪsᴛ ʏᴏᴜ ᴀs sᴏᴏɴ ᴀs ᴘᴏssɪʙʟᴇ.\n\n<a:emoji_19:1463658201525387297> ᴘʟᴇᴀsᴇ ᴄʜᴏᴏsᴇ ᴛʜᴇ ᴛʏᴘᴇ ᴏғ ʏᴏᴜʀ ɪssᴜᴇ ʜᴇʀᴇ."
      }
    ];

    const closeButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("close_ticket").setLabel("Close Ticket").setStyle(ButtonStyle.Secondary)
    );

    await ticketChannel.send({ embeds: ticketEmbeds.map(e => EmbedBuilder.from(e)), components: [closeButton] });
  }

  if (interaction.isButton() && interaction.customId === "unhook_video") {
    await interaction.reply({
        content: "**Video:**\nhttps://streamable.com/06tnbq"
    });
}
  if (interaction.isButton() && interaction.customId === "close_ticket") {
    await interaction.channel.delete().catch(() => null);
  }
});

// ================= AUTO-PURGE LA 30 MIN =================
setInterval(async () => {
  try {
    client.guilds.cache.forEach(async (guild) => {
      for (const channelId of ALLOWED_PURGE_CHANNELS) {
        const channel = guild.channels.cache.get(channelId);
        if (!channel || !channel.isTextBased()) continue;

        const fetched = await channel.messages.fetch({ limit: 50 }).catch(() => null);
        if (!fetched) continue;

        const deleted = await channel.bulkDelete(fetched, true).catch(() => null);
        if (deleted && deleted.size > 0) {
          console.log(`Auto-purge: Deleted ${deleted.size} messages in ${channel.name} (${guild.name})`);
        }
      }
    });
  } catch (err) {
    console.error("Error in auto-purge:", err);
  }
}, 30 * 60 * 1000);
