const { Telegraf } = require("telegraf");
const Jimp = require("jimp");

/* ======================================================
   VENOM MEDIA DISTRIBUTION BOT — WATERMARK EDITION
   Author: VenomDevX
   Feature: Auto watermark "VENOM SERVER" on images
   ====================================================== */

// ----------------------- CONFIG ------------------------
const BOT_TOKEN = "8191544380:AAGKfuLV5DmzTS5ooPYC_u5RtD6SQFxm_9U";

// Your Telegram User ID
const ADMIN_ID = 5707956654;

// Target Channels
const TARGET_CHANNELS = [
  -1002762374328, // VENOM LOADER
  -1002683334976, // VENOM FEEDBACK
  -1002558925715  // VENOM FREE MODZ
];

// Caption under every media
const CAPTION =
  `<b>📥 GamePlay Feedback Retrieved</b>\n\n` +
  `<b>Status:</b> Processed Successfully\n` +
  `<b>Engine:</b> VENOM Media Dispatcher 🐉`;

// Watermark text on images
const WATERMARK_TEXT = "VENOM SERVER";

// Pre-load font once (lazy init)
let loadedFont = null;
async function getFont() {
  if (!loadedFont) {
    loadedFont = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  }
  return loadedFont;
}

// ----------------- WATERMARK HELPER --------------------
async function addWatermarkToImageBuffer(buffer) {
  const image = await Jimp.read(buffer);
  const font = await getFont();

  const text = WATERMARK_TEXT;

  const textWidth = Jimp.measureText(font, text);
  const textHeight = Jimp.measureTextHeight(font, text, textWidth);

  const padding = 20;
  const rectWidth = textWidth + padding * 2;
  const rectHeight = textHeight + padding;

  const x = image.bitmap.width - rectWidth - 20;
  const y = image.bitmap.height - rectHeight - 20;

  // Semi-transparent black rectangle behind text
  const bg = new Jimp(rectWidth, rectHeight, 0x00000080); // 0xAARRGGBB (80 = opacity)
  image.composite(bg, x, y);

  // Print text over rectangle
  image.print(
    font,
    x + padding,
    y + (padding / 2),
    text
  );

  return image.getBufferAsync(Jimp.MIME_JPEG);
}

// ----------------------- BOT INIT ----------------------
const bot = new Telegraf(BOT_TOKEN);

// ----------------------- START CMD ----------------------
bot.start(async (ctx) => {
  await ctx.reply(
    `<b>🕷 VENOM MEDIA DISPATCHER — ONLINE</b>\n\n` +
    `Welcome to the automated media distribution system.\n\n` +
    `<b>Access Level:</b> Administrator\n` +
    `<b>Mode:</b> Secure Upload & Channel Distribution\n` +
    `<b>Function:</b> Auto-Publish Photos / Videos / Documents\n\n` +
    `Send your media now to dispatch it across all VENOM channels.\n` +
    `<b>Note:</b> Images will be watermarked with <code>${WATERMARK_TEXT}</code>.`,
    { parse_mode: "HTML" }
  );
});

// --------------------- MAIN HANDLER ---------------------
bot.on("message", async (ctx) => {
  const msg = ctx.message;

  // Ignore messages already in target channels
  if (TARGET_CHANNELS.includes(msg.chat.id)) return;

  // Only admin can use
  if (!msg.from || msg.from.id !== ADMIN_ID) return;

  const hasPhoto = !!msg.photo;
  const hasOtherMedia =
    msg.video ||
    msg.document ||
    msg.animation ||
    msg.video_note ||
    msg.voice ||
    msg.audio;

  // ========== CASE 1: PHOTO (watermark) ==========
  if (hasPhoto) {
    try {
      // get highest resolution photo (last in array)
      const photoSizes = msg.photo;
      const bestPhoto = photoSizes[photoSizes.length - 1];
      const fileId = bestPhoto.file_id;

      // Get file URL from Telegram
      const fileLink = await ctx.telegram.getFileLink(fileId);

      // Download image
      const resp = await fetch(fileLink.href);
      const arrayBuf = await resp.arrayBuffer();
      const imgBuffer = Buffer.from(arrayBuf);

      // Add watermark
      const watermarkedBuffer = await addWatermarkToImageBuffer(imgBuffer);

      // Send to all channels
      for (const channel of TARGET_CHANNELS) {
        try {
          await ctx.telegram.sendPhoto(channel, { source: watermarkedBuffer }, {
            caption: CAPTION,
            parse_mode: "HTML"
          });
          console.log(`[VENOM] Watermarked photo sent to channel: ${channel}`);
        } catch (err) {
          console.error(`[ERROR] Failed to send watermarked photo to ${channel}:`, err);
        }
      }
    } catch (e) {
      console.error("[ERROR] Processing photo:", e);
    }
    return;
  }

  // ========== CASE 2: OTHER MEDIA (no visual watermark) ==========
  if (hasOtherMedia) {
    const fromChat = msg.chat.id;
    const messageId = msg.message_id;

    for (const channel of TARGET_CHANNELS) {
      try {
        await ctx.telegram.copyMessage(channel, fromChat, messageId, {
          caption: CAPTION,
          parse_mode: "HTML"
        });
        console.log(`[VENOM] Media sent to channel: ${channel}`);
      } catch (err) {
        console.error(`[ERROR] Failed to dispatch media to ${channel}:`, err);
      }
    }
    return;
  }

  // Non-media messages: ignore
});

// -------------------- VERCEL HANDLER --------------------
module.exports = async (req, res) => {
  try {
    if (req.method === "POST") {
      await bot.handleUpdate(req.body);
      return res.status(200).json({ ok: true });
    }
    return res.status(200).send("VENOM MEDIA DISPATCHER ACTIVE (Watermark Enabled)");
  } catch (err) {
    console.error("[ERROR] Vercel Handler:", err);
    return res.status(500).send("Internal Error");
  }
};
