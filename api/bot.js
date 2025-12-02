const { Telegraf } = require("telegraf");

/* ======================================================
   VENOM MEDIA DISPATCHER — CAPTION MERGE EDITION
   Author: VenomDevX
   Mode: Admin-only media broadcaster with smart captions
   ====================================================== */

// ----------------------- CONFIG ------------------------
const BOT_TOKEN = "8191544380:AAGKfuLV5DmzTS5ooPYC_u5RtD6SQFxm_9U";

// Your Telegram User ID (only you are allowed)
const ADMIN_ID = 5707956654;

// Target Channels
const TARGET_CHANNELS = [
  -1002762374328, // VENOM LOADER
  -1002683334976, // VENOM FEEDBACK
  -1002558925715  // VENOM FREE MODZ
];

// Base VENOM caption (HTML formatted)
const BASE_CAPTION =
  "<b>📥 Gᴀᴍᴇᴘʟᴀʏ Fᴇᴇᴅʙᴀᴄᴋ Rᴇᴛʀɪᴇᴠᴇᴅ</b>\n\n" +
  "<b>Sᴛᴀᴛᴜs :</b> Fᴜʟʟ Sᴀғᴇ 🟢\n" +
  "<b>Dᴍ Tᴏ Bᴜʏ :</b> T.me/VenomDevX 🐉";

// --------------------------------------------------------

// escape HTML in user caption so it doesn't break <b> tags, etc.
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Build final caption based on whether user sent caption or not
function buildFinalCaption(userCaption) {
  if (userCaption && userCaption.trim().length > 0) {
    const safeUserCaption = escapeHtml(userCaption.trim());
    return safeUserCaption + "\n\n" + BASE_CAPTION;
  } else {
    return BASE_CAPTION;
  }
}

const bot = new Telegraf(BOT_TOKEN);

// ----------------------- START CMD ----------------------
bot.start(async (ctx) => {
  await ctx.reply(
    "<b>🕷 VENOM MEDIA DISPATCHER — ONLINE</b>\n\n" +
      "Welcome to the automated media distribution system.\n\n" +
      "<b>Access Level:</b> Administrator\n" +
      "<b>Mode:</b> Secure Upload & Channel Distribution\n" +
      "<b>Function:</b> Auto-Publish Photos / Videos / Documents\n\n" +
      "➤ Sᴇɴᴅ ᴍᴇᴅɪᴀ ᴡɪᴛʜᴏᴜᴛ ᴄᴀᴘᴛɪᴏɴ → ᴏɴʟʏ Vᴇɴᴏᴍ ᴄᴀᴘᴛɪᴏɴ.\n" +
      "➤ Sᴇɴᴅ ᴍᴇᴅɪᴀ ᴡɪᴛʜ ᴄᴀᴘᴛɪᴏɴ → ʏᴏᴜʀ ᴄᴀᴘᴛɪᴏɴ + Vᴇɴᴏᴍ ᴄᴀᴘᴛɪᴏɴ.\n\n" +
      "<b>Note:</b> Only the bot admin can trigger distribution.",
    { parse_mode: "HTML" }
  );
});

// --------------------- MAIN HANDLER ---------------------
bot.on("message", async (ctx) => {
  const msg = ctx.message;

  // 1) Ignore anything that comes FROM the target channels (avoid loops)
  if (TARGET_CHANNELS.includes(msg.chat.id)) return;

  // 2) Only admin is allowed
  if (!msg.from || msg.from.id !== ADMIN_ID) {
    return; // silent ignore for others
  }

  // 3) Check for media
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

  // Grab the caption you sent (if any)
  const userCaption = msg.caption || "";
  const finalCaption = buildFinalCaption(userCaption);

  let successCount = 0;
  let failCount = 0;

  // 4) Dispatch to all channels using copyMessage (no "Forwarded from" tag)
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

  // 5) Send you a status message
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
      .send("VENOM MEDIA DISPATCHER ACTIVE (Caption Merge Mode)");
  } catch (err) {
    console.error("[ERROR] Internal Vercel Handler:", err);
    return res.status(500).send("Internal Error");
  }
};
