const { Telegraf, Markup } = require("telegraf");

/* ======================================================
   VENOM SUPPORT + MEDIA DISPATCHER (MERGED)
   - UPI Payment + Invoices + Reminders
   - DM Support + Forward + /reply
   - Channel Broadcaster + /broadcast + Smart Captions
   - /stats + /ban
   Author: VenomDevX
   ====================================================== */

// ================= CONFIG =================

// Bot token (ONE bot)
const BOT_TOKEN = "8589971782:AAGRdB4BwiWpAb9UYLpitJn9NAGhtVAWlTM";

// Owner details
const ADMIN_ID = 5707956654;
const OWNER_USERNAME = "@VenomDevX";

// UPI payment details
const UPI_ID = "karthikdinesh059@okaxis";
const UPI_NAME = "Dinesh Karthik (DK)";
const UPI_CURRENCY = "INR";

// Target Channels for media dispatcher
const TARGET_CHANNELS = [
  -1002762374328, // VENOM LOADER
  -1002683334976, // VENOM FEEDBACK
  -1002558925715  // VENOM FREE MODZ
];

// Base VENOM caption (HTML formatted) for dispatcher
const BASE_CAPTION =
  "<b>📥 Gᴀᴍᴇᴘʟᴀʏ Fᴇᴇᴅʙᴀᴄᴋ Rᴇᴛʀɪᴇᴠᴇᴅ</b>\n\n" +
  "<b>Sᴛᴀᴛᴜs :</b> Fᴜʟʟ Sᴀғᴇ 🟢\n" +
  "<b>Dᴍ Tᴏ Bᴜʏ :</b> T.me/VenomDevX 🐉";

// ----------------------- STATE -------------------------

// For /broadcast text mode
let waitingBroadcastText = false;

// For auto-greeting in support
const greetedUsers = new Set();

// For invoice + reminder: userId -> { plan, invoiceId, createdAt, reminderTimeoutId }
const pendingPlans = {};

// Soft bans
const bannedUsers = new Set();

// Stats
const totalUsers = new Set();       // unique users who contacted bot
let totalMessages = 0;              // forwarded messages from users
let totalDispatches = 0;            // media/broadcast dispatches to channels
const planClicks = { normal: 0, admin: 0 }; // number of normal/admin plan selections

// ----------------- HELPER: HTML ESCAPE -----------------

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Get "from whom" info for forwarded messages (dispatcher)
function getForwardInfo(msg) {
  try {
    if (msg.forward_from) {
      const u = msg.forward_from;
      if (u.username) {
        return `<b>Fʀᴏᴍ :</b> @${escapeHtml(u.username)}`;
      }
      const name = [u.first_name, u.last_name].filter(Boolean).join(" ");
      if (name) return `<b>Fʀᴏᴍ :</b> ${escapeHtml(name)}`;
    } else if (msg.forward_from_chat) {
      const ch = msg.forward_from_chat;
      if (ch.username) {
        return `<b>Fʀᴏᴍ :</b> @${escapeHtml(ch.username)}`;
      }
      if (ch.title) {
        return `<b>Fʀᴏᴍ :</b> ${escapeHtml(ch.title)}`;
      }
    } else if (msg.forward_sender_name) {
      return `<b>Fʀᴏᴍ :</b> ${escapeHtml(msg.forward_sender_name)}`;
    }
  } catch (e) {
    console.log("[WARN] getForwardInfo error:", e);
  }
  return "";
}

// Build final caption for dispatcher media
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

// ================= PRICING TEXT =================

const NORMAL_PRICE_TEXT = `🔥 Vᴇɴᴏᴍ Nᴏʀᴍᴀʟ Sᴇʀᴠᴇʀ 🔥

‼️ Uɴᴅᴇᴛᴇᴄᴛᴇᴅ | Bᴀɴ Sᴀғᴇ
‼️ Sᴍᴏᴏᴛʜ + Sᴛᴀʙʟᴇ Pᴇʀғᴏʀᴍᴀɴᴄᴇ
‼️ Nᴏ Kɪʟʟ Lɪᴍɪᴛ — Cʟᴇᴀʀ Tʜᴇ Lᴏʙʙʏ
‼️ Nᴏ Rᴇsᴛᴀʀᴛ | Nᴏ Cʀᴀsʜ | Nᴏ Fʟᴀɢ

⚡️ Hᴀʀᴅ Aɪᴍʙᴏᴛ | Eꜱᴘ | Fᴜʟʟ Sᴀғᴇ
⚡️ Fᴜʟʟ Oᴘᴛɪᴍɪᴢᴇᴅ ғᴏʀ Bɢᴍɪ x𝟼𝟺 

💎 Pʀɪᴄɪɴɢ :

💥 6 Hᴏᴜʀ – ₹50/-
💥 1 Dᴀʏ – ₹100/-
💥 3 Dᴀʏ – ₹250/-
💥 7 Dᴀʏ – ₹400/-
💥 1 Month - ₹800/-
💥 Full Season - ₹1200/-

Dᴍ Tᴏ Bᴜʏ : ${OWNER_USERNAME}`;

const ADMIN_PRICE_TEXT = `🔥 Vᴇɴᴏᴍ Aᴅᴍɪɴ Sᴇʀᴠᴇʀ 🔥 

‼️ Uɴᴅᴇᴛᴇᴄᴛᴇᴅ | Bᴀɴ Sᴀғᴇ
‼️ Sᴍᴏᴏᴛʜ + Sᴛᴀʙʟᴇ Pᴇʀғᴏʀᴍᴀɴᴄᴇ
‼️ Nᴏ Kɪʟʟ Lɪᴍɪᴛ — Cʟᴇᴀʀ Tʜᴇ Lᴏʙʙʏ
‼️ Nᴏ Rᴇsᴛᴀʀᴛ | Nᴏ Cʀᴀsʜ | Nᴏ Fʟᴀɢ

⚡️ Bʀᴜᴛᴀʟ Bᴛ | Aɪᴍʙᴏᴛ | Eꜱᴘ | Fᴜʟʟ Sᴀғᴇ 
⚡️ Fᴜʟʟ Oᴘᴛɪᴍɪᴢᴇᴅ ғᴏʀ Bɢᴍɪ x𝟼𝟺 

💎 Pʀɪᴄɪɴɢ :

💥 1 Dᴀʏ – ₹150/- 
💥 3 Dᴀʏ – ₹300/- 
💥 7 Dᴀʏ – ₹600/-

Dᴍ Tᴏ Bᴜʏ : ${OWNER_USERNAME}`;

// ================= PLAN LIST =================

const NORMAL_PLANS = [
  { key: "normal_6h", label: "6 Hᴏᴜʀ – ₹50/-", amount: 50,  title: "VENOM Normal Server — 6 Hours" },
  { key: "normal_1d", label: "1 Dᴀʏ – ₹100/-", amount: 100, title: "VENOM Normal Server — 1 Day" },
  { key: "normal_3d", label: "3 Dᴀʏ – ₹250/-", amount: 250, title: "VENOM Normal Server — 3 Days" },
  { key: "normal_7d", label: "7 Dᴀʏ – ₹400/-", amount: 400, title: "VENOM Normal Server — 7 Days" },
  { key: "normal_1m", label: "1 Month - ₹800/-", amount: 800, title: "VENOM Normal Server — 1 Month" },
  { key: "normal_season", label: "Full Season - ₹1200/-", amount: 1200, title: "VENOM Normal Server — Full Season" },
];

const ADMIN_PLANS = [
  { key: "admin_1d", label: "1 Dᴀʏ – ₹150/-", amount: 150, title: "VENOM Admin Server — 1 Day" },
  { key: "admin_3d", label: "3 Dᴀʏ – ₹300/-", amount: 300, title: "VENOM Admin Server — 3 Days" },
  { key: "admin_7d", label: "7 Dᴀʏ – ₹600/-", amount: 600, title: "VENOM Admin Server — 7 Days" },
];

function findPlan(k) {
  return NORMAL_PLANS.concat(ADMIN_PLANS).find(p => p.key === k);
}

// =============== Dynamic UPI QR Generator ===============

async function sendPaymentQR(ctx, plan, invoiceId) {
  const upiUrl =
    `upi://pay?pa=${encodeURIComponent(UPI_ID)}` +
    `&pn=${encodeURIComponent(UPI_NAME)}` +
    `&am=${encodeURIComponent(plan.amount)}` +
    `&cu=${encodeURIComponent(UPI_CURRENCY)}` +
    `&tn=${encodeURIComponent(plan.title)}`;

  const qrApi =
    `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(upiUrl)}`;

  const caption =
    `🧾 <b>Invoice ID:</b> <code>${invoiceId}</code>\n` +
    `📦 <b>Plan:</b> ${plan.title}\n` +
    `💸 <b>Amount:</b> ₹${plan.amount}\n\n` +
    `1️⃣ Scan this QR and pay.\n` +
    `2️⃣ After payment, send your screenshot here.\n\n` +
    `🔗 <b>Backup UPI:</b>\n<code>${upiUrl}</code>\n\n` +
    `Your screenshot will be forwarded to ${OWNER_USERNAME} for verification.`;

  await ctx.replyWithPhoto({ url: qrApi }, { caption, parse_mode: "HTML" });
}

// ================= /start & /help =================

bot.start(async (ctx) => {
  if (ctx.chat.type !== "private") return;

  if (ctx.from && ctx.from.id === ADMIN_ID) {
    // Admin view
    await ctx.reply(
      "<b>🕷 VENOM SUPPORT + MEDIA DISPATCHER — ONLINE</b>\n\n" +
      "<b>Mode 1 — Support & Payment</b>\n" +
      "• Users DM this bot → messages forwarded to you.\n" +
      "• /price → UPI QR + plans + invoices.\n" +
      "• /help → user instructions.\n" +
      "• /reply & /ban & /stats.\n\n" +
      "<b>Mode 2 — Media Dispatcher</b>\n" +
      "• Send/forward media → it posts to all target channels with VENOM caption.\n" +
      "• /broadcast → next text you send is broadcast to all channels.\n\n" +
      "<b>Owner:</b> " + OWNER_USERNAME,
      { parse_mode: "HTML" }
    );
  } else {
    // Normal user
    await ctx.reply(
      "⚡️ VENOM SUPPORT BOT ⚡️\n\n" +
      "Send any message here to contact the owner.\n" +
      "Your message will be delivered instantly.\n\n" +
      "Use /help to see how to buy.",
      { parse_mode: "HTML" }
    );
  }
});

bot.command("help", async (ctx) => {
  if (ctx.chat.type === "private") {
    await ctx.reply(
`📜 VENOM SUPPORT HELP

🛒 <b>How to Buy:</b>
1️⃣ Use /price and choose:
   • NORMAL SERVER
   • ADMIN SERVER
2️⃣ Select your plan (6H / 1D / 3D / 7D / 1M / Season).
3️⃣ Bot will show a UPI QR with exact amount.
4️⃣ Scan & pay using any UPI app.
5️⃣ Send payment screenshot here in chat.

💬 <b>Support & Doubts:</b>
• Just type your message here.
• All messages are forwarded to ${OWNER_USERNAME}.
• You will get reply directly here.

⚠️ <b>Note:</b>
• Don’t spam.
• Don’t call / random voice spam.
• Serious buyers only.`,
      { parse_mode: "HTML" }
    );
  } else {
    await ctx.reply("Use this command in private chat with me for full help 😊");
  }
});

// /qr — dynamic base UPI QR (no specific amount)
bot.command("qr", async (ctx) => {
  try {
    const upiUrl =
      `upi://pay?pa=${encodeURIComponent(UPI_ID)}` +
      `&pn=${encodeURIComponent(UPI_NAME)}` +
      `&cu=${encodeURIComponent(UPI_CURRENCY)}`;

    const qrApi =
      `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(upiUrl)}`;

    await ctx.replyWithPhoto({ url: qrApi }, {
      caption: "🔗 Scan this QR to pay or connect.\n" +
               `<code>${upiUrl}</code>`,
      parse_mode: "HTML",
    });
  } catch (err) {
    console.error("Error in /qr:", err);
    await ctx.reply("⚠️ Something went wrong while generating QR. Please contact " + OWNER_USERNAME);
  }
});

// /price — choose server
bot.command("price", async (ctx) => {
  try {
    if (ctx.chat.type === "private") {
      await ctx.reply(
        "💰 Choose Server Type:",
        Markup.inlineKeyboard([
          [Markup.button.callback("🔥 NORMAL SERVER", "pvt_normal")],
          [Markup.button.callback("👑 ADMIN SERVER", "pvt_admin")],
        ])
      );
    } else {
      await ctx.reply(
        "💰 Choose Server Type:",
        Markup.inlineKeyboard([
          [Markup.button.callback("🔥 NORMAL SERVER", "grp_normal")],
          [Markup.button.callback("👑 ADMIN SERVER", "grp_admin")],
        ])
      );
    }
  } catch (err) {
    console.error("Error in /price:", err);
    await ctx.reply("⚠️ Something went wrong. Try again or contact " + OWNER_USERNAME);
  }
});

// /broadcast — admin text broadcast to channels
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

// /ban <user_id> — soft-ban
bot.command("ban", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const args = ctx.message.text.split(" ").slice(1);
  const userId = args[0];

  if (!userId) {
    return ctx.reply("Usage: /ban <user_id>");
  }

  bannedUsers.add(String(userId));
  await ctx.reply(`🚫 User <code>${userId}</code> has been soft-banned.`, { parse_mode: "HTML" });
});

// /stats — show runtime stats
bot.command("stats", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  const pendingCount = Object.keys(pendingPlans).length;

  await ctx.reply(
    `📊 <b>VENOM BOT STATS</b>\n\n` +
    `👤 Unique Users Contacted: ${totalUsers.size}\n` +
    `💬 Messages Forwarded: ${totalMessages}\n` +
    `📦 Pending Invoices: ${pendingCount}\n` +
    `🔥 Plan Clicks:\n` +
    `   • Normal: ${planClicks.normal}\n` +
    `   • Admin: ${planClicks.admin}\n` +
    `📡 Media Dispatches: ${totalDispatches}\n` +
    `🚫 Banned Users: ${bannedUsers.size}\n\n` +
    `🛠 Engine: VENOM SERVER`,
    { parse_mode: "HTML" }
  );
});

// ========== CALLBACK HANDLER (plans, invoices, reminder) ==========

bot.on("callback_query", async (ctx) => {
  try {
    const d = ctx.callbackQuery.data;

    if (d === "grp_normal") return ctx.reply(NORMAL_PRICE_TEXT);
    if (d === "grp_admin")  return ctx.reply(ADMIN_PRICE_TEXT);

    if (d === "pvt_normal") {
      const rows = NORMAL_PLANS.map(p => [Markup.button.callback(p.label, "pay_" + p.key)]);
      return ctx.reply("🔥 Normal Server — Select Plan:", Markup.inlineKeyboard(rows));
    }

    if (d === "pvt_admin") {
      const rows = ADMIN_PLANS.map(p => [Markup.button.callback(p.label, "pay_" + p.key)]);
      return ctx.reply("👑 Admin Server — Select Plan:", Markup.inlineKeyboard(rows));
    }

    if (d.startsWith("pay_")) {
      const key = d.replace("pay_", "");
      const plan = findPlan(key);
      if (!plan) {
        await ctx.answerCbQuery("Invalid plan");
        return;
      }

      // Count plan click stats
      if (NORMAL_PLANS.some(p => p.key === plan.key)) {
        planClicks.normal++;
      } else if (ADMIN_PLANS.some(p => p.key === plan.key)) {
        planClicks.admin++;
      }

      await ctx.answerCbQuery("Generating Invoice & QR...");

      const userId = ctx.from.id;
      const chatId = ctx.chat.id;
      const invoiceId = `VENOM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Clear previous reminder (if any)
      if (pendingPlans[userId]?.reminderTimeoutId) {
        clearTimeout(pendingPlans[userId].reminderTimeoutId);
      }

      // Send invoice message
      await ctx.reply(
        `🧾 <b>Invoice Generated</b>\n\n` +
        `📄 <b>Invoice ID:</b> <code>${invoiceId}</code>\n` +
        `📦 <b>Plan:</b> ${plan.title}\n` +
        `💸 <b>Amount:</b> ₹${plan.amount}\n` +
        `📌 <b>Status:</b> Pending Payment\n\n` +
        `Proceed to pay using the QR below, then send your payment screenshot here.`,
        { parse_mode: "HTML" }
      );

      const reminderTimeoutId = setTimeout(async () => {
        try {
          await bot.telegram.sendMessage(
            chatId,
            `⏰ Reminder for Invoice <code>${invoiceId}</code>\n` +
            `You selected <b>${plan.title}</b> (₹${plan.amount}) but payment screenshot is not received yet.\n\n` +
            `If you still want to buy, complete the UPI payment and send your screenshot here.`,
            { parse_mode: "HTML" }
          );
        } catch (e) {
          console.error("Error sending reminder:", e);
        }
      }, 5 * 60 * 1000); // 5 minutes

      pendingPlans[userId] = {
        plan,
        invoiceId,
        createdAt: Date.now(),
        reminderTimeoutId,
      };

      await sendPaymentQR(ctx, plan, invoiceId);
      return;
    }

    await ctx.answerCbQuery("Unknown option");
  } catch (err) {
    console.error("Error in callback_query:", err);
    try {
      await ctx.reply("⚠️ Something went wrong while processing your selection. Please try again or contact " + OWNER_USERNAME);
    } catch (_) {}
  }
});

// ========== MAIN MESSAGE HANDLER (support + dispatcher merged) ==========

bot.on("message", async (ctx) => {
  try {
    const msg = ctx.message;
    const chat = ctx.chat;
    const from = ctx.from;

    if (!msg || !chat || !from) return;

    // Ignore messages originating from target channels (avoid loops)
    if (TARGET_CHANNELS.includes(chat.id)) return;

    // ========== ADMIN FLOW (MEDIA DISPATCHER + /broadcast text) ==========
    if (from.id === ADMIN_ID) {
      // Broadcast mode: next text -> all channels
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

        waitingBroadcastText = false;
        totalDispatches++; // count one broadcast operation

        await ctx.reply(
          `<b>✅ Bʀᴏᴀᴅᴄᴀsᴛ Cᴏᴍᴘʟᴇᴛᴇ</b>\n\n` +
          `<b>Sᴇɴᴛ ᴛᴏ:</b> ${success} channel(s)\n` +
          `<b>Fᴀɪʟᴇᴅ:</b> ${failed} channel(s)\n\n` +
          `<b>Mᴏᴅᴇ:</b> 1-ᴛɪᴍᴇ /broadcast`,
          { parse_mode: "HTML" }
        );
        return;
      }

      // If in broadcast mode but got a command, let command handler handle it
      if (waitingBroadcastText && msg.text && msg.text.startsWith("/")) {
        return;
      }

      // Media dispatcher for admin (any chat except target channels)
      const hasMedia =
        msg.photo ||
        msg.video ||
        msg.document ||
        msg.animation ||
        msg.video_note ||
        msg.voice ||
        msg.audio;

      // Ignore pure commands here
      if (msg.text && msg.text.startsWith("/")) {
        return;
      }

      if (!hasMedia) {
        await ctx.reply(
          "⚠️ Nᴏ ᴍᴇᴅɪᴀ ᴅᴇᴛᴇᴄᴛᴇᴅ.\n" +
          "Sᴇɴᴅ ᴀ ᴘʜᴏᴛᴏ / ᴠɪᴅᴇᴏ / ᴅᴏᴄᴜᴍᴇɴᴛ ᴛᴏ ᴅɪsᴘᴀᴛᴄʜ,\n" +
          "ᴏʀ ᴜsᴇ /broadcast ᴛᴏ ʙʀᴏᴀᴅᴄᴀsᴛ ᴛᴇxᴛ.",
          { parse_mode: "HTML" }
        );
        return;
      }

      const fromChat = chat.id;
      const messageId = msg.message_id;
      const userCaption = msg.caption || "";
      const finalCaption = buildFinalCaption(userCaption, msg);

      let successCount = 0;
      let failCount = 0;

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

      totalDispatches++; // count this dispatch operation

      await ctx.reply(
        `<b>✅ Dɪsᴘᴀᴛᴄʜ Cᴏᴍᴘʟᴇᴛᴇ</b>\n\n` +
        `<b>Sᴇɴᴛ ᴛᴏ:</b> ${successCount} channel(s)\n` +
        `<b>Fᴀɪʟᴇᴅ:</b> ${failCount} channel(s)\n\n` +
        `<b>Eɴɢɪɴᴇ:</b> VENOM SERVER 🐉`,
        { parse_mode: "HTML" }
      );
      return;
    }

    // ========== NON-ADMIN FLOW ==========

    // Groups/channels non-admin: only commands handled separately
    if (chat.type !== "private") {
      return;
    }

    // Banned users: block forwarding/support
    if (bannedUsers.has(String(from.id))) {
      await ctx.reply("⚠️ You are restricted from contacting this support.");
      return;
    }

    // Ignore commands here; they are handled above
    if (msg.text && msg.text.startsWith("/")) return;

    const userId = from.id;

    // Stats: track unique users & messages
    totalUsers.add(userId);
    totalMessages++;

    // Auto greeting (first DM)
    if (!greetedUsers.has(userId)) {
      greetedUsers.add(userId);
      await ctx.reply(
        "👋 Welcome to VENOM SUPPORT BOT.\n\n" +
        "Use /price to see plans or /help to know how to buy.\n" +
        "You can also directly send your doubts here.",
        { parse_mode: "HTML" }
      );
    }

    // Build info for owner
    let info =
      `📩 <b>New Message</b>\n\n` +
      `👤 <b>${from.first_name || "User"}</b>\n` +
      (from.username ? `🔗 @${from.username}\n` : "") +
      `🆔 <code>${from.id}</code>\n`;

    // If user had pending invoice/plan, attach & clear reminder
    if (pendingPlans[userId]) {
      const { plan, invoiceId, reminderTimeoutId } = pendingPlans[userId];
      if (reminderTimeoutId) clearTimeout(reminderTimeoutId);
      delete pendingPlans[userId];

      info +=
        `\n🧾 <b>Invoice:</b> <code>${invoiceId}</code>\n` +
        `📦 <b>Plan:</b> ${plan.title} (₹${plan.amount})\n` +
        `📌 <b>Status:</b> Payment Screenshot / Message Received\n`;
    }

    info += `\n`;

    const contentText =
      msg.text ||
      msg.caption ||
      "<i>Media</i>";

    // Send info + text to owner
    await ctx.telegram.sendMessage(
      ADMIN_ID,
      info +
        contentText +
        `\n\nReply:\n<code>/reply ${from.id} your message</code>`,
      { parse_mode: "HTML" }
    );

    // Forward/copy actual message to owner
    await ctx.copyMessage(ADMIN_ID);

    await ctx.reply("✅ Sent to owner. Wait for reply.");
  } catch (err) {
    console.error("Error in main message handler:", err);
    try {
      await ctx.reply("⚠️ Unexpected error occurred. Please try again or contact " + OWNER_USERNAME);
    } catch (_) {}
  }
});

// ========== Admin reply (support) ==========

bot.command("reply", async (ctx) => {
  try {
    if (ctx.from.id !== ADMIN_ID) return;

    const parts = ctx.message.text.split(" ").slice(1);
    const userId = parts.shift();
    const msg = parts.join(" ");

    if (!userId || !msg)
      return ctx.reply("Usage: /reply <user_id> <message>");

    await ctx.telegram.sendMessage(userId, `💬 ᴏᴡɴᴇʀ: ${msg}`);
    await ctx.reply("✅ Sent to user " + userId);
  } catch (err) {
    console.error("Error in /reply:", err);
    await ctx.reply("⚠️ Failed to send message to that user.");
  }
});

// ========== GLOBAL ERROR HANDLER ==========

bot.catch((err, ctx) => {
  console.error("Global bot error:", err);
  if (ctx && ctx.reply) {
    ctx.reply("⚠️ Unexpected error occurred. Please try again or contact " + OWNER_USERNAME)
      .catch(() => {});
  }
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
      .send("VENOM SUPPORT + MEDIA DISPATCHER ACTIVE");
  } catch (err) {
    console.error("[ERROR] Internal Vercel Handler:", err);
    return res.status(500).send("Internal Error");
  }
};

