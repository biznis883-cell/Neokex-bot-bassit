module.exports = {
	config: {
		name: "protect",
		version: "2.0",
		author: "Ismail Meddah",
		countDown: 3,
		role: 1,
		category: "box chat",
		shortDescription: {
			en: "Protect the group"
		},
		description: {
			en: "Protect the group name, group photo and member nicknames."
		},
		guide: {
			en: "{pn} on | off | status"
		}
	},

	onStart: async function ({ api, event, args }) {
		const threadID = event.threadID;
		const action = (args[0] || "").toLowerCase();

		if (!global.protectData) {
			global.protectData = new Map();
		}

		if (!action || !["on", "off", "status"].includes(action)) {
			return api.sendMessage(
				"𝙐𝙨𝙖𝙜𝙚:\n\n" +
				"𝙥𝙧𝙤𝙩𝙚𝙘𝙩 𝙤𝙣 — 𝙀𝙣𝙖𝙗𝙡𝙚 𝙥𝙧𝙤𝙩𝙚𝙘𝙩𝙞𝙤𝙣\n" +
				"𝙥𝙧𝙤𝙩𝙚𝙘𝙩 𝙤𝙛𝙛 — 𝘿𝙞𝙨𝙖𝙗𝙡𝙚 𝙥𝙧𝙤𝙩𝙚𝙘𝙩𝙞𝙤𝙣\n" +
				"𝙥𝙧𝙤𝙩𝙚𝙘𝙩 𝙨𝙩𝙖𝙩𝙪𝙨 — 𝘾𝙝𝙚𝙘𝙠 𝙨𝙩𝙖𝙩𝙪𝙨",
				threadID
			);
		}

		if (action === "off") {
			global.protectData.delete(threadID);

			return api.sendMessage(
				"🛡️ 𝙋𝙧𝙤𝙩𝙚𝙘𝙩𝙞𝙤𝙣 𝙙𝙞𝙨𝙖𝙗𝙡𝙚𝙙.",
				threadID
			);
		}

		if (action === "status") {
			const data = global.protectData.get(threadID);

			return api.sendMessage(
				data
					? "🛡️ 𝙋𝙧𝙤𝙩𝙚𝙘𝙩𝙞𝙤𝙣: 𝙀𝙉𝘼𝘽𝙇𝙀𝘿\n\n" +
					  "𝙂𝙧𝙤𝙪𝙥 𝙉𝙖𝙢𝙚: ✅\n" +
					  "𝙂𝙧𝙤𝙪𝙥 𝙋𝙝𝙤𝙩𝙤: ✅\n" +
					  "𝙉𝙞𝙘𝙠𝙣𝙖𝙢𝙚𝙨: ✅"
					: "🛡️ 𝙋𝙧𝙤𝙩𝙚𝙘𝙩𝙞𝙤𝙣: 𝘿𝙄𝙎𝘼𝘽𝙇𝙀𝘿.",
				threadID
			);
		}

		// Enable protection
		try {
			const threadInfo = await api.getThreadInfo(threadID);

			const botID = api.getCurrentUserID();

			global.protectData.set(threadID, {
				enabled: true,
				groupName: threadInfo.threadName || "",
				imageSrc: threadInfo.imageSrc || "",
				nicknames: { ...(threadInfo.nicknames || {}) },
				botID
			});

			return api.sendMessage(
				"🛡️ 𝙋𝙍𝙊𝙏𝙀𝘾𝙏𝙄𝙊𝙉 𝙀𝙉𝘼𝘽𝙇𝙀𝘿\n\n" +
				"𝙂𝙧𝙤𝙪𝙥 𝙉𝙖𝙢𝙚: ✅\n" +
				"𝙂𝙧𝙤𝙪𝙥 𝙋𝙝𝙤𝙩𝙤: ✅\n" +
				"𝙉𝙞𝙘𝙠𝙣𝙖𝙢𝙚𝙨: ✅",
				threadID
			);
		} catch (error) {
			console.error("[PROTECT ENABLE ERROR]", error);

			return api.sendMessage(
				"❌ 𝙁𝙖𝙞𝙡𝙚𝙙 𝙩𝙤 𝙚𝙣𝙖𝙗𝙡𝙚 𝙥𝙧𝙤𝙩𝙚𝙘𝙩𝙞𝙤𝙣.",
				threadID
			);
		}
	},

	onEvent: async function ({ api, event }) {
		if (!global.protectData) return;

		const threadID = event.threadID;
		const data = global.protectData.get(threadID);

		if (!data || !data.enabled) return;

		try {
			const info = await api.getThreadInfo(threadID);

			// =========================
			// GROUP NAME PROTECTION
			// =========================
			if (
				data.groupName &&
				info.threadName &&
				info.threadName !== data.groupName
			) {
				await api.setTitle(data.groupName, threadID);

				console.log(
					`[PROTECT] Restored group name in ${threadID}`
				);
			}

			// =========================
			// NICKNAME PROTECTION
			// =========================
			if (data.nicknames && info.nicknames) {
				for (const [userID, oldNickname] of Object.entries(data.nicknames)) {
					const currentNickname = info.nicknames[userID];

					if (
						currentNickname !== undefined &&
						currentNickname !== oldNickname
					) {
						try {
							await api.changeNickname(
								oldNickname || "",
								threadID,
								userID
							);

							console.log(
								`[PROTECT] Restored nickname for ${userID}`
							);
						} catch (err) {
							console.error(
								`[PROTECT] Nickname restore failed for ${userID}`,
								err
							);
						}
					}
				}
			}

			// =========================
			// UPDATE SAVED DATA
			// =========================
			if (!data.groupName && info.threadName) {
				data.groupName = info.threadName;
			}

			if (!data.nicknames && info.nicknames) {
				data.nicknames = { ...info.nicknames };
			}
		} catch (error) {
			console.error("[PROTECT EVENT ERROR]", error);
		}
	}
};
