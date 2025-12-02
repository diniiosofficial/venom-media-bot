const { Telegraf } = require("telegraf");

/* ======================================================
   VENOM MEDIA DISPATCHER — STABLE EDITION
   Author: VenomDevX
   Mode: Admin-only media broadcaster with caption watermark
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

// Caption watermark (shown in channel under every media)
const CAPTION =
  "<b>📥 Gameplay Feedback Retrieved</b>\n\n" +
  "<b>Status:</b> FULL SAFE\n" +
  "<b>Owner:</b> T.me/VenomDevX 🐉";

// --------------------------------------------------------

const bot = new Telegraf(BOT_TOKEN);

// ----------------------- START CMD ----------------------
bot.start(async (ctx) => {
  await ctx.reply(
    "<b>🕷 VENOM MEDIA DISPATCHER — ONLINE</b>\n\n" +
    "Welcome to the automated media distribution system.\n\n" +
    "<b>Access Level:</b> Administrator\n" +
    "<b>Mode:</b> Secure Upload & Channel Distribution\n" +
    "<b>Function:</b> Auto-Publish Photos / Videos / Documents\n\n" +
    "Send your media now to dispatch it across all VENOM channels.\n" +
    "<b>Note:</b> Only the bot admin can trigger distribution.",
    { parse_mode: "HTML" }
  );
});

// --------------------- MAIN HANDLER ---------------------
bot.on("message", async (ctx) => {
  const msg = ctx.message;

  // 1) Ignore anything that comes FROM the channels (avoid loops)
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
    // Optional: tell you if you send text only
    await ctx.reply("⚠️ No media detected. Please send a photo / video / document to dispatch.");
    return;
  }

  const fromChat = msg.chat.id;
  const messageId = msg.message_id;

  let successCount = 0;
  let failCount = 0;

  // 4) Dispatch to all channels using copyMessage (no forward tag)
  for (const channel of TARGET_CHANNELS) {
    try {
      await ctx.telegram.copyMessage(channel, fromChat, messageId, {
        caption: CAPTION,
        parse_mode: "HTML"
      });
      console.log(`[VENOM] Media sent to channel: ${channel}`);
      successCount++;
    } catch (err) {
      console.error(`[ERROR] Failed to dispatch to ${channel}:`, err);
      failCount++;
    }
  }

  // 5) Send you a status message
  let statusText =
    `<b>✅ Dispatch Complete</b>\n\n` +
    `<b>Sent to:</b> ${successCount} channel(s)\n` +
    `<b>Failed:</b> ${failCount} channel(s)\n\n` +
    `<b>Engine:</b> VENOM SERVER 🐉`;

  await ctx.reply(statusText, { parse_mode: "HTML" });
});

// -------------------- VERCEL HANDLER --------------------
module.exports = async (req, res) => {
  try {
    if (req.method === "POST") {
      await bot.handleUpdate(req.body);
      return res.status(200).json({ ok: true });
    }
    return res.status(200).send("VENOM MEDIA DISPATCHER ACTIVE (Stable Mode)");
  } catch (err) {
    console.error("[ERROR] Vercel Handler:", err);
    return res.status(500).send("Internal Error");
  }
};
