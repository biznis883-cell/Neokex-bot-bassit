module.exports = {
  config: {
    name: "notification",
    version: "1.0",
    author: "Bassit",
    countDown: 1,
    role: 2,
    category: "system",
    guide: {
      en: "{pn} on\n{pn} off"
    }
  },

  onStart: async function ({ message, args }) {
    const action = args[0]?.toLowerCase();

    if (!["on", "off"].includes(action)) {
      return message.reply(
        "⚙️ Notification\n\n" +
        "• Notification on\n" +
        "• Notification off"
      );
    }

    if (action === "on") {
      global.notificationMode = true;

      return message.reply(
        "🔕 Notification: ON\n\n" +
        "The bot will only respond to the owner."
      );
    }

    global.notificationMode = false;

    return message.reply(
      "🔔 Notification: OFF\n\n" +
      "The bot can respond normally again."
    );
  }
};
