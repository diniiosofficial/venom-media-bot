const { Telegraf } = require("telegraf");

// ---------------- CONFIG ----------------
const BOT_TOKEN = "8191544380:AAGKfuLV5DmzTS5ooPYC_u5RtD6SQFxm_9U";

// YOUR TELEGRAM USER ID – ONLY YOU CAN SEND MEDIA
const ADMIN_ID = 5707956654;

// TARGET CHANNELS
const TARGET_CHANNELS = [
  -1002762374328, // 𝐕𝐄𝐍𝐎𝐌 𝐋𝐎𝐀𝐃𝐄𝐑 🐉
  -1002683334976, // 𝐕𝐄𝐍𝐎𝐌 𝐅𝐄𝐄𝐃𝐁𝐀𝐂𝐊 🐉
  -1002558925715  // 𝐕𝐄𝐍𝐎𝐌 𝐅𝐑𝐄𝐄 𝐌𝐎𝐃𝐙™ 🐉
];

// FIXED CAPTION
const FIXED_CAPTION = "GamePlay Feedback Fetched";

const bot = new Telegraf(BOT_TOKEN);

// ---------------- START ----------------
bot.start(async (ctx) => {
  await ctx.reply(
    "🕷 VENOM MEDIA BOT ONLINE\n\n" +
    "Only **bot admin** can upload media.\n" +
    "Send photo/video/document to push into channels. 🐉"
  );
});

// ---------------- MESSAGE HANDLER ----------------
bot.on("message", async (ctx) => {
  const msg = ctx.message;

  // Ignore messages already inside channels
  if (TARGET_CHANNELS.includes(msg.chat.id)) return;

  // ONLY ADMIN CAN SEND MEDIA
  if (msg.from.id !== ADMIN_ID) return;

  // Check for media
  const hasMedia =
    msg.photo ||
    msg.video ||
    msg.document ||
    msg.animation ||
    msg.video_note ||
    msg.voice ||
    msg.audio;

  if (!hasMedia) return;

  const fromChatId = msg.chat.id;
  const messageId = msg.message_id;

  // SEND TO ALL CHANNELS WITH CAPTION
  for (const ch of TARGET_CHANNELS) {
    try {
      await ctx.telegram.copyMessage(ch, fromChatId, messageId, {
        caption: FIXED_CAPTION,
        parse_mode: "HTML"
      });
    } catch (err) {
      console.error("Failed to send to", ch, err);
    }
  }
});

// ---------------- VERCEL HANDLER ----------------
module.exports = async (req, res) => {
  try {
    if (req.method === "POST") {
      await bot.handleUpdate(req.body);
      return res.status(200).json({ ok: true });
    }
    return res.status(200).send("VENOM MEDIA BOT is running.");
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).send("Error");
  }
};
