module.exports = {
  config: {
    name: "notification",
    version: "2.0",
    author: "Bassit",
    countDown: 1,
    role: 2,
    category: "system",
    guide: {
      en: "{pn} on | off"
    }
  },

  // تشغيل / إيقاف Notification
  onStart: async function ({ message, args }) {
    const action = args[0]?.toLowerCase();

    if (!["on", "off"].includes(action)) {
      return message.reply(
        "🔔 Notification\n\n" +
        "• notification on\n" +
        "• notification off"
      );
    }

    // إنشاء المتغير إذا لم يكن موجوداً
    global.notificationMode ??= false;

    if (action === "on") {
      global.notificationMode = true;

      return message.reply(
        "🔕 Notification ON\n\n" +
        "Only the bot owner can use the bot now."
      );
    }

    global.notificationMode = false;

    return message.reply(
      "🔔 Notification OFF\n\n" +
      "Everyone can use the bot again."
    );
  },

  // منع الرسائل من الوصول للأوامر
  onChat: async function ({ event }) {
    if (!global.notificationMode) return;

    const ownerIDs =
      global.GoatBot?.config?.adminBot || [];

    const senderID = String(event.senderID);

    const isOwner = ownerIDs
      .map(id => String(id))
      .includes(senderID);

    // إذا ماشي المالك → وقف معالجة الرسالة
    if (!isOwner) {
      return;
    }
  }
};
