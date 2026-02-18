const { Telegraf } = require("telegraf");

/* ======================================================
   VENOM MEDIA DISPATCHER — MULTI-LANGUAGE MIXED CAPTIONS
   Author: VenomDevX
   Mode: English | Hinglish | Tanglish | Dakhni | Mix
   ====================================================== */

// ----------------------- CONFIG ------------------------
const BOT_TOKEN = "8559377355:AAFyjhBcQPBfHvPp7iHvTpvAEbu2NJpq5rw";

// Your Telegram User ID
const ADMIN_ID = 5707956654;

// Target Channels
const TARGET_CHANNELS = [
  -1002762374328, // VENOM LOADER
  -1002683334976, // VENOM FEEDBACK
  -1003537781106, // VENOM FREE MODZ
  -1001858673142, // LEO&KNIGHT CHEAT
  -1003203628581  // 𝐕𝐄𝐍𝐎𝐌 𝐒𝐄𝐑𝐕𝐄𝐑™
];

// ----------------------- RANDOM FORWARD NAMES ------------------------
const FORWARD_NAMES = [
    "Aarush Rathore",
    "Vihaan Reddy",
    "Devansh Kulkarni",
    "Ritvik Chauhan",
    "Adhrit Bansal",
    "Ivaan Pillai",
    "Kairav Sengar",
    "Shaurya Bhadra",
    "Atharv Naidu",
    "Rudransh Shekhawat",
    "Tanishq Solanki",
    "Vivaan Rawat",
    "Arhaat Chatterjee",
    "Lakshya Dangi",
    "Kriday Bhonsle",
    "Vedant Kamat",
    "Prayan Saxena",
    "Abeer Bhattacharya",
    "Darshil Kothari",
    "Nirvaan Hegde",
    "Arinjay Borkar",
    "Yugantar Patil",
    "Satyansh Tripathi",
    "Harvith Gill",
    "Akhilesh Panicker",
    "Ronav Chettiar",
    "Samarjeet Debnath",
    "Ishvak Raut",
    "Shaunak Jadhav",
    "Advaith Gounder",
    "Rithesh Moorthy",
    "Prithvith Ramesh",
    "Aarjit Thakur",
    "Shivansh Barua",
    "Devith Narayanan",
    "Nakul Banerjee",
    "Yuvan Purohit",
    "Arnav Khandelwal",
    "Rudraksh Mahajan",
    "Kanishk Ghosh"
];

// ----------------------- ENGLISH (PURE) ------------------------
const ENGLISH = [
  "Been using 2 months, still safe ✅\n",
  
  "15 kills first game 🔥\nThanks ",
  
  "0.8 to 4.5 KD in 1 month 🚀\nDM ",
  
  "No ban since 3 months 🐉\n legit",
  
  "Smooth aimbot, no recoil 🎯\nHit ",
  
  "Worth every penny 💰\n",
  
  "My duo thinks I'm pro now 🤫\n",
  
  "Free cheats = ban in 24hrs\nVenom = safe 💪\n",
  
  "20 bomb dropped 💣\n",
  
  "Best decision ever ✅\n"
];

// ----------------------- HINGLISH (HINDI + ENGLISH) ------------------------
const HINGLISH = [
  "Bhai solid kaam kar raha 🔥\n",
  
  "10 match khele, 10 MVP 🏆\nThanks ",
  
  "Pehle dar lagta tha ab maza aa raha 😎\n",
  
  "Dosto ne pucha kese pro hua?\nBola  ne kar diya 🤫",
  
  "Free wale try kare the, ban ho gaya\n se 2 mahine safe ✅",
  
  "Kal 18 kills, sab bola hacker\nMaine kaha haan proud hu 😂\n",
  
  "Setup in 2 minutes, kaam shuru ⚡\n bhai",
  
  "Ghar walo ko pata nahi mai hacker hu 🤫\n",
  
  "Streamer ki 15-0 pitti kar di 😂\n OP",
  
  "Jab se yeh use kiya, game badal gaya 🔥\n",
  
  "Ek baar try kar, phir pachtayega 🤷‍♂️\n",
  
  "2 saal bronze tha, 1 hafte mein diamond 🚀\n",
  
  "Baki sab timepass, yeh asli hai 💯\n",
  
  "Package le liya bhai, maza aa gaya 😍\n"
];

// ----------------------- TANGLISH (TAMIL + ENGLISH) ------------------------
const TANGLISH = [
  "Sema level da 🔥\n thaan king 👑",
  
  "15 kills first game la 🎯\nThanks  mapla",
  
  "Namba pro uh 😎\n valiya",
  
  "En duo ku theriyaadhu na hack uh 🤫\n dhaan",
  
  "Free try pannen, ban uh\nVenom la 2 months safe uh 💪\n",
  
  "Aimbot semma smooth uh 🧈\n",
  
  "Nerla iruntha silver uh\nIppa diamond uh 🚀\n thanks",
  
  "Enemies crying in chat 😭\n OP",
  
  "Config worked first try uh 🔧\n",
  
  "Low end phone la lag eh illa 📱\n recommended",
  
  "Vera level da ivaru 🔥\n thaan maamaan",
  
  "Oru vaati try pannu, aprom theriyum 💯\n",
  
  "Main ID safe uh 2 months uh 🛡️\n",
  
  "Paid uh worth uh da 💰\n",
  
  "Nambikkai vai, trust uh 🤝\n"
];

// ----------------------- DAKHNI/URDU MIX ------------------------
const DAKHNI = [
  "Yaar kamaal kar diya 🔥\n bhai",
  
  "15 kills first match mein 🎯\nShukriya ",
  
  "Pehle dar lagta tha, ab maza aa raha hai 😎\n",
  
  "Dosto ne pucha kaise pro hua?\nKaha  ne kar diya 🤫",
  
  "Free wale try kiye the, ban ho gaya\nVenom se 2 mahine safe hoon ✅\n",
  
  "Kal 18 kills, sab bola hacker\nMain kaha haan proud hoon 😂\n",
  
  "Setup 2 minute mein, kaam shuru ⚡\n bhai",
  
  "Ghar walon ko nahi pata main hacker hoon 🤫\n",
  
  "Streamer ki 15-0 pitti kar di 😂\n OP",
  
  "Jab se yeh use kiya, game badal gaya 🔥\n",
  
  "Ek baar try kar ke dekh, pachtayega nahi 💯\n",
  
  "2 saal bronze tha, 1 hafte mein diamond 🚀\n",
  
  "Bakiyan timepass, yeh asli hai 💯\n"
];

// ----------------------- MANGALISH (MALAYALAM + ENGLISH) ------------------------
const MANGALISH = [
  "Sugam ayittundu 🔥\n",
  
  "15 kills first game il 🎯\nThanks ",
  
  "En friends think I'm pro now 😎\n",
  
  "Free cheats try cheythu, ban ayi\nVenom 2 months safe 💪\n",
  
  "Aimbot smooth ayittundu 🧈\n",
  
  "Enemies crying in chat 😭\n OP",
  
  "Config first try il work ayi 🔧\n",
  
  "Low end phone il lag illa 📱\n recommended",
  
  "Vere level annu 🔥\n",
  
  "Onnu try cheyy, pinne theriyum 💯\n"
];

// ----------------------- TELUGLISH (TELUGU + ENGLISH) ------------------------
const TELUGLISH = [
  "Super ga undi 🔥\n",
  
  "15 kills first game lo 🎯\nThanks ",
  
  "Na friends think I'm pro now 😎\n",
  
  "Free cheats try chesa, ban aindi\nVenom 2 months safe 💪\n",
  
  "Aimbot smooth ga undi 🧈\n",
  
  "Enemies crying in chat 😭\n OP",
  
  "Config first try lo work aindi 🔧\n",
  
  "Low end phone lo lag ledu 📱\n recommended",
  
  "Vere level 🔥\n",
  
  "Okasari try chey, tarvata thelustadi 💯\n"
];

// ----------------------- ULTRA SHORT (ALL LANGUAGES MIX) ------------------------
const ULTRA_SHORT = [
  "OP AF 🔥 ",
  "Legit seller ✅ ",
  "Safe for main 🛡️ ",
  "Best in game 🐉 ",
  "No ban since dec 🗓️ ",
  "Aimbot smooth 🧈 ",
  "Hit reg crazy 🎯 ",
  "Worth it 💰 ",
  "Trusted 🤝 ",
  "Game changer 🔥 ",
  "Villain arc 😈 ",
  "EZ wins 🏆 ",
  "Pro ban gaya 😎 ",
  "No skill needed 🎮 ",
  "Domination mode 💀 ",
  "Sema level 🔥 ",
  "Vera level 🔥 ",
  "Super undi 🔥 ",
  "Kamaal hai 🔥 ",
  "Solid hai 🔥 ",
  "Dhansu 🔥 ",
  "Rocks 🔥 "
];

// ----------------------- COMBO (ALL TOGETHER) ------------------------
const ALL_CAPTIONS = [
  ...ENGLISH,
  ...HINGLISH,
  ...TANGLISH,
  ...DAKHNI,
  ...MANGALISH,
  ...TELUGLISH,
  ...ULTRA_SHORT
];

// Shuffle array to mix them well
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Shuffle captions at start
const SHUFFLED_CAPTIONS = shuffleArray([...ALL_CAPTIONS]);

// ----------------------- STATE -------------------------
let waitingBroadcastText = false;

// ----------------------- HELPER FUNCTIONS -------------
function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}

// Get random caption from MIXED pool
function getRandomCaption() {
  const randomIndex = Math.floor(Math.random() * SHUFFLED_CAPTIONS.length);
  return SHUFFLED_CAPTIONS[randomIndex];
}

// Get random forward name
function getRandomForwardName() {
  const randomIndex = Math.floor(Math.random() * FORWARD_NAMES.length);
  return FORWARD_NAMES[randomIndex];
}

// Get language style for preview
function getCaptionStyle(caption) {
  if (TANGLISH.includes(caption)) return "🎯 Tanglish";
  if (HINGLISH.includes(caption)) return "🇮🇳 Hinglish";
  if (DAKHNI.includes(caption)) return "✨ Dakhni";
  if (MANGALISH.includes(caption)) return "🥥 Manglish";
  if (TELUGLISH.includes(caption)) return "🔥 Teluglish";
  if (ULTRA_SHORT.includes(caption)) return "⚡ Ultra Short";
  return "🇬🇧 English";
}

// Get forward info with random name
function getForwardInfo() {
  try {
    const randomName = getRandomForwardName();
    return `<b>📨 Forwarded from</b> ${escapeHtml(randomName)}`;
  } catch (e) {
    console.log("[WARN] getForwardInfo error:", e);
  }
  return "";
}

// Build final caption
function buildFinalCaption(userCaption) {
  const parts = [];
  
  if (userCaption && userCaption.trim().length > 0) {
    parts.push(escapeHtml(userCaption.trim()));
  } else {
    parts.push(getRandomCaption());
  }
  
  const forwardInfo = getForwardInfo();
  if (forwardInfo) {
    parts.push(forwardInfo);
  }
  
  return parts.join("\n\n");
}

// -------------------- BOT INIT -------------------------
const bot = new Telegraf(BOT_TOKEN);

// ----------------------- /start ------------------------
bot.start(async (ctx) => {
  const totalStyles = 7; // English, Hinglish, Tanglish, Dakhni, Manglish, Teluglish, Ultra Short
  
  await ctx.reply(
    "🌍 <b>VENOM — MULTI-LANGUAGE MIXED DISPATCHER</b>\n\n" +
    "<b>✨ SUPPORTS:</b>\n" +
    "🇬🇧 English\n" +
    "🇮🇳 Hinglish (Hindi+English)\n" +
    "🎯 Tanglish (Tamil+English)\n" +
    "✨ Dakhni (Urdu+English)\n" +
    "🥥 Manglish (Malayalam+English)\n" +
    "🔥 Teluglish (Telugu+English)\n" +
    "⚡ Ultra Short (All languages)\n" +
    "🌍 Pan India Mix\n\n" +
    "<b>📸 HOW IT WORKS:</b>\n" +
    "1️⃣ Upload screenshot\n" +
    "2️⃣ Bot adds RANDOM language style\n" +
    "3️⃣ Auto-shares to ALL channels\n" +
    "4️⃣ Shows as FORWARDED from random name\n\n" +
    "<b>Commands:</b>\n" +
    "📤 /broadcast - Text to all channels\n" +
    "📊 /stats - Show caption stats\n" +
    "🔄 /shuffle - Reshuffle captions\n\n" +
    `<b>Total Captions:</b> ${ALL_CAPTIONS.length}\n` +
    `<b>Languages:</b> ${totalStyles}\n` +
    `<b>Channels:</b> ${TARGET_CHANNELS.length}\n` +
    `<b>Forward Names:</b> ${FORWARD_NAMES.length}\n\n` +
    "<b>Admin Only</b> - India ka apna bot! 🚀",
    { parse_mode: "HTML" }
  );
});

// ----------------------- /stats --------------------
bot.command("stats", async (ctx) => {
  if (!ctx.from || ctx.from.id !== ADMIN_ID) return;
  
  await ctx.reply(
    `<b>📊 VENOM BOT STATS</b>\n\n` +
    `<b>Total Captions:</b> ${ALL_CAPTIONS.length}\n` +
    `<b>Shuffled Pool:</b> ${SHUFFLED_CAPTIONS.length}\n` +
    `<b>Forward Names:</b> ${FORWARD_NAMES.length}\n\n` +
    `<b>🌏 LANGUAGE BREAKDOWN:</b>\n` +
    `🇬🇧 English: ${ENGLISH.length}\n` +
    `🇮🇳 Hinglish: ${HINGLISH.length}\n` +
    `🎯 Tanglish: ${TANGLISH.length}\n` +
    `✨ Dakhni: ${DAKHNI.length}\n` +
    `🥥 Manglish: ${MANGALISH.length}\n` +
    `🔥 Teluglish: ${TELUGLISH.length}\n` +
    `⚡ Ultra Short: ${ULTRA_SHORT.length}\n` +
    `<b>Channels:</b> ${TARGET_CHANNELS.length}`,
    { parse_mode: "HTML" }
  );
});

// ----------------------- /shuffle --------------------
bot.command("shuffle", async (ctx) => {
  if (!ctx.from || ctx.from.id !== ADMIN_ID) return;
  
  // Reshuffle captions
  SHUFFLED_CAPTIONS.length = 0;
  SHUFFLED_CAPTIONS.push(...shuffleArray([...ALL_CAPTIONS]));
  
  await ctx.reply(
    `🔄 <b>Captions Reshuffled!</b>\n\n` +
    `New pool ready with ${SHUFFLED_CAPTIONS.length} mixed captions!`,
    { parse_mode: "HTML" }
  );
});

// ----------------------- /broadcast --------------------
bot.command("broadcast", async (ctx) => {
  if (!ctx.from || ctx.from.id !== ADMIN_ID) return;
  
  waitingBroadcastText = true;
  await ctx.reply(
    "<b>📡 Broadcast Mode Active</b>\n\n" +
    "Send text to broadcast to ALL channels",
    { parse_mode: "HTML" }
  );
});

// --------------------- MAIN HANDLER ---------------------
bot.on("message", async (ctx) => {
  const msg = ctx.message;
  
  if (TARGET_CHANNELS.includes(msg.chat.id)) return;
  if (!msg.from || msg.from.id !== ADMIN_ID) return;
  
  // Broadcast text
  if (waitingBroadcastText && msg.text && !msg.text.startsWith("/")) {
    waitingBroadcastText = false;
    
    let ok = 0, fail = 0;
    for (const ch of TARGET_CHANNELS) {
      try {
        await ctx.telegram.sendMessage(ch, msg.text, { parse_mode: "HTML" });
        ok++;
      } catch (error) {
        console.error(`Broadcast failed to ${ch}:`, error);
        fail++;
      }
    }
    
    return ctx.reply(
      `<b>✅ Broadcast Done</b>\n\nSent: ${ok}\nFailed: ${fail}`,
      { parse_mode: "HTML" }
    );
  }
  
  if (msg.text && msg.text.startsWith("/")) return;
  
  // Media handling
  const hasMedia =
    msg.photo || msg.video || msg.document || msg.animation ||
    msg.video_note || msg.voice || msg.audio;
  
  if (!hasMedia) return;
  
  // Processing message
  const processingMsg = await ctx.reply("🌍 Mixing languages... 🎲");
  
  // Get random caption
  const randomCaption = getRandomCaption();
  const captionStyle = getCaptionStyle(randomCaption);
  
  // Build final caption with random forward name
  const caption = buildFinalCaption(msg.caption || "");
  
  // Send to channels
  let sent = 0, failed = 0;
  
  for (const ch of TARGET_CHANNELS) {
    try {
      await ctx.telegram.copyMessage(ch, msg.chat.id, msg.message_id, {
        caption,
        parse_mode: "HTML",
      });
      sent++;
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Failed to send to channel ${ch}:`, error);
      failed++;
    }
  }
  
  // Delete processing message
  await ctx.telegram.deleteMessage(msg.chat.id, processingMsg.message_id).catch(() => {});
  
  // Show success with style info
  const randomForwardName = getRandomForwardName();
  await ctx.reply(
    `✅ <b>Sent to ${sent} channels</b>\n\n` +
    `<b>Style:</b> ${captionStyle}\n` +
    `<b>Forwarded as:</b> ${escapeHtml(randomForwardName)}\n` +
    `<b>Caption:</b> ${randomCaption.split('\n')[0]}...\n\n` +
    `🔄 Next SS gets DIFFERENT language & forward name!`,
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
    res.status(200).send("🌍 VENOM MULTI-LANGUAGE DISPATCHER WITH RANDOM FORWARD NAMES ACTIVE");
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Error");
  }
};

