module.exports = {
	config: {
		name: "nickname",
		aliases: ["nick"],
		version: "1.0",
		author: "Ismail Meddah",
		countDown: 3,
		role: 1,
		shortDescription: {
			en: "Change a member's nickname"
		},
		description: {
			en: "Reply to a member's message and use nickname <name>."
		},
		category: "group",
		guide: {
			en: "Reply to a member's message and type: {pn} <name>"
		}
	},

	onStart: async function ({ api, event, args }) {
		try {
			if (!event.messageReply) {
				return api.sendMessage(
					"𝙍𝙚𝙥𝙡𝙮 𝙩𝙤 𝙩𝙝𝙚 𝙢𝙚𝙢𝙗𝙚𝙧'𝙨 𝙢𝙚𝙨𝙨𝙖𝙜𝙚 𝙛𝙞𝙧𝙨𝙩.",
					event.threadID,
					event.messageID
				);
			}

			const nickname = args.join(" ").trim();

			if (!nickname) {
				return api.sendMessage(
					"𝙀𝙭𝙖𝙢𝙥𝙡𝙚: 𝙣𝙞𝙘𝙠𝙣𝙖𝙢𝙚 𝙄𝙨𝙢𝙖𝙞𝙡",
					event.threadID,
					event.messageID
				);
			}

			const userID =
				event.messageReply.senderID;

			await api.changeNickname(
				nickname,
				event.threadID,
				userID
			);

			return api.sendMessage(
				`𝙉𝙞𝙘𝙠𝙣𝙖𝙢𝙚 𝙘𝙝𝙖𝙣𝙜𝙚𝙙 𝙩𝙤: ${nickname}`,
				event.threadID,
				event.messageID
			);

		} catch (error) {
			console.error(
				"[NICKNAME ERROR]",
				error
			);

			return api.sendMessage(
				"𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙘𝙝𝙖𝙣𝙜𝙚 𝙩𝙝𝙚 𝙣𝙞𝙘𝙠𝙣𝙖𝙢𝙚.",
				event.threadID,
				event.messageID
			);
		}
	}
};
