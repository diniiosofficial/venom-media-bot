const { Telegraf } = require("telegraf");

/* ======================================================
   VENOM MEDIA DISPATCHER — CAPTION + FORWARD + /SEND
   Author: VenomDevX
   Mode: Admin-only media & text broadcaster with smart captions
   ====================================================== */

// ----------------------- CONFIG ------------------------
const BOT_TOKEN = "8559377355:AAFyjhBcQPBfHvPp7iHvTpvAEbu2NJpq5rw";

// Your Telegram User ID (only you are allowed)
const ADMIN_ID = 5707956654;

// Target Channels
const TARGET_CHANNELS = [
  -1002762374328, // VENOM LOADER
  -1002683334976, // VENOM FEEDBACK
  -1003537781106, // VENOM FREE MODZ
  -1001858673142, // LEO&KNIGHT CHEAT
  -1003203628581  // 𝐕𝐄𝐍𝐎𝐌 𝐒𝐄𝐑𝐕𝐄𝐑™
];

// Base VENOM caption (HTML formatted)
const BASE_CAPTION =
  "<b>📥 Gᴀᴍᴇᴘʟᴀʏ Fᴇᴇᴅʙᴀᴄᴋ Rᴇᴛʀɪᴇᴠᴇᴅ</b>\n\n" +
  "<b>Sᴛᴀᴛᴜs :</b> Fᴜʟʟ Sᴀғᴇ 🟢\n" +
  "<b>Dᴍ Tᴏ Bᴜʏ :</b> T.me/VenomDevX 🐉";

// ----------------------- STATE -------------------------
let waitingBroadcastText = false;

// --------------------------------------------------------
// Escape HTML in user caption so it doesn't break <b> tags
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// --------------------------------------------------------
// ✅ UPDATED: Always show REAL NAME, never @username
function getForwardInfo(msg) {
  try {
    // ===== FORWARDED FROM USER =====
    if (msg.forward_from) {
      const u = msg.forward_from;

      const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
      if (name) {
        return `<b>Fʀᴏᴍ :</b> ${escapeHtml(name)}`;
      }
    }

    // ===== FORWARDED FROM CHANNEL / GROUP =====
    if (msg.forward_from_chat) {
      const ch = msg.forward_from_chat;

      if (ch.title) {
        return `<b>Fʀᴏᴍ :</b> ${escapeHtml(ch.title)}`;
      }
    }

    // ===== HIDDEN FORWARD =====
    if (msg.forward_sender_name) {
      return `<b>Fʀᴏᴍ :</b> ${escapeHtml(msg.forward_sender_name)}`;
    }
  } catch (e) {
    console.log("[WARN] getForwardInfo error:", e);
  }

  return "";
}

// --------------------------------------------------------
// Build final caption
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
      "<b>Access Level:</b> Administrator\n" +
      "<b>Mode:</b> Secure Upload & Channel Distribution\n\n" +
      "➤ Media without caption → Only VENOM caption\n" +
      "➤ Media with caption → Your caption + VENOM caption\n" +
      "➤ Forwarded media → Shows REAL NAME only\n" +
      "➤ /broadcast → One-time text broadcast\n\n" +
      "<b>Note:</b> Admin only",
    { parse_mode: "HTML" }
  );
});

// ----------------------- /broadcast --------------------
bot.command("broadcast", async (ctx) => {
  if (!ctx.from || ctx.from.id !== ADMIN_ID) return;

  waitingBroadcastText = true;
  await ctx.reply(
    "<b>📡 Bʀᴏᴀᴅᴄᴀsᴛ Mᴏᴅᴇ Aᴄᴛɪᴠᴇ</b>\n\n" +
      "Send the text to broadcast (1-time)",
    { parse_mode: "HTML" }
  );
});

// --------------------- MAIN HANDLER ---------------------
bot.on("message", async (ctx) => {
  const msg = ctx.message;

  if (TARGET_CHANNELS.includes(msg.chat.id)) return;
  if (!msg.from || msg.from.id !== ADMIN_ID) return;

  // ===== BROADCAST TEXT =====
  if (waitingBroadcastText && msg.text && !msg.text.startsWith("/")) {
    waitingBroadcastText = false;

    let ok = 0, fail = 0;
    for (const ch of TARGET_CHANNELS) {
      try {
        await ctx.telegram.sendMessage(ch, msg.text, { parse_mode: "HTML" });
        ok++;
      } catch {
        fail++;
      }
    }

    return ctx.reply(
      `<b>✅ Broadcast Done</b>\n\nSent: ${ok}\nFailed: ${fail}`,
      { parse_mode: "HTML" }
    );
  }

  if (msg.text && msg.text.startsWith("/")) return;

  // ===== MEDIA HANDLING =====
  const hasMedia =
    msg.photo || msg.video || msg.document || msg.animation ||
    msg.video_note || msg.voice || msg.audio;

  if (!hasMedia) return;

  const caption = buildFinalCaption(msg.caption || "", msg);

  let sent = 0, failed = 0;
  for (const ch of TARGET_CHANNELS) {
    try {
      await ctx.telegram.copyMessage(ch, msg.chat.id, msg.message_id, {
        caption,
        parse_mode: "HTML",
      });
      sent++;
    } catch {
      failed++;
    }
  }

  await ctx.reply(
    `<b>✅ Dispatch Complete</b>\n\nSent: ${sent}\nFailed: ${failed}`,
    { parse_mode: "HTML" }
  );
});

// -------------------- VERCEL HANDLER --------------------
module.exports = async (req, res) => {
  try {
    if (req.method === "POST") {
      await bot.handleUpdate(req.body);
      return res.status(200).json({ ok: true });
    }
    res.status(200).send("VENOM MEDIA DISPATCHER ACTIVE");
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Error");
  }
};
