module.exports = {
	config: {
		name: "نكح",
		aliases: ["nk7", "nkah"],
		version: "1.0",
		author: "Ismail Meddah",
		countDown: 2,
		role: 0,
		category: "fun",
		shortDescription: {
			en: "Split a replied message word by word"
		},
		description: {
			en: "Reply to a message and use this command to send each word separately."
		},
		guide: {
			en: "Reply to a message and type {pn}"
		}
	},

	onStart: async function ({ api, event }) {
		try {
			if (!event.messageReply) {
				return api.sendMessage(
					"𝙋𝙡𝙚𝙖𝙨𝙚 𝙧𝙚𝙥𝙡𝙮 𝙩𝙤 𝙖 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙖𝙣𝙙 𝙪𝙨𝙚 𝙩𝙝𝙚 𝙘𝙤𝙢𝙢𝙖𝙣𝙙.",
					event.threadID,
					event.messageID
				);
			}

			const text = event.messageReply.body;

			if (!text || !text.trim()) {
				return api.sendMessage(
					"𝙏𝙝𝙚 𝙧𝙚𝙥𝙡𝙞𝙚𝙙 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙙𝙤𝙚𝙨 𝙣𝙤𝙩 𝙘𝙤𝙣𝙩𝙖𝙞𝙣 𝙖𝙣𝙮 𝙩𝙚𝙭𝙩.",
					event.threadID,
					event.messageID
				);
			}

			// Split the message into individual words
			const words = text
				.trim()
				.split(/\s+/)
				.filter(Boolean);

			for (const word of words) {
				await new Promise(resolve => {
					api.sendMessage(
						word,
						event.threadID,
						() => resolve()
					);
				});

				// Small delay between messages
				await new Promise(resolve =>
					setTimeout(resolve, 350)
				);
			}

		} catch (error) {
			console.error("[NKAH ERROR]", error);

			return api.sendMessage(
				"𝙎𝙤𝙢𝙚𝙩𝙝𝙞𝙣𝙜 𝙬𝙚𝙣𝙩 𝙬𝙧𝙤𝙣𝙜.",
				event.threadID,
				event.messageID
			);
		}
	}
};
