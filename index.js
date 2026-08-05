// ================= IMPORTURI =================
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelType, PermissionsBitField } = require("discord.js");
const fetch = require("node-fetch");
const express = require("express");

// ================= EXPRESS KEEP ALIVE (web service) =================
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is alive ✅"));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ================= DISCORD CLIENT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const OWNER_ID = "1389763251042258944";
const TICKET_CATEGORY = "1525971261807923321";
const WELCOME_CHANNEL_ID = "1525971261807923324";

const SUPPORT_ROLES = ["1525971260943892518", "1525971260943892517"];

// ================= PROTECTED !help MESSAGE =================
const PROTECTED_MESSAGE_ID = "1532445196774543441";

// ================= BANNERE =================
const BANNER_TOP = "https://i.imgur.com/hw4rH89.jpeg";
const BANNER_BOTTOM = "https://i.pinimg.com/originals/d8/53/9c/d8539cf70a1c62c7b6c55d11b14b6334.gif";
const STATS_GIF = "https://cdn.discordapp.com/attachments/1017600005764284497/1415662667720556587/Tumblr_l_76198603461233.gif?ex=6a6c8919&is=6a6b3799&hm=0439197b534cd600254f94be2b13b6e22219355f123f60d2ee50a7c988114642";
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

// ================= ANTI-RAID + OWNER BYPASS =================
const userMessageMap = new Map();

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const member = message.member;
  if (!member) return;
  const botAvatar = client.user.displayAvatarURL({ dynamic: true });

  // OWNER BYPASS
  if (message.author.id !== OWNER_ID) {
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
  }

  const targetUser = message.mentions.users.first() || message.author;
  const targetId = targetUser.id;

  // !stats
  if (message.content.startsWith("!stats")) {
    // Check if the target is the specific user ID
    if (targetId === "1464634211406188721") {
      // Hardcoded stats for this specific user
      const embedTop = new EmbedBuilder()
        .setColor(0x000000)
        .setImage(BANNER_TOP);

      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle(`— <a:emoji_31:1532377239071756378> NORMAL STATS —`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `**USER:** \`${targetUser.username}\`\n\n` +
          `<a:emoji_30:1532377209434542320>**TOTAL STATS**\n` +
          `\`\`\`Hits:     1,228\nVisits:   2,244\nClicks:   3,459\`\`\`\n\n` +
          `<a:emoji_33:1532377228237603057>**BIGGEST HITS**\n` +
          `\`\`\`Summary:  552.33k\nRAP:      112.76k\nRobux:    68.23k\`\`\`\n\n` +
          `<:emoji_18:1532377873430614268>**TOTAL HIT STATS**\n` +
          `\`\`\`Summary:  3.4m\nRAP:      522.6k\nRobux:    448.88k\`\`\``
        )
        .setImage(STATS_GIF);

      const embedBottom = new EmbedBuilder()
        .setColor(0x000000)
        .setImage(BANNER_BOTTOM)
        .setFooter({ text: `𝔏𝔞𝔯𝔭 𝔢𝔪𝔭𝔦𝔯𝔢 • Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

      await message.channel.send({
        embeds: [embedTop, embed, embedBottom],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("View User")
              .setStyle(ButtonStyle.Link)
              .setURL(`https://discord.com/users/${targetId}`)
          )
        ]
      });
      return; // Exit early since we've handled the hardcoded stats
    }

    // For all other users, fetch from API
    try {
      const res = await fetchWithTimeout(`https://api.injuries.to/v1/public/user?userId=${targetId}`);
      const data = await res.json();
      if (!data.success || !data.Normal) return message.reply("❌ No stats found.");

      const normal = data.Normal;
      const profile = data.Profile || {};
      const userName = profile.userName || targetUser.username;

      const totalHits = normal.TotalHits || normal.AllTime || normal.Totals || {};
      const totalSummary = totalHits.Summary || normal.Highest?.Summary || 0;
      const totalRap = totalHits.Rap || normal.Highest?.Rap || 0;
      const totalRobux = totalHits.Balance || normal.Highest?.Balance || 0;

      const embedTop = new EmbedBuilder()
        .setColor(0x000000)
        .setImage(BANNER_TOP);

      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle(`— <a:emoji_31:1532377239071756378> NORMAL STATS —`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `**USER:** \`${userName}\`\n\n` +
          `<a:emoji_30:1532377209434542320>**TOTAL STATS**\n` +
          `\`\`\`Hits:     ${formatNumber(normal.Totals?.Accounts)}\nVisits:   ${formatNumber(normal.Totals?.Visits)}\nClicks:   ${formatNumber(normal.Totals?.Clicks)}\`\`\`\n\n` +
          `<a:emoji_33:1532377228237603057>**BIGGEST HITS**\n` +
          `\`\`\`Summary:  ${formatNumber(normal.Highest?.Summary)}\nRAP:      ${formatNumber(normal.Highest?.Rap)}\nRobux:    ${formatNumber(normal.Highest?.Balance)}\`\`\`\n\n` +
          `<:emoji_18:1532377873430614268>**TOTAL HIT STATS**\n` +
          `\`\`\`Summary:  ${formatNumber(totalSummary)}\nRAP:      ${formatNumber(totalRap)}\nRobux:    ${formatNumber(totalRobux)}\`\`\``
        )
        .setImage(STATS_GIF);

      const embedBottom = new EmbedBuilder()
        .setColor(0x000000)
        .setImage(BANNER_BOTTOM)
        .setFooter({ text: `𝔏𝔞𝔯𝔭 𝔢𝔪𝔭𝔦𝔯𝔢 • Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });

      await message.channel.send({
        embeds: [embedTop, embed, embedBottom],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("View User")
              .setStyle(ButtonStyle.Link)
              .setURL(`https://discord.com/users/${targetId}`)
          )
        ]
      });
    } catch (err) { console.error(err); message.reply("❌ API timeout.").catch(() => null); }
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
      .setDescription(
        `**Available Commands:**\n\n` +
        `**!stats [@user]**\n` +
        `Provides the full stats of a user (hits, visits, clicks, biggest hits, RAP, Robux etc.)\n\n` +
        `**!fuck @user**\n` +
        `Sends a funny GIF message to the mentioned user.\n\n` +
        `**!purge**\n` +
        `(Owner only) Deletes the last 100 messages in the current channel.\n\n` +
        `**!unhook**\n` +
        `Shows the unhook tutorial for beams (if beams don't say "larp empire").\n\n` +
        `**!check**\n` +
        `Checks if the website is online/offline + browser compatibility (Chrome, Firefox, Opera etc.).\n\n` +
        `**!create_ticket_panel**\n` +
        `(Owner only) Creates the ticket selection panel.`
      )
      .setImage(getRandomPurge())
      .setFooter({ text: `Requested by ${message.author.username}` });
    await message.channel.send({ embeds: [embed] });
  }

  // !create_ticket_panel
  if (message.content.startsWith("!create_ticket_panel") && message.author.id === OWNER_ID) {
    const embedTop = new EmbedBuilder()
      .setColor(0x000000)
      .setImage(BANNER_TOP);

    const embedMain = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle(`—— <a:emoji_31:1532377239071756378>ꜱᴜᴘᴘᴏʀᴛ  ——`)
      .setDescription(`<a:emoji_30:1532377209434542320>ᴘʟᴇᴀꜱᴇ ᴄʜᴏᴏꜱᴇ ᴀ ʙᴜᴛᴛᴏɴ ʙᴇʟᴏᴡ ᴅᴇᴘᴇɴᴅɪɴɢ ᴏɴ ᴡʜᴀᴛ ᴛʏᴘᴇ ᴏꜰ ɪꜱꜱᴜᴇ ʏᴏᴜʀ ᴅᴇᴀʟɪɴɢ ᴡɪᴛʜ`)
      .setImage(STATS_GIF);

    const selectMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("Select Ticket Type")
        .addOptions([
          {
            label: "Links",
            value: "links",
            emoji: { id: "1532377883622899752", name: "emoji_18", animated: true }
          },
          {
            label: "Generator",
            value: "generator",
            emoji: { id: "1532377228237603057", name: "emoji_33", animated: true }
          },
          {
            label: "Others",
            value: "others",
            emoji: { id: "1532377209434542320", name: "emoji_30", animated: true }
          }
        ])
    );

    await message.channel.send({ embeds: [embedTop, embedMain], components: [selectMenu] });
  }

  // !check
  if (message.content.startsWith("!check")) {
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
            `<:chroma:1528429000710557866><:verified2:1528430350546501642>\n` +
            `<:firefx:1528425451943362670><:verified2:1528430350546501642>\n` +
            `<:operaa:1528425324704956608><:verified2:1528430350546501642>\n` +
            `<:operagxb:1528424369120870491><:verified2:1528430350546501642>\n` +
            `<:internetexp:1528425385291944117><:verified2:1528430350546501642>`
          )
          .setImage("https://media4.giphy.com/media/v1.Y2lkPTZjMDliOTUybWt1bzMwMno2bGZvbTF0YWM0bXdwbnpwd3g5cHpsYjE3enR5a3ZlMCZlcD12MV9naWZfX3NlYXJjaCZjdD1n/6ULDGyRw0uhECEhAaQ/200.gif")
          .setFooter({ text: `Requested by ${message.author.username}` });

        await checkingMsg.edit({ embeds: [onlineEmbed] });
      } else throw new Error("Not OK");
    } catch (err) {
      const offlineEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setAuthor({ name: "Website Status", iconURL: "https://cdn3.emoji.gg/emojis/9596-offline.gif" })
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

// ================= WELCOME SYSTEM (CLEANED) =================
client.on("guildMemberAdd", async (member) => {
  try {
    const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!welcomeChannel) return;

    // Normal message with single blue tag + text outside embeds
    const welcomeMain = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle(`<a:emoji_31:1532377239071756378> Welcome to larp empire!!`)
      .setDescription(
        `Read\n` +
        `<#1525971261807923322>\n\n` +
        `<#1532395654742278385>\n\n` +
        `Remember to verify!!\n` +
        `<#1525971261807923323>`
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setImage(STATS_GIF);

    const welcomeBottom = new EmbedBuilder()
      .setColor(0x000000)
      .setImage(BANNER_BOTTOM);

    await welcomeChannel.send({
      content: `<@${member.id}> has joined the server!`,
      embeds: [welcomeMain, welcomeBottom]
    });

    // DM (unchanged)
    const dmTop = new EmbedBuilder().setColor(0x000000).setImage(BANNER_TOP);
    const dmMain = new EmbedBuilder()
      .setColor(0x000000)
      .setDescription(
        `Hi! ${member.user.username}\n\n` +
        `If you come from another generator u might be dualhooked!\n\n` +
        `If your beams don’t say \`larp empire\`\n\n` +
        `Go to the channel cmds and use the \`!unhook\` command!!`
      )
      .setImage(STATS_GIF);
    const dmBottom = new EmbedBuilder().setColor(0x000000).setImage(BANNER_BOTTOM);

    await member.send({ embeds: [dmTop, dmMain, dmBottom] }).catch(() => null);
  } catch (err) {
    console.error("Welcome error:", err);
  }
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (interaction) => {
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {
    const type = interaction.values[0];
    const member = interaction.member;
    const guild = interaction.guild;
    const channelName = `${member.user.username}-${type}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    if (guild.channels.cache.find(c => c.name === channelName)) {
      return interaction.reply({ content: `You already have a ticket: #${channelName}`, ephemeral: true });
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

    await interaction.reply({ content: `Ticket created: ${ticketChannel}`, ephemeral: true });

    const ticketMain = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle(`— <a:emoji_31:1532377239071756378> TICKET CREATED —`)
      .setDescription(
        `**Welcome** <@${member.id}> !\n\n` +
        `Please describe what type of issue you have.\n` +
        `Staff will be with you shortly.`
      )
      .setImage(STATS_GIF);

    const ticketBottom = new EmbedBuilder()
      .setColor(0x000000)
      .setImage(BANNER_BOTTOM);

    const closeButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("Close Ticket")
        .setStyle(ButtonStyle.Secondary)
    );

    // Crează mențiunile pentru rolurile de support
    const supportMentions = SUPPORT_ROLES.map(roleId => `<@&${roleId}>`).join(' ');

    await ticketChannel.send({
      content: `${supportMentions} - New ticket created by <@${member.id}>!`,
      embeds: [ticketMain, ticketBottom],
      components: [closeButton]
    });
  }

  if (interaction.isButton() && interaction.customId === "unhook_video") {
    await interaction.reply({ content: "**Video:**\nhttps://streamable.com/qn3xwq" });
  }
  if (interaction.isButton() && interaction.customId === "close_ticket") {
    await interaction.channel.delete().catch(() => null);
  }
});

// ================= AUTO-PURGE =================
setInterval(async () => {
  try {
    for (const guild of client.guilds.cache.values()) {
      for (const channelId of ["1525971262285807761"]) {
        const channel = guild.channels.cache.get(channelId);
        if (channel?.isTextBased()) {
          const fetched = await channel.messages.fetch({ limit: 50 }).catch(() => null);
          if (fetched?.size) {
            const toDelete = fetched.filter(m => m.id !== PROTECTED_MESSAGE_ID);
            if (toDelete.size) await channel.bulkDelete(toDelete, true).catch(() => null);
          }
        }
      }
    }
  } catch (err) { console.error(err); }
}, 30 * 60 * 1000);

// LOGIN
client.login(TOKEN).then(() => console.log(`Logged in as ${client.user.tag}`));
