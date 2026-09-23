module.exports = {
	config: {
		name: "groupname",
		version: "1.0",
		author: "Ismail Meddah",
		countDown: 5,
		role: 1,
		category: "box chat",
		shortDescription: {
			en: "Change the group name"
		},
		description: {
			en: "Change the current group name to the provided text."
		},
		guide: {
			en: "{pn} <new group name>"
		}
	},

	onStart: async function ({ api, event, args }) {
		const newName = args.join(" ").trim();

		if (!newName) {
			return api.sendMessage(
				"𝙋𝙡𝙚𝙖𝙨𝙚 𝙚𝙣𝙩𝙚𝙧 𝙖 𝙣𝙚𝙬 𝙜𝙧𝙤𝙪𝙥 𝙣𝙖𝙢𝙚.\n\n𝙀𝙭𝙖𝙢𝙥𝙡𝙚: 𝙜𝙧𝙤𝙪𝙥𝙣𝙖𝙢𝙚 𝘽𝘼𝙎𝙎𝙄𝙏 𝙁𝘼𝙈𝙄𝙇𝙔",
				event.threadID
			);
		}

		try {
			await api.setTitle(newName, event.threadID);

			return api.sendMessage(
				`𝙂𝙧𝙤𝙪𝙥 𝙣𝙖𝙢𝙚 𝙪𝙥𝙙𝙖𝙩𝙚𝙙 𝙨𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮! 👑\n\n𝙉𝙚𝙬 𝙣𝙖𝙢𝙚: ${newName}`,
				event.threadID
			);
		} catch (error) {
			return api.sendMessage(
				"𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙘𝙝𝙖𝙣𝙜𝙚 𝙩𝙝𝙚 𝙜𝙧𝙤𝙪𝙥 𝙣𝙖𝙢𝙚. 𝙈𝙖𝙠𝙚 𝙨𝙪𝙧𝙚 𝙩𝙝𝙚 𝙗𝙤𝙩 𝙝𝙖𝙨 𝙥𝙚𝙧𝙢𝙞𝙨𝙨𝙞𝙤𝙣 𝙩𝙤 𝙘𝙝𝙖𝙣𝙜𝙚 𝙩𝙝𝙚 𝙜𝙧𝙤𝙪𝙥 𝙣𝙖𝙢𝙚.",
				event.threadID
			);
		}
	}
};
