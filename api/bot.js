const { Telegraf } = require("telegraf");

/* ======================================================
   VENOM MEDIA DISPATCHER — CAPTION + FORWARD + /SEND
   Author: VenomDevX
   Mode: Admin-only media & text broadcaster with smart captions
   ====================================================== */

// ----------------------- CONFIG ------------------------
const BOT_TOKEN = "8208213604:AAGzmXe1k2Pl8N3GXCPGg5eK1UaHpJNg4-0";

// Your Telegram User ID (only you are allowed)
const ADMIN_ID = 5707956654;

// Target Channels
const TARGET_CHANNELS = [
  -1002762374328, // VENOM LOADER
  -1002683334976, // VENOM FEEDBACK
  -1002558925715, // VENOM FREE MODZ
  -1001858673142  // LEO&KNIGHT CHEAT
];

// Base VENOM caption (HTML formatted)
const BASE_CAPTION =
  "<b>📥 Gᴀᴍᴇᴘʟᴀʏ Fᴇᴇᴅʙᴀᴄᴋ Rᴇᴛʀɪᴇᴠᴇᴅ</b>\n\n" +
  "<b>Sᴛᴀᴛᴜs :</b> Fᴜʟʟ Sᴀғᴇ 🟢\n" +
  "<b>Dᴍ Tᴏ Bᴜʏ :</b> T.me/VenomDevX 🐉";

// ----------------------- STATE -------------------------
// After /send, next text from admin will be broadcast to all channels
let waitingBroadcastText = false;

// --------------------------------------------------------
// Escape HTML in user caption so it doesn't break <b> tags, etc.
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Get "from whom" info for forwarded messages
function getForwardInfo(msg) {
  try {
    if (msg.forward_from) {
      // Forwarded from a user
      const u = msg.forward_from;
      if (u.username) {
        return `<b>Fʀᴏᴍ :</b> @${escapeHtml(u.username)}`;
      }
      const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
      if (name) return `<b>Fʀᴏᴍ :</b> ${escapeHtml(name)}`;
    } else if (msg.forward_from_chat) {
      // Forwarded from a channel / group
      const ch = msg.forward_from_chat;
      if (ch.username) {
        return `<b>Fʀᴏᴍ :</b> @${escapeHtml(ch.username)}`;
      }
      if (ch.title) {
        return `<b>Fʀᴏᴍ :</b> ${escapeHtml(ch.title)}`;
      }
    } else if (msg.forward_sender_name) {
      // Hidden user name
      return `<b>Fʀᴏᴍ :</b> ${escapeHtml(msg.forward_sender_name)}`;
    }
  } catch (e) {
    console.log("[WARN] getForwardInfo error:", e);
  }
  return ""; // not forwarded / unknown
}

// Build final caption based on:
// - your caption (optional)
// - forward info (if forwarded)
// - base VENOM caption
function buildFinalCaption(userCaption, msg) {
  const parts = [];

  if (userCaption && userCaption.trim().length > 0) {
    parts.push(escapeHtml(userCaption.trim()));
  }

  const forwardInfo = getForwardInfo(msg);
  if (forwardInfo) {
    parts.push(forwardInfo);
  }

  parts.push(BASE_CAPTION);

  return parts.join("\n\n");
}

// -------------------- BOT INIT -------------------------
const bot = new Telegraf(BOT_TOKEN);

// ----------------------- /start ------------------------
bot.start(async (ctx) => {
  await ctx.reply(
    "<b>🕷 VENOM MEDIA DISPATCHER — ONLINE</b>\n\n" +
      "Welcome to the automated media & text distribution system.\n\n" +
      "<b>Access Level:</b> Administrator\n" +
      "<b>Mode:</b> Secure Upload & Channel Distribution\n" +
      "<b>Function:</b> Auto-Publish Photos / Videos / Documents\n\n" +
      "➤ Sᴇɴᴅ ᴍᴇᴅɪᴀ ᴡɪᴛʜᴏᴜᴛ ᴄᴀᴘᴛɪᴏɴ → ᴏɴʟʏ Vᴇɴᴏᴍ ᴄᴀᴘᴛɪᴏɴ.\n" +
      "➤ Sᴇɴᴅ ᴍᴇᴅɪᴀ ᴡɪᴛʜ ᴄᴀᴘᴛɪᴏɴ → ʏᴏᴜʀ ᴄᴀᴘᴛɪᴏɴ + Vᴇɴᴏᴍ ᴄᴀᴘᴛɪᴏɴ.\n" +
      "➤ Fᴏʀᴡᴀʀᴅᴇᴅ ᴍᴇᴅɪᴀ → ɪɴᴄʟᴜᴅᴇs <b>Fʀᴏᴍ :</b> sᴏᴜʀᴄᴇ.\n" +
      "➤ /broadcast → Nᴇxᴛ ᴛᴇxᴛ ʏᴏᴜ sᴇɴᴅ ᴡɪʟʟ ʙᴇ ʙʀᴏᴀᴅᴄᴀsᴛᴇᴅ ᴛᴏ ᴀʟʟ ᴄʜᴀɴɴᴇʟs (1-ᴛɪᴍᴇ).\n\n" +
      "<b>Note:</b> Only the bot admin can trigger distribution.",
    { parse_mode: "HTML" }
  );
});

// ----------------------- /send -------------------------
// After /send, next plain text (not starting with /) will go to all channels
bot.command("broadcast", async (ctx) => {
  if (!ctx.from || ctx.from.id !== ADMIN_ID) return;

  waitingBroadcastText = true;
  await ctx.reply(
    "<b>📡 Bʀᴏᴀᴅᴄᴀsᴛ Mᴏᴅᴇ Aᴄᴛɪᴠᴇ</b>\n\n" +
      "Sᴇɴᴅ ᴛʜᴇ ᴍᴇssᴀɢᴇ (ᴛᴇxᴛ) ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ sᴇɴᴅ ᴛᴏ ᴀʟʟ ᴄʜᴀɴɴᴇʟs.\n" +
      "➤ Bᴏᴛ ᴡɪʟʟ ᴀᴜᴛᴏ-ᴇxɪᴛ ᴀғᴛᴇʀ 1 ᴍᴇssᴀɢᴇ.",
    { parse_mode: "HTML" }
  );
});

// --------------------- MAIN HANDLER ---------------------
bot.on("message", async (ctx) => {
  const msg = ctx.message;

  // 0) Ignore anything that comes FROM the target channels (avoid loops)
  if (TARGET_CHANNELS.includes(msg.chat.id)) return;

  // 1) Only admin is allowed for everything
  if (!msg.from || msg.from.id !== ADMIN_ID) {
    return; // silent ignore for others
  }

  // ========== A) HANDLE /send BROADCAST TEXT MODE ==========
  if (waitingBroadcastText && msg.text && !msg.text.startsWith("/")) {
    const textToSend = msg.text;
    let success = 0;
    let failed = 0;

    for (const channel of TARGET_CHANNELS) {
      try {
        await ctx.telegram.sendMessage(channel, textToSend, {
          parse_mode: "HTML",
        });
        success++;
      } catch (err) {
        console.error(`[ERROR] Broadcast failed to ${channel}:`, err);
        failed++;
      }
    }

    // auto-exit broadcast mode after first message
    waitingBroadcastText = false;

    await ctx.reply(
      `<b>✅ Bʀᴏᴀᴅᴄᴀsᴛ Cᴏᴍᴘʟᴇᴛᴇ</b>\n\n` +
        `<b>Sᴇɴᴛ ᴛᴏ:</b> ${success} channel(s)\n` +
        `<b>Fᴀɪʟᴇᴅ:</b> ${failed} channel(s)\n\n` +
        `<b>Mᴏᴅᴇ:</b> 1-ᴛɪᴍᴇ /send ʙʀᴏᴀᴅᴄᴀsᴛ`,
      { parse_mode: "HTML" }
    );
    return;
  }

  // If waitingBroadcastText but got another command (like /start, /send), let command handlers handle it
  if (waitingBroadcastText && msg.text && msg.text.startsWith("/")) {
    return;
  }

  // If it's a pure command ( /start /send etc ) and not handled above, ignore here
  if (msg.text && msg.text.startsWith("/")) {
    return;
  }

  // ========== B) NORMAL MEDIA HANDLING (IMAGES / VIDEOS / ETC) ==========
  const hasMedia =
    msg.photo ||
    msg.video ||
    msg.document ||
    msg.animation ||
    msg.video_note ||
    msg.voice ||
    msg.audio;

  if (!hasMedia) {
    await ctx.reply(
      "⚠️ Nᴏ ᴍᴇᴅɪᴀ ᴅᴇᴛᴇᴄᴛᴇᴅ.\n" +
        "Pʟᴇᴀsᴇ sᴇɴᴅ ᴀ ᴘʜᴏᴛᴏ / ᴠɪᴅᴇᴏ / ᴅᴏᴄᴜᴍᴇɴᴛ ᴛᴏ ᴅɪsᴘᴀᴛᴄʜ.",
      { parse_mode: "HTML" }
    );
    return;
  }

  const fromChat = msg.chat.id;
  const messageId = msg.message_id;

  const userCaption = msg.caption || "";
  const finalCaption = buildFinalCaption(userCaption, msg);

  let successCount = 0;
  let failCount = 0;

  // Dispatch to all channels using copyMessage (no "Forwarded from" tag)
  for (const channel of TARGET_CHANNELS) {
    try {
      const sentMessage = await ctx.telegram.copyMessage(
        channel,
        fromChat,
        messageId,
        {
          caption: finalCaption,
          parse_mode: "HTML",
        }
      );

      console.log(
        `[VENOM] Media sent to channel: ${channel} (msg_id: ${
          sentMessage?.message_id
        })`
      );
      successCount++;
    } catch (err) {
      console.error(`[ERROR] Failed to dispatch to ${channel}:`, err);
      failCount++;
    }
  }

  // Status message back to you
  let statusText =
    `<b>✅ Dɪsᴘᴀᴛᴄʜ Cᴏᴍᴘʟᴇᴛᴇ</b>\n\n` +
    `<b>Sᴇɴᴛ ᴛᴏ:</b> ${successCount} channel(s)\n` +
    `<b>Fᴀɪʟᴇᴅ:</b> ${failCount} channel(s)\n\n` +
    `<b>Eɴɢɪɴᴇ:</b> VENOM SERVER 🐉`;

  await ctx.reply(statusText, { parse_mode: "HTML" });
});

// -------------------- VERCEL HANDLER --------------------
module.exports = async (req, res) => {
  try {
    if (req.method === "POST") {
      await bot.handleUpdate(req.body);
      return res.status(200).json({ ok: true });
    }
    return res
      .status(200)
      .send("VENOM MEDIA DISPATCHER ACTIVE (Forward + /send Mode)");
  } catch (err) {
    console.error("[ERROR] Internal Vercel Handler:", err);
    return res.status(500).send("Internal Error");
  }
};



