module.exports = {
	config: {
		name: "nickall",
		aliases: ["nickall"],
		version: "1.0",
		author: "Ismail Meddah",
		countDown: 5,
		role: 1,
		shortDescription: {
			en: "Change everyone's nickname"
		},
		description: {
			en: "Change the nickname of all members in the group."
		},
		category: "group",
		guide: {
			en: "{pn} <nickname>"
		}
	},

	onStart: async function ({
		api,
		event,
		args
	}) {
		try {
			const nickname =
				args.join(" ").trim();

			if (!nickname) {
				return api.sendMessage(
					"𝙀𝙭𝙖𝙢𝙥𝙡𝙚: 𝙣𝙞𝙘𝙠𝙖𝙡𝙡 𝙆𝙞𝙣𝙜",
					event.threadID,
					event.messageID
				);
			}

			const threadInfo =
				await api.getThreadInfo(
					event.threadID
				);

			const participants =
				threadInfo.participantIDs || [];

			const botID =
				api.getCurrentUserID();

			let success = 0;
			let failed = 0;

			for (const userID of participants) {

				// Don't change bot nickname
				if (
					String(userID) ===
					String(botID)
				) {
					continue;
				}

				try {
					await api.changeNickname(
						nickname,
						event.threadID,
						userID
					);

					success++;

					// Small delay
					await new Promise(
						resolve =>
							setTimeout(resolve, 300)
					);

				} catch (error) {
					failed++;
				}
			}

			return api.sendMessage(
				`𝙉𝙞𝙘𝙠𝙣𝙖𝙢𝙚 𝙪𝙥𝙙𝙖𝙩𝙚 𝙘𝙤𝙢𝙥𝙡𝙚𝙩𝙚.\n\n` +
				`𝙉𝙖𝙢𝙚: ${nickname}\n` +
				`𝙎𝙪𝙘𝙘𝙚𝙨𝙨: ${success}\n` +
				`𝙁𝙖𝙞𝙡𝙚𝙙: ${failed}`,
				event.threadID,
				event.messageID
			);

		} catch (error) {
			console.error(
				"[NICKALL ERROR]",
				error
			);

			return api.sendMessage(
				"𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙪𝙥𝙙𝙖𝙩𝙚 𝙣𝙞𝙘𝙠𝙣𝙖𝙢𝙚𝙨.",
				event.threadID,
				event.messageID
			);
		}
	}
};
